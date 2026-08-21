import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Seguranca2faService } from './seguranca-2fa.service';

const EMISSOR = 'Fala Pommer';
const PERIODO_SEGUNDOS = 30;
const TOLERANCIA_SEGUNDOS: [number, number] = [
    PERIODO_SEGUNDOS,
    PERIODO_SEGUNDOS,
];
const QUANTIDADE_PADRAO_CODIGOS_RECUPERACAO = 10;
const QUANTIDADE_MAXIMA_CODIGOS_RECUPERACAO = 20;

export type ConfiguracaoTwoFactor = {
    segredo: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
};

@Injectable()
export class TwoFactorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly seguranca2fa: Seguranca2faService,
    ) {}

    async criarConfiguracao(
        usuarioId: number,
        identificador: string,
    ): Promise<ConfiguracaoTwoFactor> {
        const label = identificador.trim();

        if (!label) {
            throw new Error('O identificador do usuário não pode ser vazio.');
        }

        const segredo = generateSecret();
        const otpauthUrl = generateURI({
            issuer: EMISSOR,
            label,
            secret: segredo,
            algorithm: 'sha1',
            digits: 6,
            period: PERIODO_SEGUNDOS,
        });
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 280,
        });
        const segredoCriptografado = this.criptografarSegredo(segredo);
        const agora = new Date();

        await this.prisma.$transaction([
            this.prisma.autenticacao_totp.upsert({
                where: { usuario_id: usuarioId },
                create: {
                    usuario_id: usuarioId,
                    segredo_criptografado: segredoCriptografado,
                    ativo: false,
                    atualizado_em: agora,
                },
                update: {
                    segredo_criptografado: segredoCriptografado,
                    ativo: false,
                    confirmado_em: null,
                    ultimo_passo_utilizado: null,
                    atualizado_em: agora,
                },
            }),
            this.prisma.codigo_recuperacao_2fa.deleteMany({
                where: { usuario_id: usuarioId },
            }),
        ]);

        return { segredo, otpauthUrl, qrCodeDataUrl };
    }

    async confirmarConfiguracao(usuarioId: number, codigo: string) {
        return this.verificarEConsumirCodigo(usuarioId, codigo, 'confirmacao');
    }

    async verificarCodigo(usuarioId: number, codigo: string) {
        return this.verificarEConsumirCodigo(usuarioId, codigo, 'login');
    }

    criptografarSegredo(segredo: string) {
        return this.seguranca2fa.criptografarSegredoTotp(segredo);
    }

    descriptografarSegredo(segredoCriptografado: string) {
        return this.seguranca2fa.descriptografarSegredoTotp(segredoCriptografado);
    }

    async gerarCodigosRecuperacao(
        usuarioId: number,
        quantidade = QUANTIDADE_PADRAO_CODIGOS_RECUPERACAO,
    ): Promise<string[]> {
        if (
            !Number.isInteger(quantidade) ||
            quantidade < 1 ||
            quantidade > QUANTIDADE_MAXIMA_CODIGOS_RECUPERACAO
        ) {
            throw new Error(
                `A quantidade de códigos deve estar entre 1 e ${QUANTIDADE_MAXIMA_CODIGOS_RECUPERACAO}.`,
            );
        }

        const autenticacao = await this.prisma.autenticacao_totp.findUnique({
            where: { usuario_id: usuarioId },
            select: { ativo: true },
        });

        if (!autenticacao?.ativo) {
            throw new Error(
                'A autenticação em duas etapas deve estar ativa para gerar códigos de recuperação.',
            );
        }

        const codigos = Array.from({ length: quantidade }, () =>
            this.gerarCodigoRecuperacao(),
        );
        const hashes = await Promise.all(
            codigos.map((codigo) =>
            this.seguranca2fa.gerarHashCodigoRecuperacao(codigo),
            ),
        );

        await this.prisma.$transaction([
            this.prisma.codigo_recuperacao_2fa.deleteMany({
            where: { usuario_id: usuarioId },
            }),
            this.prisma.codigo_recuperacao_2fa.createMany({
            data: hashes.map((codigoHash) => ({
                usuario_id: usuarioId,
                codigo_hash: codigoHash,
            })),
            }),
        ]);

        return codigos;
    }

    async consumirCodigoRecuperacao(usuarioId: number, codigo: string) {
        const codigoNormalizado = codigo.trim().toUpperCase();

        if (!codigoNormalizado) {
            return false;
        }

        const codigosDisponiveis =
        await this.prisma.codigo_recuperacao_2fa.findMany({
            where: {
                usuario_id: usuarioId,
                usado_em: null,
            },
            select: {
                id: true,
                codigo_hash: true,
            },
        });
        const resultados = await Promise.all(
            codigosDisponiveis.map(async (registro) => ({
                id: registro.id,
                confere: await this.seguranca2fa.verificarCodigoRecuperacao(
                    codigoNormalizado,
                    registro.codigo_hash,
                ),
            })),
        );
        const codigoEncontrado = resultados.find((resultado) => resultado.confere);

        if (!codigoEncontrado) {
            return false;
        }

        const consumido = await this.prisma.codigo_recuperacao_2fa.updateMany({
            where: {
                id: codigoEncontrado.id,
                usado_em: null,
            },
            data: { usado_em: new Date() },
        });

        return consumido.count === 1;
    }

    private async verificarEConsumirCodigo(
        usuarioId: number,
        codigo: string,
        finalidade: 'confirmacao' | 'login',
    ) {
        if (!/^\d{6}$/.test(codigo)) {
            return false;
        }

        const autenticacao = await this.prisma.autenticacao_totp.findUnique({
            where: { usuario_id: usuarioId },
            select: {
                segredo_criptografado: true,
                ativo: true,
                ultimo_passo_utilizado: true,
            },
        });

        if (
            !autenticacao ||
            (finalidade === 'login' && !autenticacao.ativo) ||
            (finalidade === 'confirmacao' && autenticacao.ativo)
        ) {
            return false;
        }

        const segredo = this.descriptografarSegredo(
            autenticacao.segredo_criptografado,
        );
        const ultimoPasso = autenticacao.ultimo_passo_utilizado;
        const resultado = await verify({
            secret: segredo,
            token: codigo,
            algorithm: 'sha1',
            digits: 6,
            period: PERIODO_SEGUNDOS,
            epochTolerance: TOLERANCIA_SEGUNDOS,
            ...(ultimoPasso === null ? {} : { afterTimeStep: Number(ultimoPasso) }),
        });

        if (!resultado.valid || !('timeStep' in resultado)) {
            return false;
        }

        const agora = new Date();
        const atualizado = await this.prisma.autenticacao_totp.updateMany({
            where: {
                usuario_id: usuarioId,
                ativo: finalidade === 'login',
                ultimo_passo_utilizado: ultimoPasso,
            },
            data: {
                ultimo_passo_utilizado: BigInt(resultado.timeStep),
                atualizado_em: agora,
                ...(finalidade === 'confirmacao'
                ? { ativo: true, confirmado_em: agora }
                : {}),
            },
        });

        return atualizado.count === 1;
    }

    private gerarCodigoRecuperacao() {
        return randomBytes(10)
        .toString('hex')
        .toUpperCase()
        .match(/.{1,4}/g)!
        .join('-');
    }
}
