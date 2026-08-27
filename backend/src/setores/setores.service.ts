// Contém as regras de negócio relacionadas aos setores.
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CriarSetorDTO } from './dto/criar-setor-dto';

@Injectable()
export class SetoresService {
    constructor(private readonly prisma: PrismaService) {}

    async listar() {
        return this.prisma.setores.findMany({
            select: {
                id: true,
                setor: true,
                sigla_setor: true,
            },
            orderBy: {
                setor: 'asc',
            },
        });
    }

    async listarComFuncionarios() {
        return this.prisma.setores.findMany({
            where: {
                cadastros: {
                    some: {
                        tipo_usuario: 'funcionario',
                    },
                },
            },
            select: {
                id: true,
                setor: true,
                sigla_setor: true,
            },
            orderBy: {
                setor: 'asc',
            },
        });
    }

    async criar(dados: CriarSetorDTO) {

        const setorExistente = await this.prisma.setores.findFirst({
            where: {
                OR: [
                    {setor: dados.setor},
                    { sigla_setor: dados.sigla_setor }
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
                id: true,
                setor: true,
                sigla_setor: true,
            },
        });

        return setorCriado;
    };

    async apagar(id: number) {
        const resultado = await this.prisma.setores.deleteMany({
            where: { id },
        });

        if (resultado.count === 0) {
            throw new NotFoundException('Setor não encontrado.');
        }

        return { mensagem: 'Setor apagado com sucesso.' };
    }
};
