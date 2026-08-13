import { IsBoolean } from "class-validator";

export class AtualizarDigitacaoDto {
    @IsBoolean()
    digitando: boolean;
}
