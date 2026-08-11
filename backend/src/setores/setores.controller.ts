import { Controller, Post, Body } from '@nestjs/common';
import { SetoresService } from './setores.service';
import { CriarSetorDTO } from './dto/criar-setor-dto';

@Controller('setores')
export class SetoresController {
    constructor (
        private readonly setoresService: SetoresService
    ) {}

    @Post()
        criar(@Body() dados: CriarSetorDTO) {
            return this.setoresService.criar(dados);
        }
}
