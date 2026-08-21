// Gerencia os desafios da verificação em duas etapas enviada por e-mail.
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import * as bcrypt from 'bcrypt';

import { desafio_2fa_finalidade } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

const DIGITOS_CODIGO = 6;
const VALIDADE_CODIGO_MS = 5 * 60 * 1000;
const INTERVALO_REENVIO_MS = 60 * 1000;
const MAXIMO_TENTATIVAS = 5;
const SALT_ROUNDS = 10;

const MENSAGEM_DESAFIO_INVALIDO = 'O código informado é inválido ou expirou.';

export interface DesafioDoisFatoresCriado {
  token: string;
  codigo: string;
  expiraEm: Date;
}

@Injectable()
export class TwoFactorEmailService {
  constructor(private readonly prisma: PrismaService) {}

  async criarDesafio(
    usuarioId: number,
    finalidade: desafio_2fa_finalidade,
  ): Promise<DesafioDoisFatoresCriado> {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('Usuário inválido.');
    }

    const token = randomBytes(32).toString('hex');
    const codigo = this.gerarCodigo();
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + VALIDADE_CODIGO_MS);

    const tokenHash = this.gerarHashToken(token);
    const codigoHash = await bcrypt.hash(codigo, SALT_ROUNDS);

    await this.prisma.$transaction(async (transacao) => {
      await transacao.desafio_login_2fa.updateMany({
        where: {
          usuario_id: usuarioId,
          finalidade,
          usado_em: null,
        },
        data: {
          usado_em: agora,
        },
      });

      await transacao.desafio_login_2fa.create({
        data: {
          usuario_id: usuarioId,
          finalidade,
          token_hash: tokenHash,
          codigo_hash: codigoHash,
          expira_em: expiraEm,
          ultimo_envio_em: agora,
        },
      });
    });

    return {
      token,
      codigo,
      expiraEm,
    };
  }

  async reenviarCodigo(
    token: string,
    finalidade: desafio_2fa_finalidade,
  ): Promise<Omit<DesafioDoisFatoresCriado, 'token'>> {
    const agora = new Date();
    const tokenHash = this.gerarHashToken(token);

    const desafio = await this.prisma.desafio_login_2fa.findUnique({
      where: {
        token_hash: tokenHash,
      },
    });

    this.validarDesafio(desafio, finalidade, agora);

    const proximoEnvioEm = new Date(
      desafio.ultimo_envio_em.getTime() + INTERVALO_REENVIO_MS,
    );

    if (proximoEnvioEm.getTime() > agora.getTime()) {
      throw new HttpException(
        'Aguarde antes de solicitar outro código.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const codigo = this.gerarCodigo();
    const codigoHash = await bcrypt.hash(codigo, SALT_ROUNDS);
    const expiraEm = new Date(agora.getTime() + VALIDADE_CODIGO_MS);
    const limiteReenvio = new Date(agora.getTime() - INTERVALO_REENVIO_MS);

    const resultado = await this.prisma.desafio_login_2fa.updateMany({
      where: {
        id: desafio.id,
        finalidade,
        usado_em: null,
        expira_em: {
          gt: agora,
        },
        tentativas: {
          lt: MAXIMO_TENTATIVAS,
        },
        ultimo_envio_em: {
          lte: limiteReenvio,
        },
      },
      data: {
        codigo_hash: codigoHash,
        expira_em: expiraEm,
        ultimo_envio_em: agora,
      },
    });

    if (resultado.count !== 1) {
      throw new HttpException(
        'Não foi possível reenviar o código agora.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return {
      codigo,
      expiraEm,
    };
  }

  async verificarCodigo(
    token: string,
    codigo: string,
    finalidade: desafio_2fa_finalidade,
  ): Promise<{ usuarioId: number }> {
    const agora = new Date();
    const tokenHash = this.gerarHashToken(token);

    const desafio = await this.prisma.desafio_login_2fa.findUnique({
      where: {
        token_hash: tokenHash,
      },
    });

    this.validarDesafio(desafio, finalidade, agora);

    const formatoValido = new RegExp(`^\\d{${DIGITOS_CODIGO}}$`).test(codigo);
    const codigoCorreto =
      formatoValido && (await bcrypt.compare(codigo, desafio.codigo_hash));

    if (!codigoCorreto) {
      await this.registrarTentativaInvalida(desafio.id, finalidade, agora);

      throw new UnauthorizedException(MENSAGEM_DESAFIO_INVALIDO);
    }

    const resultado = await this.prisma.desafio_login_2fa.updateMany({
      where: {
        id: desafio.id,
        finalidade,
        usado_em: null,
        expira_em: {
          gt: agora,
        },
        tentativas: {
          lt: MAXIMO_TENTATIVAS,
        },
      },
      data: {
        usado_em: agora,
      },
    });

    if (resultado.count !== 1) {
      throw new UnauthorizedException(MENSAGEM_DESAFIO_INVALIDO);
    }

    return {
      usuarioId: desafio.usuario_id,
    };
  }

  async invalidarDesafiosPendentes(
    usuarioId: number,
    finalidade?: desafio_2fa_finalidade,
  ): Promise<void> {
    await this.prisma.desafio_login_2fa.updateMany({
      where: {
        usuario_id: usuarioId,
        finalidade,
        usado_em: null,
      },
      data: {
        usado_em: new Date(),
      },
    });
  }

  private gerarCodigo(): string {
    return randomInt(0, 10 ** DIGITOS_CODIGO)
      .toString()
      .padStart(DIGITOS_CODIGO, '0');
  }

  private gerarHashToken(token: string): string {
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new UnauthorizedException(MENSAGEM_DESAFIO_INVALIDO);
    }

    return createHash('sha256').update(token).digest('hex');
  }

  private validarDesafio(
    desafio: {
      id: number;
      usuario_id: number;
      finalidade: desafio_2fa_finalidade;
      codigo_hash: string;
      tentativas: number;
      expira_em: Date;
      usado_em: Date | null;
      ultimo_envio_em: Date;
    } | null,
    finalidade: desafio_2fa_finalidade,
    agora: Date,
  ): asserts desafio {
    if (
      !desafio ||
      desafio.finalidade !== finalidade ||
      desafio.usado_em !== null ||
      desafio.expira_em.getTime() <= agora.getTime() ||
      desafio.tentativas >= MAXIMO_TENTATIVAS
    ) {
      throw new UnauthorizedException(MENSAGEM_DESAFIO_INVALIDO);
    }
  }

  private async registrarTentativaInvalida(
    desafioId: number,
    finalidade: desafio_2fa_finalidade,
    agora: Date,
  ): Promise<void> {
    await this.prisma.desafio_login_2fa.updateMany({
      where: {
        id: desafioId,
        finalidade,
        usado_em: null,
        expira_em: {
          gt: agora,
        },
        tentativas: {
          lt: MAXIMO_TENTATIVAS,
        },
      },
      data: {
        tentativas: {
          increment: 1,
        },
      },
    });
  }
}
