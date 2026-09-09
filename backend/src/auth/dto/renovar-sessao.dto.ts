// Valida o refresh token usado para renovar uma sessão persistente.
import { IsString, Matches } from "class-validator";

export class RenovarSessaoDto {
    @IsString()
    @Matches(/^[A-Za-z0-9_-]{86}$/, {
        message: "Refresh token inválido."
    })
    refreshToken!: string;
}
