// Valida os dados usados para atualizar um usuário.
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class AtualizarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsEmail()
  email!: string;

  @IsIn(["user", "admin", "funcionario"])
  tipo_usuario!: "user" | "admin" | "funcionario";

  @IsOptional()
  @IsInt()
  @Min(1)
  setor_id?: number | null;
}
