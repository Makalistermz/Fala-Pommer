import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CriarSetorDTO } from './dto/criar-setor-dto';

@Injectable()
export class SetoresService {
    constructor(private readonly prisma: PrismaService) {}

    async criar(dados: CriarSetorDTO) {

        const setorExistente = await this.prisma.setores.findFirst({
            where: {
                OR: [
                    {setor: dados.setor},
                    {sigla_setor: dados.setor}
                ],
            },
        });

        if (setorExistente) {
            throw new ConflictException("O setor ou a sigla informada já existe no sistema.");
        }

        const setorCriado = await this.prisma.setores.create({
            data: {
                setor: dados.setor,
                sigla_setor: dados.sigla_setor,
            },
            select: {
                setor: true,
                sigla_setor: true,
            },
        });

        return setorCriado;
    };
};
