import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards
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
     * Lista as conversas privadas do usuário autenticado.
     * Todos os perfis podem receber uma conversa privada do admin.
     */
    @Get()
    @Perfis("user", "admin", "funcionario")
    listar(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.conversasService.listar(
            requisicao.usuario!.sub
        );
    }

    /*
     * Somente o administrador pode iniciar conversa privada.
     */
    @Post()
    @HttpCode(200)
    @Perfis("admin")
    criarOuBuscar(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CriarConversaDto
    ) {
        return this.conversasService.criarOuBuscar(
            requisicao.usuario!.sub,
            dados.usuarioId
        );
    }

    /*
     * Lista os atendimentos de setor.
     */
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
     * Usuário inicia atendimento com um setor.
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
     * Funcionário inicia atendimento com um usuário.
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

    /*
     * Lista mensagens de conversa privada ou de setor.
     */
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

    /*
     * Todos podem responder a uma conversa à qual possuem acesso.
     */
    @Post(":conversaId/mensagens")
    @HttpCode(201)
    @Perfis("user", "funcionario", "admin")
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