import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from "class-validator";

export class AtualizarMeuPerfilDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefone!: string;
}
