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

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() dados: LoginDto) {
        return this.authService.signIn(
            dados.email,
            dados.senha
        );
    }
}