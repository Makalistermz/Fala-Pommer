import { Body, Controller, Post } from "@nestjs/common";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { UsuariosService } from "./usuarios.service";

@Controller("usuarios")
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post()
  cadastrar(@Body() dados: CriarUsuarioDto) {
    return this.usuariosService.cadastrar(dados);
  }
}