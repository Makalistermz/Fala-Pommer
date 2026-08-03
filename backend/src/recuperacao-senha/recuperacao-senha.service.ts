import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";


@Injectable()
export class RecuperacaoSenhaService {
    constructor(
            private readonly prisma: PrismaService,
            private readonly emailService: EmailService
        ) {}
    async solicitarRecuperacao(email: string) {

        const mensagemPadrao = {
            mensagem:
                "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
        };

        const usuario = await this.prisma.cadastro.findFirst({
            where: {
                email: email
            },
            select: {
                id: true,
                email: true
            }
        });

        if (!usuario) {
            return mensagemPadrao;
        }

        const token = randomBytes(32).toString("hex");

        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const expiracao = new Date(Date.now() + 15 * 60 * 1000);

        await this.prisma.cadastro.update({
            where: {
                id: usuario.id
            },
            data: {
                token_recuperacao: tokenHash,
                token_recuperacao_expira_em: expiracao
            }
        });

        await this.emailService.enviarRecuperacaoSenha(
            usuario.email,
            token
        );

        return mensagemPadrao;
    }
}
