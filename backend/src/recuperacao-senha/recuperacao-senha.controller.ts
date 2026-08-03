import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post
} from "@nestjs/common";

import { RecuperacaoSenhaService } from "./recuperacao-senha.service";
import { SolicitarRecuperacaoDto } from "./dto/solicitar-recuperacao.dto";

@Controller("recuperacao-senha")
export class RecuperacaoSenhaController {
    constructor(
        private readonly recuperacaoSenhaService: RecuperacaoSenhaService
    ) {}

    @Post("solicitar")
    @HttpCode(HttpStatus.OK)
    solicitarRecuperacao(
        @Body() dados: SolicitarRecuperacaoDto
    ) {
        return this.recuperacaoSenhaService.solicitarRecuperacao(
            dados.email
        );
    }
}