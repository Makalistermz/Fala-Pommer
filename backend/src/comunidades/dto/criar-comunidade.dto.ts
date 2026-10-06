import { IsNotEmpty, IsString } from "class-validator";

export class CriarComunidadeDto {
    @IsString()
    @IsNotEmpty()
    nome_comunidade!: string;

    @IsString()
    @IsNotEmpty()
    descricao_comunidade!: string;
}