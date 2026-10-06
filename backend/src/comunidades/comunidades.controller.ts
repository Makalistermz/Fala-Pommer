import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    type ArquivoFotoComunidadeUpload,
    ComunidadesService
} from './comunidades.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PerfisGuard } from 'src/auth/guards/perfis.guard';
import { Perfis } from 'src/auth/decorators/perfis.decorator';
import { CriarComunidadeDto } from './dto/criar-comunidade.dto';

@Controller('comunidades')
export class ComunidadesController {
    constructor(
        private readonly comunidadesService: ComunidadesService
    ) {}

    @Post()
    @UseGuards(AuthGuard, PerfisGuard)
    @Perfis("admin", "superAdmin")
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
        @Body() dados: CriarComunidadeDto,
        @UploadedFile() foto?: ArquivoFotoComunidadeUpload
    ) {
        return this.comunidadesService.criarComunidade(dados, foto);
    }

    @Get()
    listarComunidade() {
        return this.comunidadesService.listarComunidade()
    }
}
