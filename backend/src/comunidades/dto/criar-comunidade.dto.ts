import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CriarComunidadeDto {
    @IsString()
    @IsNotEmpty()
    nome_comunidade!: string;

    @IsString()
    @IsNotEmpty()
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
