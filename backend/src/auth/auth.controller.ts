import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Get,
    Req,
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

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() dados: LoginDto) {
        return this.authService.signIn(
            dados.email,
            dados.senha
        );
    }
}