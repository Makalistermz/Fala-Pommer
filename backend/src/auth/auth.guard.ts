import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export type JwtPayload = {
    sub: number;
    tipo: "user" | "admin" | "funcionario";
    iat: number;
    exp: number;
};

export type RequisicaoAutenticada = Request & {
    usuario?: JwtPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService
    ) {}

    async canActivate(
        contexto: ExecutionContext
    ): Promise<boolean> {
        const requisicao =
            contexto.switchToHttp().getRequest<RequisicaoAutenticada>();

        const token = this.extrairToken(requisicao);

        if (!token) {
            throw new UnauthorizedException(
                "Token de autenticação não informado."
            );
        }

        try {
            const payload =
                await this.jwtService.verifyAsync<JwtPayload>(token);

            requisicao.usuario = payload;
        } catch {
            throw new UnauthorizedException(
                "Token inválido ou expirado."
            );
        }

        return true;
    }

    private extrairToken(
        requisicao: Request
    ): string | undefined {
        const cabecalho =
            requisicao.headers.authorization;

        const [tipo, token] =
            cabecalho?.split(" ") ?? [];

        if (tipo !== "Bearer") {
            return undefined;
        }

        return token;
    }
}