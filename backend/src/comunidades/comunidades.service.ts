import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CriarComunidadeDto } from './dto/criar-comunidade.dto';

@Injectable()
export class ComunidadesService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async criarComunidade(
        dados: CriarComunidadeDto,
        fotoComunidadeUrl?: string
    ) {
        const comunidadeCriada = await this.prisma.comunidade.create({
            data: {
                nome_comunidade: dados.nome_comunidade,
                descricao_comunidade:dados.descricao_comunidade,
                imagem_comunidade: fotoComunidadeUrl
            },

            select: {
                nome_comunidade: true,
                descricao_comunidade: true,
                imagem_comunidade:true
            }
        });

        return comunidadeCriada;
    }
}
