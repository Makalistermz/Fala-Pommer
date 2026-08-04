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

@Module({
    imports: [
        UsuariosModule,
        ConfigModule,

        JwtModule.registerAsync({
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
    providers: [AuthService, AuthGuard, PerfisGuard],
    exports: [AuthService, AuthGuard, PerfisGuard]
})
export class AuthModule {}