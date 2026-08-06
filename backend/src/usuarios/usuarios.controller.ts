import { Body, Controller, Post, Get, UseGuards } from "@nestjs/common";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { UsuariosService } from "./usuarios.service";
import { Perfis } from "src/auth/decorators/perfis.decorator";
import { PerfisGuard } from "src/auth/guards/perfis.guard";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("usuarios")
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Get("conversas")
  @UseGuards(AuthGuard, PerfisGuard)
  @Perfis("admin", "funcionario")
  listarUsuariosParaConversa() {
    return this.usuariosService.listarUsuariosParaConversa();
  }

  @Post()
  cadastrar(@Body() dados: CriarUsuarioDto) {
    return this.usuariosService.cadastrar(dados);
  }

}