// Envia os e-mails usados pelo sistema.
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
                `${process.env.FRONTEND_URL}/RedefinirSenha?token=${encodeURIComponent(token)}`;

            this.transporter.sendMail({
                from: `"Fala Pommer" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Redefinição de senha | Fala Pommer",

                text: `
                Olá,

                Recebemos uma solicitação para redefinir a senha da sua conta no Fala Pommer.

                Acesse o endereço abaixo para criar uma nova senha:

                ${linkRecuperacao}

                Este link expira em 15 minutos e poderá ser utilizado apenas uma vez.

                Se você não solicitou essa alteração, ignore este e-mail. Sua senha continuará a mesma.

                Equipe Fala Pommer
                `,

                html: `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <body
                    style="
                    margin: 0;
                    padding: 0;
                    background-color: #f2f4f7;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #252525;
                    "
                >
                    <div
                    style="
                        display: none;
                        max-height: 0;
                        overflow: hidden;
                        opacity: 0;
                    "
                    >
                    Use este link para redefinir sua senha no Fala Pommer.
                    </div>

                    <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="background-color: #f2f4f7; padding: 40px 16px;"
                    >
                    <tr>
                        <td align="center">
                        <table
                            role="presentation"
                            width="100%"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                            style="
                            max-width: 600px;
                            background-color: #ffffff;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                            "
                        >
                            <tr>
                            <td
                                style="
                                padding: 28px 40px;
                                background-color: #1351b4;
                                color: #ffffff;
                                "
                            >
                                <p
                                style="
                                    margin: 0;
                                    font-size: 22px;
                                    font-weight: 700;
                                "
                                >
                                Fala Pommer
                                </p>

                                <p
                                style="
                                    margin: 6px 0 0;
                                    color: #dbe8ff;
                                    font-size: 14px;
                                "
                                >
                                Comunicação segura e acessível
                                </p>
                            </td>
                            </tr>

                            <tr>
                            <td style="padding: 40px;">
                                <h1
                                style="
                                    margin: 0 0 18px;
                                    color: #1d2939;
                                    font-size: 26px;
                                    line-height: 1.3;
                                "
                                >
                                Redefinição de senha
                                </h1>

                                <p
                                style="
                                    margin: 0 0 16px;
                                    color: #475467;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                                >
                                Olá,
                                </p>

                                <p
                                style="
                                    margin: 0 0 28px;
                                    color: #475467;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                                >
                                Recebemos uma solicitação para redefinir a senha da
                                sua conta. Clique no botão abaixo para criar uma
                                nova senha.
                                </p>

                                <table
                                role="presentation"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="margin: 0 auto 28px;"
                                >
                                <tr>
                                    <td
                                    align="center"
                                    style="
                                        border-radius: 8px;
                                        background-color: #1351b4;
                                    "
                                    >
                                    <a
                                        href="${linkRecuperacao}"
                                        target="_blank"
                                        style="
                                        display: inline-block;
                                        padding: 15px 28px;
                                        color: #ffffff;
                                        font-size: 16px;
                                        font-weight: 700;
                                        text-decoration: none;
                                        "
                                    >
                                        Redefinir minha senha
                                    </a>
                                    </td>
                                </tr>
                                </table>

                                <div
                                style="
                                    margin-bottom: 24px;
                                    padding: 16px;
                                    border: 1px solid #b2ccff;
                                    border-radius: 8px;
                                    background-color: #eff4ff;
                                "
                                >
                                <p
                                    style="
                                    margin: 0;
                                    color: #1849a9;
                                    font-size: 14px;
                                    line-height: 1.5;
                                    "
                                >
                                    Por segurança, este link expira em
                                    <strong>15 minutos</strong> e poderá ser utilizado
                                    apenas uma vez.
                                </p>
                                </div>

                                <p
                                style="
                                    margin: 0 0 8px;
                                    color: #667085;
                                    font-size: 13px;
                                    line-height: 1.5;
                                "
                                >
                                Se o botão não funcionar, copie e cole este endereço
                                no navegador:
                                </p>

                                <p
                                style="
                                    margin: 0 0 28px;
                                    font-size: 13px;
                                    line-height: 1.5;
                                    word-break: break-all;
                                "
                                >
                                <a
                                    href="${linkRecuperacao}"
                                    style="color: #1351b4;"
                                >
                                    ${linkRecuperacao}
                                </a>
                                </p>

                                <p
                                style="
                                    margin: 0;
                                    color: #667085;
                                    font-size: 14px;
                                    line-height: 1.6;
                                "
                                >
                                Se você não solicitou essa alteração, ignore este
                                e-mail. Sua senha continuará a mesma.
                                </p>
                            </td>
                            </tr>

                            <tr>
                            <td
                                style="
                                padding: 24px 40px;
                                background-color: #f8fafc;
                                border-top: 1px solid #eaecf0;
                                text-align: center;
                                "
                            >
                                <p
                                style="
                                    margin: 0;
                                    color: #98a2b3;
                                    font-size: 12px;
                                    line-height: 1.5;
                                "
                                >
                                Esta é uma mensagem automática do Fala Pommer.
                                Não responda a este e-mail.
                                </p>
                            </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    </table>
                </body>
                </html>
                `,
            });
        } catch (erro) {
            console.log("Erro ao enviar o e-mail", erro);
        }
    }
}
