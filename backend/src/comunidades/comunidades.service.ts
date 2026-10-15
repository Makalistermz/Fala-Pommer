import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarComunidadeDto } from './dto/criar-comunidade.dto';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type JwtPayload } from '../auth/auth.guard';
import { conversa_tipo, Prisma } from '../generated/prisma/client';
import { MensagensCriptografiaService } from '../criptografia/mensagens-criptografia.service';
import { ListarMensagensDto } from '../conversas/dto/listar-mensagens.dto';
import { randomBytes } from 'node:crypto';
import { AtualizarDadosComunidade } from './dto/atualizar-dados-comunidade.dto';

function selecionarComunidade(usuarioId: number) {
    return {
        id: true,
        nome_comunidade: true,
        descricao_comunidade: true,
        imagem_comunidade: true,
        ocultar_municipes: true,
        conversa_id: true,
        comunidade_criada_em: true,
        conversa: {
            select: {
                conversa_participante: {
                    where: { usuario_id: usuarioId },
                    select: { usuario_id: true }
                },
                _count: { select: { conversa_participante: true } }
            }
        },
        criador: {
            select: {
                id: true,
                nome: true,
                foto_perfil_url: true
            }
        }
    } as const;
}

type ComunidadeSelecionada = Prisma.comunidadeGetPayload<{
    select: ReturnType<typeof selecionarComunidade>
}>;

function apresentarComunidade(comunidade: ComunidadeSelecionada) {
    return {
        id: comunidade.id,
        nome_comunidade: comunidade.nome_comunidade,
        descricao_comunidade: comunidade.descricao_comunidade,
        imagem_comunidade: comunidade.imagem_comunidade,
        comunidade_criada_em: comunidade.comunidade_criada_em,
        criador_nome: comunidade.criador?.nome,
        participa: (comunidade.conversa?.conversa_participante.length ?? 0) > 0,
        totalParticipantes: comunidade.conversa?._count.conversa_participante ?? 0
    };
}

const selecionarMensagem = {
    id: true,
    conteudo: true,
    enviada_em: true,
    remetente: { select: { id: true, nome: true, foto_perfil_url: true } }
} as const;

export type ArquivoFotoComunidadeUpload = {
    mimetype: string;
    buffer: Buffer;
};

@Injectable()
export class ComunidadesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly criptografia: MensagensCriptografiaService
    ) {}

    async criarComunidade(
        dados: CriarComunidadeDto,
        usuarioId: number,
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
            const comunidade = await this.prisma.comunidade.create({
                data: {
                    nome_comunidade: dados.nome_comunidade,
                    criador: {
                        connect: { id: usuarioId }
                    },
                    descricao_comunidade: dados.descricao_comunidade,
                    imagem_comunidade: fotoComunidadeUrl,
                    ocultar_municipes: dados.ocultar_municipes,
                    conversa: {
                        create: {
                            tipo: conversa_tipo.comunidade,
                            nome: dados.nome_comunidade.slice(0, 120),
                            conversa_participante: {
                                create: { usuario_id: usuarioId }
                            }
                        }
                    },
                },
                select: selecionarComunidade(usuarioId)
            });

            await this.criarComunidadeFuncao(
                comunidade.id,
                usuarioId
            );

            return apresentarComunidade(comunidade);
        } catch (erro) {
            if (caminhoFoto) {
                await unlink(caminhoFoto).catch(() => undefined);
            }

            throw erro;
        }
    };

    async criarComunidadeFuncao(
        comunidadeId: number, 
        usuarioId: number
    ) {
        const comunidade = await this.prisma.comunidade.findUnique({
            where: {
                id: comunidadeId
            }
        });

        if (!comunidade) {
            throw new Error('Comunidade não encontrada');
        }

        const tipoFuncao = comunidade.comunidade_criador_id === usuarioId
            ? 'admin'
            : 'membro';

        try {
            return this.prisma.comunidade_usuarios.create({
                data: {
                    comunidade_id: comunidadeId,
                    usuario_id: usuarioId,
                    tipo_funcao: tipoFuncao
                },
                select: {
                    comunidade_id: true,
                    usuario_id: true,
                    tipo_funcao: true,
                    promovido_em: true
                }
            });
        } catch (erro) {
            throw erro
        }
    }

    async listarComunidade(tipoUsuario: JwtPayload["tipo"], usuarioId: number) {
        const comunidades = await this.prisma.comunidade.findMany({
            where: tipoUsuario === "user"
                ? { ocultar_municipes: false }
                : undefined,
            select: selecionarComunidade(usuarioId),
            orderBy: { id: 'asc' }
        });
        return comunidades.map(apresentarComunidade);
    };

    private async verificarAcesso(
        comunidadeId: number,
        usuario: Pick<JwtPayload, 'sub' | 'tipo'>,
        exigirParticipacao = true,
        banco: Prisma.TransactionClient = this.prisma
    ) {
        const comunidade = await banco.comunidade.findUnique({
            where: { id: comunidadeId },
            select: selecionarComunidade(usuario.sub)
        });

        if (!comunidade || (comunidade.ocultar_municipes && usuario.tipo === 'user')) {
            throw new NotFoundException('Comunidade não encontrada.');
        }

        if (exigirParticipacao && !comunidade.conversa?.conversa_participante.length) {
            throw new ForbiddenException('Entre na comunidade para acessar as mensagens.');
        }

        return comunidade;
    }

    async entrarComunidade(comunidadeId: number, usuario: Pick<JwtPayload, 'sub' | 'tipo'>) {
        return this.prisma.$transaction(async (banco) => {
            // Serializa entradas, inclusive a criação do chat para comunidades antigas.
            await banco.$queryRaw(Prisma.sql`SELECT id FROM comunidade WHERE id = ${comunidadeId} FOR UPDATE`);
            const comunidade = await this.verificarAcesso(comunidadeId, usuario, false, banco);

            if (!comunidade.conversa_id) {
                const atualizada = await banco.comunidade.update({
                    where: { id: comunidadeId },
                    data: {
                        conversa: {
                            create: {
                                tipo: conversa_tipo.comunidade,
                                nome: comunidade.nome_comunidade.slice(0, 120),
                                conversa_participante: { create: { usuario_id: usuario.sub } }
                            }
                        }
                    },
                    select: selecionarComunidade(usuario.sub)
                });
                return apresentarComunidade(atualizada);
            }

            await banco.conversa_participante.upsert({
                where: {
                    conversa_id_usuario_id: {
                        conversa_id: comunidade.conversa_id,
                        usuario_id: usuario.sub
                    }
                },
                create: { conversa_id: comunidade.conversa_id, usuario_id: usuario.sub },
                update: {}
            });

            return apresentarComunidade(await banco.comunidade.findUniqueOrThrow({
                where: { id: comunidadeId },
                select: selecionarComunidade(usuario.sub)
            }));
        });
    }

    async listarMensagens(
        comunidadeId: number,
        usuario: Pick<JwtPayload, 'sub' | 'tipo'>,
        consulta: ListarMensagensDto
    ) {
        const comunidade = await this.verificarAcesso(comunidadeId, usuario);
        const mensagens = await this.prisma.mensagem.findMany({
            where: {
                conversa_id: comunidade.conversa_id!,
                id: {
                    ...(consulta.depoisDe !== undefined ? { gt: consulta.depoisDe } : {}),
                    ...(consulta.antesDe !== undefined ? { lt: consulta.antesDe } : {})
                }
            },
            orderBy: { id: consulta.depoisDe !== undefined ? 'asc' : 'desc' },
            take: consulta.limite ?? 50,
            select: selecionarMensagem
        });

        if (consulta.depoisDe === undefined) mensagens.reverse();

        return mensagens.map((mensagem) => ({
            id: mensagem.id,
            conteudo: this.criptografia.descriptografar(mensagem.conteudo, comunidade.conversa_id!),
            enviadaEm: mensagem.enviada_em,
            remetente: mensagem.remetente
        }));
    }

    // Retorna o contrato do chat comum; o envio de anexos continua nas rotas de conversas.
    async obterConversa(comunidadeId: number, usuario: Pick<JwtPayload, 'sub' | 'tipo'>) {
        const comunidade = await this.verificarAcesso(comunidadeId, usuario);
        const conversa = await this.prisma.conversa.findUniqueOrThrow({
            where: { id: comunidade.conversa_id! },
            select: {
                id: true,
                criada_em: true,
                conversa_participante: {
                    where: { ocultada_em: null },
                    select: {
                        cadastro: {
                            select: { id: true, nome: true, tipo_usuario: true, foto_perfil_url: true }
                        }
                    }
                }
            }
        });
        return {
            // Mensagens usam este ID, e não o ID da comunidade.
            id: conversa.id,
            tipo: 'comunidade' as const,
            comunidadeId: comunidade.id,
            nome: comunidade.nome_comunidade,
            imagem: comunidade.imagem_comunidade,
            criadaEm: conversa.criada_em,
            participantes: conversa.conversa_participante.map((participante) => participante.cadastro),
            totalParticipantes: conversa.conversa_participante.length,
            somenteLeitura: false,
            mensagensNaoLidas: 0,
            ultimaMensagem: null
        };
    }

    async enviarMensagem(
        comunidadeId: number,
        usuario: Pick<JwtPayload, 'sub' | 'tipo'>,
        conteudo: string
    ) {
        const texto = conteudo.trim();
        if (!texto || texto.length > 4000) {
            throw new BadRequestException('A mensagem deve conter de 1 a 4000 caracteres.');
        }
        const comunidade = await this.verificarAcesso(comunidadeId, usuario);
        const mensagem = await this.prisma.mensagem.create({
            data: {
                conversa_id: comunidade.conversa_id!,
                remetente_id: usuario.sub,
                origem: 'usuario',
                conteudo: this.criptografia.criptografar(texto, comunidade.conversa_id!)
            },
            select: selecionarMensagem
        });
        return {
            id: mensagem.id,
            conteudo: texto,
            enviadaEm: mensagem.enviada_em,
            remetente: mensagem.remetente
        };
    }

    async criarConviteComunidade(usuarioId: number, comunidadeId: number) {
        const token = randomBytes(32).toString('hex');

        const expiracao = new Date(Date.now() + 60 * 60 * 1000); //1 hora para a expiração

        const convite = await this.prisma.convite_comunidade.create({
            data: {
                token,
                comunidade_id: comunidadeId,
                criado_por: usuarioId,
                expira_em: expiracao,
            },
        });

        return {
            link: `${process.env.FRONTEND_URL}/convite/${token}`,
            expira_em: convite.expira_em
        };
        
    }

    async aceitarConviteComunidade(
        token: string,
        usuario: Pick<JwtPayload, 'sub' | 'tipo'>,
    ) {
        const convite = await this.prisma.convite_comunidade.findUnique({
            where: { token },
            select: {
                id: true,
                comunidade_id: true,
                expira_em: true,
                usado: true,
            },
        });

        if (!convite || convite.usado || convite.expira_em <= new Date()) {
            throw new NotFoundException('Convite inválido ou expirado.');
        }

        const comunidade = await this.entrarComunidade(
            convite.comunidade_id,
            usuario,
        );

        await this.prisma.convite_comunidade.updateMany({
            where: { id: convite.id, usado: false },
            data: { usado: true },
        });

        return comunidade;
    }

    async atualizarDadosComunidade(comunidadeId: number, usuarioId: number, dados: AtualizarDadosComunidade, foto?: ArquivoFotoComunidadeUpload) {

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

        return this.prisma.comunidade.update({
            where: {
                id: comunidadeId
            },

            data: {
                nome_comunidade: dados.nome_comunidade?.trim(), //retorna undefined -> não altera caso não for enviado
                descricao_comunidade: dados.descricao_comunidade?.trim(),
                imagem_comunidade: fotoComunidadeUrl
            },

            select: {
                nome_comunidade: true,
                descricao_comunidade: true,
                imagem_comunidade: true
            }
        });
    }
}
