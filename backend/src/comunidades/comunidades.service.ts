import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CriarComunidadeDto } from './dto/criar-comunidade.dto';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export type ArquivoFotoComunidadeUpload = {
    mimetype: string;
    buffer: Buffer;
};

@Injectable()
export class ComunidadesService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async criarComunidade(
        dados: CriarComunidadeDto,
        foto?: ArquivoFotoComunidadeUpload
    ) {
        let caminhoFoto: string | undefined;
        let fotoComunidadeUrl: string | undefined;

        if (foto) {
            const extensoes: Record<string, string> = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp"
            };
            const extensao = extensoes[foto.mimetype];

            if (!extensao) {
                throw new BadRequestException(
                    "Formato de imagem não permitido."
                );
            }

            const diretorioUploads = join(
                process.cwd(),
                "uploads",
                "comunidades"
            );
            const nomeArquivo = `${randomUUID()}${extensao}`;

            caminhoFoto = join(diretorioUploads, nomeArquivo);
            fotoComunidadeUrl = `/uploads/comunidades/${nomeArquivo}`;

            await mkdir(diretorioUploads, { recursive: true });
            await writeFile(caminhoFoto, foto.buffer);
        }

        try {
            return await this.prisma.comunidade.create({
                data: {
                    nome_comunidade: dados.nome_comunidade,
                    descricao_comunidade: dados.descricao_comunidade,
                    imagem_comunidade: fotoComunidadeUrl
                },

                select: {
                    nome_comunidade: true,
                    descricao_comunidade: true,
                    imagem_comunidade: true
                }
            });
        } catch (erro) {
            if (caminhoFoto) {
                await unlink(caminhoFoto).catch(() => undefined);
            }

            throw erro;
        }
    };

    async listarComunidade() {
        return this.prisma.comunidade.findMany({
            select: {
                nome_comunidade: true,
                descricao_comunidade: true,
                imagem_comunidade: true
            }
        });
    };
}
