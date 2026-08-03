import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
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
                "Um link para redefinir sua senha foi enviado para o seu e-mail."
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

    async redefinirSenha(dados) {
        if (dados.novaSenha !== dados.confirmarNovaSenha) {
            throw new BadRequestException("As senhas não coincidemAs senhas não coincidem");
        }

        const temMinuscula = /[a-z]/.test(dados.senha);
        const temMaiuscula = /[A-Z]/.test(dados.senha);
        const temNumero = /[0-9]/.test(dados.senha);
        const temEspecial = /[^0-9A-Za-z\s]/.test(dados.senha);

        if (!temMinuscula || !temMaiuscula || !temNumero || !temEspecial) {
            throw new BadRequestException("Insira uma senha mais forte contendo letras maiúsculas, minúsculas, números e símbolos")
        }

        const senhaJaExistente = await this.prisma.cadastro.findFirst({
            where: {
                senha: dados.senha
            }
        });

        if (senhaJaExistente) {
            throw new ConflictException("Não adicione senhas antigas");
        }
    }
}
