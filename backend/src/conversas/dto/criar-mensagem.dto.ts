// Valida os dados usados para enviar uma mensagem.
import { Transform } from "class-transformer";
import {
    IsNumber,
    IsOptional,
    IsString,
    MaxLength
} from "class-validator";

export class CriarMensagemDto {
    @Transform(({ value }) =>
        typeof value === "string"
        ? value.trim()
        : value
    )
    @IsOptional()
    @IsString()
    @MaxLength(4000)
    conteudo?: string;

    @IsOptional()
    @IsNumber()
    mensagemRespondidaId?: number;
}
