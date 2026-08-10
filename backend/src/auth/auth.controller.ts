import {
    Body,
    Controller,
    BadRequestException,
    HttpCode,
    HttpStatus,
    Post,
    Get,
    Req,
    Query,
    UseGuards
} from "@nestjs/common";

import { AuthGuard } from "./auth.guard";

import type {
    RequisicaoAutenticada
} from "./auth.guard";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Perfis } from "./decorators/perfis.decorator";
import { PerfisGuard } from "./guards/perfis.guard";
import { get } from "http";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Get("perfil")
    @UseGuards(AuthGuard)
    perfil(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return requisicao.usuario;
    }

    @Get("area-administrativa")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin")
    areaAdministrativa() {
        return {
            mensagem: "Bem-vindo à área administrativa."
        };
    }

    @Get("area-prefeitura")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario")
    areaPrefeitura() {
        return{
            mensagem: "Bem-vindo à área da prefeitura"
        };
    }

    @Get("logins-por-mes")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario")
    loginsPorMes(@Query("ano") ano?: string) {
        const anoAtual = Number(
            new Intl.DateTimeFormat("pt-BR", {
                timeZone: "America/Sao_Paulo",
                year: "numeric"
            }).format(new Date())
        );
        const anoInformado = ano === undefined
            ? anoAtual
            : Number(ano);

        if (
            !Number.isInteger(anoInformado) ||
            anoInformado < 2000 ||
            anoInformado > anoAtual + 1
        ) {
            throw new BadRequestException("Ano inválido.");
        }

        return this.authService.obterLoginsPorMes(anoInformado);
    }

    @Get("quantidade-usuarios")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario")
    obterQuantUsuarios() {
        return this.authService.obterQuantUsuarios();
    }

    @Get("quantidade-usuarios-categoria")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario")
    obterQuantUsuarioCategoria() {
        return this.authService.obterQuantUsuarioCategoria();
    }

    @Get("relatorios-logs")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario")
    obterRelatoriosLogs() {
        return this.authService.obterRelatoriosLogs();
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    logout(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.authService.registrarSaida(
            requisicao.usuario!.sub
        );
    }

    @Get("area-municipe")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("user")
    areaMunicipe() {
        return {
            mensagem: "Bem-vindo à área do municipe"
        }
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() dados: LoginDto) {
        return this.authService.signIn(
            dados.email,
            dados.senha
        );
    }
}
