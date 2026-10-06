import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ComunidadesService } from './comunidades.service';
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
    criarComunidade (
        @Body() dados: CriarComunidadeDto
    ) {
        return this.comunidadesService.criarComunidade(dados);
    }
}
