// Define as rotas usadas para autenticar os usuários.
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
import { TwoFactorEmailService } from "./two-factor-email.service";
import { SenhaDoisFatoresDto } from "./dto/senha-2fa.dto";
import { CodigoDoisFatoresDto } from "./dto/codigo-2fa.dto";
import { ReenviarDoisFatoresDto } from "./dto/reenviar-2fa.dto";
import { CodigoRecuperacaoDoisFatoresDto } from "./dto/codigo-recuperacao-2fa.dto";
import { TokenDesafioDoisFatoresDto } from "./dto/token-desafio-2fa.dto";
import { DesativarComCodigoRecuperacaoDto } from "./dto/desativar-recuperacao-2fa.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly twoFactorEmailService: TwoFactorEmailService
    ) {}

    @Post("2fa/login/confirm")
    @HttpCode(HttpStatus.OK)
    confirmarLoginDoisFatores(
        @Body() dados: CodigoDoisFatoresDto
    ) {
        return this.authService.confirmarLoginDoisFatores(
            dados.token,
            dados.codigo
        );
    }

    @Post("2fa/login/recovery")
    @HttpCode(HttpStatus.OK)
    confirmarLoginComCodigoRecuperacao(
        @Body() dados: CodigoRecuperacaoDoisFatoresDto
    ) {
        return this.authService.confirmarLoginComCodigoRecuperacao(
            dados.token,
            dados.codigoRecuperacao
        );
    }

    @Post("2fa/login/resend")
    @HttpCode(HttpStatus.OK)
    reenviarCodigoLoginDoisFatores(
        @Body() dados: TokenDesafioDoisFatoresDto
    ) {
        return this.twoFactorEmailService.reenviarCodigoLogin(
            dados.token
        );
    }

    @Get("2fa/status")
    @UseGuards(AuthGuard)
    statusDoisFatores(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.twoFactorEmailService.obterStatus(
            requisicao.usuario!.sub
        );
    }

    @Post("2fa/setup")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    configurarDoisFatores(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: SenhaDoisFatoresDto
    ) {
        return this.twoFactorEmailService.iniciarAtivacao(
            requisicao.usuario!.sub,
            dados.senha
        );
    }

    @Post("2fa/confirm")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    confirmarDoisFatores(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CodigoDoisFatoresDto
    ) {
        return this.twoFactorEmailService.confirmarAtivacao(
            requisicao.usuario!.sub,
            dados.token,
            dados.codigo
        );
    }

    @Post("2fa/disable/request")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    solicitarDesativacaoDoisFatores(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: SenhaDoisFatoresDto
    ) {
        return this.twoFactorEmailService.solicitarDesativacao(
            requisicao.usuario!.sub,
            dados.senha
        );
    }

    @Post("2fa/disable")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    desativarDoisFatores(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CodigoDoisFatoresDto
    ) {
        return this.twoFactorEmailService.confirmarDesativacao(
            requisicao.usuario!.sub,
            dados.token,
            dados.codigo
        );
    }

    @Post("2fa/disable/recovery")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    desativarDoisFatoresComCodigoRecuperacao(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: DesativarComCodigoRecuperacaoDto
    ) {
        return this.twoFactorEmailService.confirmarDesativacaoComCodigoRecuperacao(
            requisicao.usuario!.sub,
            dados.senha,
            dados.codigoRecuperacao
        );
    }

    @Post("2fa/resend")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    reenviarCodigoDoisFatores(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: ReenviarDoisFatoresDto
    ) {
        return this.twoFactorEmailService.reenviarCodigoConfiguracao(
            requisicao.usuario!.sub,
            dados.token,
            dados.finalidade
        );
    }

    @Get("perfil")
    @UseGuards(AuthGuard)
    perfil(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return requisicao.usuario;
    }

    @Get("area-administrativa")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("superAdmin")
    areaAdministrativa() {
        return {
            mensagem: "Bem-vindo à área administrativa."
        };
    }

    @Get("area-prefeitura")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario", "superAdmin")
    areaPrefeitura() {
        return{
            mensagem: "Bem-vindo à área da prefeitura"
        };
    }

    @Get("logins-por-mes")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario", "superAdmin")
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
    @Perfis("admin", "funcionario", "superAdmin")
    obterQuantUsuarios() {
        return this.authService.obterQuantUsuarios();
    }

    @Get("quantidade-usuarios-categoria")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario", "superAdmin")
    obterQuantUsuarioCategoria() {
        return this.authService.obterQuantUsuarioCategoria();
    }

    @Get("relatorios-logs")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario", "superAdmin")
    obterRelatoriosLogs() {
        return this.authService.obterRelatoriosLogs();
    }

    @Get("relatorios-erros")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("superAdmin")
    obterRelatoriosErros() {
        return this.authService.obterRelatoriosErros();
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
