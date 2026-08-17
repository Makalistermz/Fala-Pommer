// Define as rotas da API relacionadas aos usuários.
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";
import { AtualizarMeuPerfilDto } from "./dto/atualizar-meu-perfil.dto";
import {
    type ArquivoFotoPerfilUpload,
    UsuariosService
} from "./usuarios.service";

import { Perfis } from "../auth/decorators/perfis.decorator";
import { PerfisGuard } from "../auth/guards/perfis.guard";

import {
    AuthGuard,
    type RequisicaoAutenticada
} from "../auth/auth.guard";

@Controller("usuarios")
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService
    ) {}

    @Get("conversas")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "funcionario")
    listarUsuariosParaConversa(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.usuariosService
            .listarUsuariosParaConversa(
                requisicao.usuario!.sub
            );
    }

    @Get("me")
    @UseGuards(AuthGuard)
    listarMeuPerfil(
        @Req() requisicao: RequisicaoAutenticada,
    ) {
        return this.usuariosService.listarMeuPerfil(
            requisicao.usuario!.sub,
        );
    }

    @Patch("me")
    @UseGuards(AuthGuard)
    atualizarMeuPerfil(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: AtualizarMeuPerfilDto
    ) {
        return this.usuariosService.atualizarMeuPerfil(
            requisicao.usuario!.sub,
            dados
        );
    }

    @Patch("me/foto")
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor("foto", {
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        fileFilter: (_requisicao, arquivo, callback) => {
            const tiposPermitidos = new Set([
                "image/jpeg",
                "image/png",
                "image/webp"
            ]);

            if (!tiposPermitidos.has(arquivo.mimetype)) {
                callback(
                    new BadRequestException(
                        "A foto deve estar nos formatos JPEG, PNG ou WebP."
                    ),
                    false
                );
                return;
            }

            callback(null, true);
        }
    }))
    atualizarFotoPerfil(
        @Req() requisicao: RequisicaoAutenticada,
        @UploadedFile() foto?: ArquivoFotoPerfilUpload
    ) {
        return this.usuariosService.atualizarFotoPerfil(
            requisicao.usuario!.sub,
            foto
        );
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
        @Body() dados: AtualizarUsuarioDto
    ) {
        return this.usuariosService.atualizar(
            id,
            dados
        );
    }

    @Delete(":id")
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin")
    apagar(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.usuariosService.apagar(id);
    }

    @Post()
    cadastrar(
        @Body() dados: CriarUsuarioDto
    ) {
        return this.usuariosService.cadastrar(
            dados
        );
    }
}
