import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CriarComunidadeDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nome_comunidade!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(400)
    descricao_comunidade!: string;

    @Transform(({ value }) => {
        const valor = value as unknown;

        if (valor === true || valor === "true") return true;
        if (valor === false || valor === "false" || valor === undefined) {
            return false;
        }

        return valor;
    })
    @IsBoolean()
    ocultar_municipes: boolean = false;
}
