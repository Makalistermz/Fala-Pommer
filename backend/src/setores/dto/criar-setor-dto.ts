import {
    IsString,
    IsNotEmpty
} from "class-validator";

export class CriarSetorDTO {
    @IsString()
    @IsNotEmpty()
    setor!: string;

    @IsString()
    @IsNotEmpty()
    sigla_setor!: string;
}