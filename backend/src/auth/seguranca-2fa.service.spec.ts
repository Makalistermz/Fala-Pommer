import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { Seguranca2faService } from './seguranca-2fa.service';

function criarServico(
  chave = randomBytes(32).toString('base64'),
  jwtSecret = 'segredo-jwt-diferente',
) {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue(chave),
    get: jest.fn().mockReturnValue(jwtSecret),
  } as unknown as ConfigService;

  return new Seguranca2faService(configService);
}

describe('Seguranca2faService', () => {
  it('criptografa e recupera o segredo TOTP', () => {
    const service = criarServico();
    const segredo = 'JBSWY3DPEHPK3PXP';

    const valorCriptografado = service.criptografarSegredoTotp(segredo);

    expect(valorCriptografado).not.toContain(segredo);
    expect(service.descriptografarSegredoTotp(valorCriptografado)).toBe(
      segredo,
    );
  });

  it('usa um IV aleatório em cada criptografia', () => {
    const service = criarServico();
    const segredo = 'JBSWY3DPEHPK3PXP';

    expect(service.criptografarSegredoTotp(segredo)).not.toBe(
      service.criptografarSegredoTotp(segredo),
    );
  });

  it('rejeita um segredo criptografado adulterado', () => {
    const service = criarServico();
    const valorCriptografado =
      service.criptografarSegredoTotp('JBSWY3DPEHPK3PXP');
    const partes = valorCriptografado.split(':');
    const tag = partes[3];
    partes[3] = `${tag.startsWith('A') ? 'B' : 'A'}${tag.slice(1)}`;
    const valorAdulterado = partes.join(':');

    expect(() => service.descriptografarSegredoTotp(valorAdulterado)).toThrow(
      'inválido ou foi adulterado',
    );
  });

  it('exige uma chave Base64 de 32 bytes', () => {
    expect(() => criarServico('chave-invalida')).toThrow(
      'exatamente 32 bytes codificados em Base64',
    );
  });

  it('impede reutilizar JWT_SECRET como chave TOTP', () => {
    const chave = randomBytes(32).toString('base64');

    expect(() => criarServico(chave, chave)).toThrow(
      'deve ser diferente de JWT_SECRET',
    );
  });

  it('armazena e verifica códigos de recuperação com bcrypt', async () => {
    const service = criarServico();
    const codigo = 'ABCD-EFGH-IJKL';

    const codigoHash = await service.gerarHashCodigoRecuperacao(codigo);

    expect(codigoHash).not.toBe(codigo);
    await expect(
      service.verificarCodigoRecuperacao(codigo, codigoHash),
    ).resolves.toBe(true);
    await expect(
      service.verificarCodigoRecuperacao('OUTRO-CODIGO', codigoHash),
    ).resolves.toBe(false);
  });
});
