import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsDateString()
  dataNascimento!: string;

  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @IsOptional()
  @IsString()
  numeroTelefone?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  senha!: string;

  @IsString()
  @MinLength(8)
  confirmarSenha!: string;
}