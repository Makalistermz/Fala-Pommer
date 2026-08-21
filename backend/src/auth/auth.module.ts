// Registra os recursos usados no módulo de autenticação.
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import {
    ConfigModule,
    ConfigService
} from "@nestjs/config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsuariosModule } from "../usuarios/usuarios.module";
import { AuthGuard } from "./auth.guard";
import { PerfisGuard } from "./guards/perfis.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { Seguranca2faService } from "./seguranca-2fa.service";
import { TwoFactorService } from "./two-factor.service";

@Module({
    imports: [
        UsuariosModule,
        PrismaModule,
        ConfigModule,

        JwtModule.registerAsync({
            global: true,

            inject: [ConfigService],

            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>(
                    "JWT_SECRET"
                ),

                signOptions: {
                    expiresIn: 60 * 60
                }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, PerfisGuard, Seguranca2faService, TwoFactorService],
    exports: [AuthService, AuthGuard, PerfisGuard, Seguranca2faService, TwoFactorService]
})
export class AuthModule {}
