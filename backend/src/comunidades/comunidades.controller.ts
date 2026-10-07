import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    type ArquivoFotoComunidadeUpload,
    ComunidadesService
} from './comunidades.service';
import {
    AuthGuard,
    type RequisicaoAutenticada
} from '../auth/auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { CriarComunidadeDto } from './dto/criar-comunidade.dto';
import { EnviarMensagemComunidadeDto } from './dto/enviar-mensagem-comunidade.dto';
import { ListarMensagensDto } from '../conversas/dto/listar-mensagens.dto';

@Controller('comunidades')
export class ComunidadesController {
    constructor(
        private readonly comunidadesService: ComunidadesService
    ) {}

    @Post()
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("funcionario", "admin", "superAdmin")
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
    criarComunidade (
        @Req() requisicao: RequisicaoAutenticada,
        @Body() dados: CriarComunidadeDto,
        @UploadedFile() foto?: ArquivoFotoComunidadeUpload
    ) {
        return this.comunidadesService.criarComunidade(dados, requisicao.usuario!.sub, foto);
    }

    @Get()
    @UseGuards(AuthGuard)
    listarComunidade(
        @Req() requisicao: RequisicaoAutenticada
    ) {
        return this.comunidadesService.listarComunidade(
            requisicao.usuario!.tipo,
            requisicao.usuario!.sub
        );
    }

    @Post(':comunidadeId/entrar')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    entrarComunidade(
        @Req() requisicao: RequisicaoAutenticada,
        @Param('comunidadeId', ParseIntPipe) comunidadeId: number
    ) {
        return this.comunidadesService.entrarComunidade(comunidadeId, requisicao.usuario!);
    }

    @Get(':comunidadeId/mensagens')
    @UseGuards(AuthGuard)
    listarMensagens(
        @Req() requisicao: RequisicaoAutenticada,
        @Param('comunidadeId', ParseIntPipe) comunidadeId: number,
        @Query() consulta: ListarMensagensDto
    ) {
        return this.comunidadesService.listarMensagens(comunidadeId, requisicao.usuario!, consulta);
    }

    // Após validar a participação, conecta a comunidade às rotas completas de conversas.
    @Get(':comunidadeId/conversa')
    @UseGuards(AuthGuard)
    obterConversa(
        @Req() requisicao: RequisicaoAutenticada,
        @Param('comunidadeId', ParseIntPipe) comunidadeId: number
    ) {
        return this.comunidadesService.obterConversa(comunidadeId, requisicao.usuario!);
    }

    @Post(':comunidadeId/mensagens')
    @UseGuards(AuthGuard)
    enviarMensagem(
        @Req() requisicao: RequisicaoAutenticada,
        @Param('comunidadeId', ParseIntPipe) comunidadeId: number,
        @Body() dados: EnviarMensagemComunidadeDto
    ) {
        return this.comunidadesService.enviarMensagem(comunidadeId, requisicao.usuario!, dados.conteudo);
    }
}
