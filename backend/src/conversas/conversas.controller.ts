import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards
} from "@nestjs/common";

import { ConversasService } from "./conversas.service";
import { CriarConversaDto } from "./dto/criar-conversas.dto";

import { AuthGuard } from "../auth/auth.guard";
import type { RequisicaoAutenticada } from "../auth/auth.guard";
import { PerfisGuard } from "../auth/guards/perfis.guard";
import { Perfis } from "../auth/decorators/perfis.decorator";

@Controller("conversas")
@UseGuards(AuthGuard, PerfisGuard)
@Perfis("admin", "funcionario")
export class ConversasController {
    constructor(
        private readonly conversasService: ConversasService
    ) {}

    @Get()
    listar(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.conversasService.listar(
            requisicao.usuario!.sub
        );
    }

    @Post()
    criarOuBuscar(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CriarConversaDto
    ) {
        return this.conversasService.criarOuBuscar(
            requisicao.usuario!.sub,
            dados.usuarioId
        );
    }
}
