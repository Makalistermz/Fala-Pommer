import {
    Injectable,
    UnauthorizedException
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import { UsuariosService } from "../usuarios/usuarios.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService
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
}