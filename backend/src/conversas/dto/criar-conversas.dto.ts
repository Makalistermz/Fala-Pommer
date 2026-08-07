import { IsInt, Min } from "class-validator";

export class CriarConversaDto {
    @IsInt()
    @Min(1)
    usuarioId!: number;
}