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

const DIFERENCA_UTC_SAO_PAULO_EM_MS = 3 * 60 * 60 * 1000;

function agoraEmSaoPaulo() {
    return new Date(Date.now() - DIFERENCA_UTC_SAO_PAULO_EM_MS);
}

function serializarDataDeSaoPaulo(data: Date | null) {
    if (!data) {
        return null;
    }

    return `${data.toISOString().slice(0, -1)}-03:00`;
}

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
                usuario_id: usuario.id,
                criado_em: agoraEmSaoPaulo()
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

    async obterQuantUsuarios() {
        const total = await this.prisma.cadastro.count();
        return total;
    }

    async obterQuantUsuarioCategoria() {
        const resultado = await this.prisma.cadastro.groupBy({
            by: ['tipo_usuario'],
            _count: {
                id: true,
            },
        });

        return resultado;
    }

    async registrarSaida(usuarioId: number) {
        const acessoAberto = await this.prisma.login_evento.findFirst({
            where: {
                usuario_id: usuarioId,
                saiu_em: null
            },
            orderBy: {
                criado_em: "desc"
            },
            select: {
                id: true
            }
        });

        if (!acessoAberto) {
            return {
                mensagem: "Nenhum acesso aberto encontrado."
            };
        }

        await this.prisma.login_evento.update({
            where: {
                id: acessoAberto.id
            },
            data: {
                saiu_em: agoraEmSaoPaulo()
            }
        });

        return {
            mensagem: "Saída registrada com sucesso."
        };
    }

    async obterRelatoriosLogs() {
        const acessos = await this.prisma.login_evento.findMany({
            orderBy: {
                criado_em: "desc"
            },
            select: {
                id: true,
                criado_em: true,
                saiu_em: true,
                cadastro: {
                    select: {
                        nome: true,
                        tipo_usuario: true
                    }
                }
            }
        });

        return acessos.map((acesso) => ({
            id: acesso.id,
            usuario: acesso.cadastro.nome,
            tipoUsuario: acesso.cadastro.tipo_usuario,
            entrada: serializarDataDeSaoPaulo(acesso.criado_em),
            saida: serializarDataDeSaoPaulo(acesso.saiu_em)
        }));
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
