jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'JBSWY3DPEHPK3PXP'),
  generateURI: jest.fn(
    ({ issuer, label, secret }) =>
      `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}` +
      `?secret=${secret}&issuer=${encodeURIComponent(issuer)}`,
  ),
  generate: jest.fn(async () => '123456'),
  verify: jest.fn(async ({ token, afterTimeStep }) =>
    token === '123456' && (afterTimeStep === undefined || afterTimeStep < 12345)
      ? { valid: true, delta: 0, epoch: 370350, timeStep: 12345 }
      : { valid: false },
  ),
}));

import { ConfigService } from '@nestjs/config';
import { generate } from 'otplib';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Seguranca2faService } from './seguranca-2fa.service';
import { TwoFactorService } from './two-factor.service';

type RegistroTotp = {
  usuario_id: number;
  segredo_criptografado: string;
  ativo: boolean;
  confirmado_em: Date | null;
  ultimo_passo_utilizado: bigint | null;
  atualizado_em: Date;
};

type RegistroRecuperacao = {
  id: number;
  usuario_id: number;
  codigo_hash: string;
  usado_em: Date | null;
};

function criarContexto() {
  let autenticacao: RegistroTotp | null = null;
  let codigosRecuperacao: RegistroRecuperacao[] = [];

  const prisma = {
    autenticacao_totp: {
      upsert: jest.fn(async ({ create, update }) => {
        autenticacao = autenticacao
          ? { ...autenticacao, ...update }
          : {
              ...create,
              confirmado_em: null,
              ultimo_passo_utilizado: null,
            };
        return autenticacao;
      }),
      findUnique: jest.fn(async () =>
        autenticacao ? { ...autenticacao } : null,
      ),
      updateMany: jest.fn(async ({ where, data }) => {
        if (
          !autenticacao ||
          autenticacao.usuario_id !== where.usuario_id ||
          autenticacao.ativo !== where.ativo ||
          autenticacao.ultimo_passo_utilizado !== where.ultimo_passo_utilizado
        ) {
          return { count: 0 };
        }

        autenticacao = { ...autenticacao, ...data };
        return { count: 1 };
      }),
    },
    codigo_recuperacao_2fa: {
      deleteMany: jest.fn(async ({ where }) => {
        const quantidadeAnterior = codigosRecuperacao.length;
        codigosRecuperacao = codigosRecuperacao.filter(
          (registro) => registro.usuario_id !== where.usuario_id,
        );
        return { count: quantidadeAnterior - codigosRecuperacao.length };
      }),
      createMany: jest.fn(async ({ data }) => {
        codigosRecuperacao = data.map((registro, indice) => ({
          id: indice + 1,
          ...registro,
          usado_em: null,
        }));
        return { count: data.length };
      }),
      findMany: jest.fn(async ({ where }) =>
        codigosRecuperacao
          .filter(
            (registro) =>
              registro.usuario_id === where.usuario_id &&
              registro.usado_em === null,
          )
          .map(({ id, codigo_hash }) => ({ id, codigo_hash })),
      ),
      updateMany: jest.fn(async ({ where, data }) => {
        const registro = codigosRecuperacao.find(
          (item) => item.id === where.id && item.usado_em === null,
        );

        if (!registro) {
          return { count: 0 };
        }

        registro.usado_em = data.usado_em;
        return { count: 1 };
      }),
    },
    $transaction: jest.fn(async (operacoes) => Promise.all(operacoes)),
  };

  const chave = randomBytes(32).toString('base64');
  const configService = {
    getOrThrow: jest.fn().mockReturnValue(chave),
    get: jest.fn().mockReturnValue('jwt-diferente'),
  } as unknown as ConfigService;
  const seguranca = new Seguranca2faService(configService);
  const service = new TwoFactorService(
    prisma as unknown as PrismaService,
    seguranca,
  );

  return {
    service,
    prisma,
    obterAutenticacao: () => autenticacao,
    ativarSemConfirmacao: () => {
      if (!autenticacao) {
        throw new Error('Configuração TOTP ausente no teste.');
      }
      autenticacao.ativo = true;
      autenticacao.ultimo_passo_utilizado = null;
    },
    obterCodigosRecuperacao: () => codigosRecuperacao,
  };
}

describe('TwoFactorService', () => {
  it('gera segredo, URI, QR Code e armazena somente o segredo criptografado', async () => {
    const contexto = criarContexto();

    const configuracao = await contexto.service.criarConfiguracao(
      1,
      'usuario@example.com',
    );
    const registro = contexto.obterAutenticacao();

    expect(configuracao.segredo).toMatch(/^[A-Z2-7]+$/);
    expect(configuracao.otpauthUrl).toContain('otpauth://totp/');
    expect(configuracao.otpauthUrl).toContain('issuer=Fala%20Pommer');
    expect(configuracao.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(registro?.segredo_criptografado).not.toContain(configuracao.segredo);
    expect(
      contexto.service.descriptografarSegredo(registro!.segredo_criptografado),
    ).toBe(configuracao.segredo);
  });

  it('confirma a configuração e rejeita a reutilização do mesmo TOTP', async () => {
    const contexto = criarContexto();
    const configuracao = await contexto.service.criarConfiguracao(
      1,
      'usuario@example.com',
    );
    const codigo = await generate({
      secret: configuracao.segredo,
      period: 30,
    });

    await expect(
      contexto.service.confirmarConfiguracao(1, codigo),
    ).resolves.toBe(true);
    expect(contexto.obterAutenticacao()?.ativo).toBe(true);
    await expect(contexto.service.verificarCodigo(1, codigo)).resolves.toBe(
      false,
    );
  });

  it('aceita apenas uma de duas verificações simultâneas do mesmo TOTP', async () => {
    const contexto = criarContexto();
    const configuracao = await contexto.service.criarConfiguracao(
      1,
      'usuario@example.com',
    );
    contexto.ativarSemConfirmacao();
    const codigo = await generate({
      secret: configuracao.segredo,
      period: 30,
    });

    const resultados = await Promise.all([
      contexto.service.verificarCodigo(1, codigo),
      contexto.service.verificarCodigo(1, codigo),
    ]);

    expect(resultados.sort()).toEqual([false, true]);
  });

  it('gera hashes bcrypt e permite consumir cada código de recuperação uma vez', async () => {
    const contexto = criarContexto();
    await contexto.service.criarConfiguracao(1, 'usuario@example.com');
    contexto.ativarSemConfirmacao();

    const codigos = await contexto.service.gerarCodigosRecuperacao(1, 3);
    const registros = contexto.obterCodigosRecuperacao();

    expect(new Set(codigos).size).toBe(3);
    expect(
      codigos.every((codigo) =>
        /^[A-F0-9]{4}(?:-[A-F0-9]{4}){4}$/.test(codigo),
      ),
    ).toBe(true);
    expect(
      registros.every((registro) => registro.codigo_hash.startsWith('$2')),
    ).toBe(true);
    expect(registros.map((registro) => registro.codigo_hash)).not.toEqual(
      expect.arrayContaining(codigos),
    );
    await expect(
      contexto.service.consumirCodigoRecuperacao(1, codigos[0]),
    ).resolves.toBe(true);
    await expect(
      contexto.service.consumirCodigoRecuperacao(1, codigos[0]),
    ).resolves.toBe(false);
  });
});
