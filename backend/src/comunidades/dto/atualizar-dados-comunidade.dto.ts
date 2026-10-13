import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AtualizarDadosComunidade {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nome_comunidade!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(400)
    descricao_comunidade!: string;
}