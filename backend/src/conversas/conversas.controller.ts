import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    UseGuards,
    Param,
    ParseIntPipe
} from "@nestjs/common";

import { ConversasService } from "./conversas.service";
import { CriarConversaDto } from "./dto/criar-conversas.dto";
import { IniciarConversaSetorDto } from "./dto/iniciar-conversas-setor.dto";
import { CriarMensagemDto } from "./dto/criar-mensagem.dto";

import {
    AuthGuard,
    type RequisicaoAutenticada
} from "../auth/auth.guard";

import { PerfisGuard } from "../auth/guards/perfis.guard";
import { Perfis } from "../auth/decorators/perfis.decorator";

@Controller("conversas")
@UseGuards(AuthGuard, PerfisGuard)
export class ConversasController {
    constructor(
        private readonly conversasService: ConversasService
    ) {}

    /*
        * Lista as conversas privadas antigas.
   */

    @Get()
    @Perfis("admin", "funcionario")
    listar(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.conversasService.listar(
        requisicao.usuario!.sub
        );
    }

    /*
        * Cria ou procura uma conversa privada antiga.
   */

    @Post()
    @HttpCode(200)
    @Perfis("admin", "funcionario")
    criarOuBuscar(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CriarConversaDto
    ) {
        return this.conversasService.criarOuBuscar(
        requisicao.usuario!.sub,
        dados.usuarioId
        );
    }

    @Get("setor")
    @Perfis("user", "funcionario", "admin")
    listarAtendimentos(
    @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.conversasService.listarAtendimentos(
            requisicao.usuario!.sub
        );
    }

    /*
        * Usuário inicia uma conversa com um setor.
        *
        * Body:
        * {
        *   "setorId": 1
        * }
   */

    @Post("setor")
    @HttpCode(200)
    @Perfis("user")
    iniciarComSetor(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: IniciarConversaSetorDto
    ) {
        return this.conversasService.iniciarComoUsuario(
        requisicao.usuario!.sub,
        dados.setorId
        );
    }

    /*
        * Funcionário inicia uma conversa com um usuário.
        * O setor é obtido pelo vínculo do funcionário.
        *
        * Body:
        * {
        *   "usuarioId": 7
        * }
   */

    @Post("setor/usuario")
    @HttpCode(200)
    @Perfis("funcionario")
    iniciarComUsuario(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CriarConversaDto
    ) {
        return this.conversasService.iniciarComoFuncionario(
        requisicao.usuario!.sub,
        dados.usuarioId
        );
    }

    @Get(":conversaId/mensagens")
    @Perfis("user", "funcionario", "admin")
    listarMensagens(
    @Req() requisicao: RequisicaoAutenticada,
    @Param("conversaId", ParseIntPipe)
    conversaId: number
    ) {
    return this.conversasService.listarMensagens(
        requisicao.usuario!.sub,
        conversaId
    );
    }

    @Post(":conversaId/mensagens")
    @HttpCode(201)
    @Perfis("user", "funcionario")
    enviarMensagem(
    @Req() requisicao: RequisicaoAutenticada,
    @Param("conversaId", ParseIntPipe)
    conversaId: number,
    @Body() dados: CriarMensagemDto
    ) {
        return this.conversasService.enviarMensagem(
            requisicao.usuario!.sub,
            conversaId,
            dados.conteudo
        );
    }
}