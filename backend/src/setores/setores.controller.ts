import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SetoresService } from './setores.service';
import { CriarSetorDTO } from './dto/criar-setor-dto';

@Controller('setores')
export class SetoresController {
    constructor (
        private readonly setoresService: SetoresService
    ) {}

    @Get()
        listar() {
            return this.setoresService.listar();
        }

    @Post()
        criar(@Body() dados: CriarSetorDTO) {
            return this.setoresService.criar(dados);
        }

    @Delete(':id')
        apagar(@Param('id', ParseIntPipe) id: number) {
            return this.setoresService.apagar(id);
        }
}
