import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
    private readonly transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === "465",

        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    async enviarRecuperacaoSenha(email: string, token: string) {
        try {
            const linkRecuperacao =
                `${process.env.FRONTEND_URL}/redefinir-senha?token=${encodeURIComponent(token)}`;

            this.transporter.sendMail({
                from: `"Fala Pommer" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Recuperação de senha — Fala Pommer",

                text: `
                    Você solicitou a recuperação da sua senha.
                    Acesse o endereço: ${linkRecuperacao}
                `,

                html: `
                    <h2>Recuperação de senha</h2>

                    <p>Recebemos uma solicitação para redefinir sua senha.</p>

                    <p>
                        <a href="${linkRecuperacao}">
                            Redefinir minha senha
                        </a>
                    </p>

                    <p>Se você não fez essa solicitação, ignore este e-mail.</p>
                `
            });
        } catch (erro) {
            console.log("Erro ao enviar o e-mail", erro);
        }
    }
}