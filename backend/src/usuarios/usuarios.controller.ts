import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";
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

  @Get()
  @UseGuards(AuthGuard, PerfisGuard)
  @Perfis("admin")
  listarTodos() {
    return this.usuariosService.listarTodos();
  }

  @Patch(":id")
  @UseGuards(AuthGuard, PerfisGuard)
  @Perfis("admin")
  atualizar(
    @Param("id", ParseIntPipe) id: number,
    @Body() dados: AtualizarUsuarioDto,
  ) {
    return this.usuariosService.atualizar(id, dados);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, PerfisGuard)
  @Perfis("admin")
  apagar(@Param("id", ParseIntPipe) id: number) {
    return this.usuariosService.apagar(id);
  }

  @Post()
  cadastrar(@Body() dados: CriarUsuarioDto) {
    return this.usuariosService.cadastrar(dados);
  }

}
