// Valida os dados usados para criar ou atualizar um setor.
import {
    IsInt,
    IsString,
    IsNotEmpty,
    IsPositive
} from "class-validator";
import { Type } from "class-transformer";

export class CriarSetorDTO {
    @IsString()
    @IsNotEmpty()
    setor!: string;

    @IsString()
    @IsNotEmpty()
    sigla_setor!: string;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    secretaria_id!: number;
}
