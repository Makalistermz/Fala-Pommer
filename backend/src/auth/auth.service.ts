import {
    Injectable,
    UnauthorizedException
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import { UsuariosService } from "../usuarios/usuarios.service";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

const NOMES_MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

const FORMATADOR_MES_SAO_PAULO = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    month: "numeric"
});

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ) {}

    async signIn(email: string, senha: string) {
        const usuario =
            await this.usuariosService.buscarPorEmail(email);

        if (!usuario) {
            throw new UnauthorizedException(
                "E-mail inválido."
            );
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            throw new UnauthorizedException(
                "Senha inválida."
            );
        }

        await this.prisma.login_evento.create({
            data: {
                usuario_id: usuario.id
            }
        });

        const payload = {
            sub: usuario.id,
            tipo: usuario.tipo_usuario
        };

        const accessToken =
            await this.jwtService.signAsync(payload);

        return {
            access_token: accessToken,

            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            }
        };
    }

    async obterLoginsPorMes(ano: number) {
        const inicio = new Date(`${ano}-01-01T00:00:00-03:00`);
        const fim = new Date(`${ano + 1}-01-01T00:00:00-03:00`);

        const logins = await this.prisma.login_evento.findMany({
            where: {
                criado_em: {
                    gte: inicio,
                    lt: fim
                }
            },
            select: {
                criado_em: true
            }
        });

        const quantidades = Array<number>(12).fill(0);

        for (const login of logins) {
            const mesEmSaoPaulo = Number(
                FORMATADOR_MES_SAO_PAULO.format(login.criado_em)
            );

            quantidades[mesEmSaoPaulo - 1] += 1;
        }

        return {
            ano,
            meses: NOMES_MESES.map((nome, indice) => ({
                mes: indice + 1,
                nome,
                quantidade: quantidades[indice]
            }))
        };
    }
}
