import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards
} from "@nestjs/common";

import { ConversasService } from "./conversas.service";
import { CriarConversaDto } from "./dto/criar-conversas.dto";

import { AuthGuard } from "../auth/auth.guard";
import { PerfisGuard } from "../auth/guards/perfis.guard";
import { Perfis } from "../auth/decorators/perfis.decorator";

interface RequisicaoAutenticada extends Request {
    usuario: {
        sub: number;
        email: string;
        tipo: "user" | "admin" | "funcionario";
    };
}

@Controller("conversas")
@UseGuards(AuthGuard, PerfisGuard)
@Perfis("admin", "funcionario")
export class ConversasController {
    constructor(
        private readonly conversasService: ConversasService
    ) {}

    @Post()
    criarOuBuscar(
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CriarConversaDto
    ) {
        return this.conversasService.criarOuBuscar(
            requisicao.usuario.sub,
            dados.usuarioId
        );
    }
}