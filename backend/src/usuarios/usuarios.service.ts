// Contém as regras de negócio relacionadas aos usuários.
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";
import { AtualizarMeuPerfilDto } from "./dto/atualizar-meu-perfil.dto";

import * as bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type ArquivoFotoPerfilUpload = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};

@Injectable()
export class UsuariosService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async cadastrar(
        dados: CriarUsuarioDto
    ) {
        if (dados.senha !== dados.confirmarSenha) {
            throw new BadRequestException(
                "As senhas não coincidem."
            );
        }

        const dataNascimento =
            new Date(dados.dataNascimento);

        const anoNascimento =
            dataNascimento.getFullYear();

        if (
            Number.isNaN(dataNascimento.getTime())
        ) {
            throw new BadRequestException(
                "Data de nascimento inválida."
            );
        }

        if (anoNascimento > 2014) {
            throw new BadRequestException(
                "Informe uma data de nascimento antes de 2014."
            );
        }

        if (anoNascimento < 1926) {
            throw new BadRequestException(
                "Informe uma data de nascimento a partir de 1926."
            );
        }

        const temMinuscula =
            /[a-z]/.test(dados.senha);

        const temMaiuscula =
            /[A-Z]/.test(dados.senha);

        const temNumero =
            /[0-9]/.test(dados.senha);

        const temEspecial =
            /[^0-9A-Za-z\s]/.test(dados.senha);

        if (
            !temMinuscula ||
            !temMaiuscula ||
            !temNumero ||
            !temEspecial
        ) {
            throw new BadRequestException(
                "Insira uma senha contendo letras maiúsculas, minúsculas, números e símbolos."
            );
        }

        const email =
            dados.email.trim().toLowerCase();

        const cpfLimpo =
            dados.cpf.replace(/\D/g, "");

        const telefoneLimpo =
            dados.numeroTelefone.replace(/\D/g, "");

        const usuarioExistente =
            await this.prisma.cadastro.findFirst({
                where: {
                    OR: [
                        { email },
                        { cpf: cpfLimpo }
                    ]
                },

                select: {
                    id: true
                }
            });

        if (usuarioExistente) {
            throw new ConflictException(
                "Já existe usuário com este CPF ou e-mail."
            );
        }

        const senhaHash =
            await bcrypt.hash(
                dados.senha,
                12
            );

        return this.prisma.cadastro.create({
            data: {
                nome: dados.nome.trim(),

                data_nascimento: new Date(
                    `${dados.dataNascimento}T00:00:00.000Z`
                ),

                cpf: cpfLimpo,
                telefone: telefoneLimpo,
                email,
                senha: senhaHash
            },

            select: {
                id: true,
                nome: true,
                data_nascimento: true,
                cpf: true,
                telefone: true,
                email: true
            }
        });
    }

    async buscarPorEmail(
        email: string
    ) {
        return this.prisma.cadastro.findFirst({
            where: {
                email: email.trim().toLowerCase()
            }
        });
    }

    /*
     * Admin:
     * lista todos, menos o próprio admin.
     *
     * Funcionário:
     * lista apenas usuários comuns.
     */
    async listarUsuariosParaConversa(
        usuarioLogadoId: number
    ) {
        const usuarioLogado =
            await this.prisma.cadastro.findUnique({
                where: {
                    id: usuarioLogadoId
                },

                select: {
                    id: true,
                    tipo_usuario: true
                }
            });

        if (!usuarioLogado) {
            throw new NotFoundException(
                "Usuário autenticado não encontrado."
            );
        }

        if (
            usuarioLogado.tipo_usuario !== "admin" &&
            usuarioLogado.tipo_usuario !== "funcionario"
        ) {
            throw new ForbiddenException(
                "Você não possui permissão para listar contatos."
            );
        }

        const usuarios =
            await this.prisma.cadastro.findMany({
                where: {
                    id: {
                        not: usuarioLogado.id
                    },

                    ...(usuarioLogado.tipo_usuario ===
                    "funcionario"
                        ? {
                            tipo_usuario: "user" as const
                        }
                        : {})
                },

                select: {
                    id: true,
                    nome: true,
                    tipo_usuario: true,
                    foto_perfil_url: true,

                    setor: {
                        select: {
                            id: true,
                            setor: true,
                            sigla_setor: true
                        }
                    }
                },

                orderBy: {
                    nome: "asc"
                }
            });

        return usuarios.map((usuario) => ({
            id: usuario.id,
            nome: usuario.nome,
            tipoUsuario: usuario.tipo_usuario,
            foto_perfil_url: usuario.foto_perfil_url,

            setor: usuario.setor
                ? {
                    id: usuario.setor.id,
                    nome: usuario.setor.setor,
                    sigla:
                        usuario.setor.sigla_setor
                }
                : null
        }));
    }

    async listarMeuPerfil(id: number) {
        return this.prisma.cadastro.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo_usuario: true,
                foto_perfil_url: true,
                setor: {
                    select: {
                        id: true,
                        setor: true,
                        sigla_setor: true,
                    },
                },
            }
        })
    }

    async atualizarMeuPerfil(
        id: number,
        dados: AtualizarMeuPerfilDto
    ) {
        const usuario =
            await this.prisma.cadastro.findUnique({
                where: {
                    id
                },

                select: {
                    id: true
                }
            });

        if (!usuario) {
            throw new NotFoundException(
                "Usuário não encontrado."
            );
        }

        const email =
            dados.email.trim().toLowerCase();

        const usuarioComMesmoEmail =
            await this.prisma.cadastro.findFirst({
                where: {
                    email,
                    id: {
                        not: id
                    }
                },

                select: {
                    id: true
                }
            });

        if (usuarioComMesmoEmail) {
            throw new ConflictException(
                "Já existe outro usuário com este e-mail."
            );
        }

        return this.prisma.cadastro.update({
            where: {
                id
            },

            data: {
                nome: dados.nome.trim(),
                email,
                telefone: dados.telefone.trim()
            },

            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo_usuario: true,
                foto_perfil_url: true,
                setor: {
                    select: {
                        id: true,
                        setor: true,
                        sigla_setor: true
                    }
                }
            }
        });
    }

    async atualizarFotoPerfil(
        id: number,
        foto?: ArquivoFotoPerfilUpload
    ) {
        if (!foto) {
            throw new BadRequestException(
                "Selecione uma foto para enviar."
            );
        }

        const usuario = await this.prisma.cadastro.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!usuario) {
            throw new NotFoundException(
                "Usuário não encontrado."
            );
        }

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
            "perfis"
        );
        const nomeArquivo = `${randomUUID()}${extensao}`;
        const caminhoArquivo = join(diretorioUploads, nomeArquivo);
        const urlFoto = `/uploads/perfis/${nomeArquivo}`;

        await mkdir(diretorioUploads, { recursive: true });
        await writeFile(caminhoArquivo, foto.buffer);

        try {
            return await this.prisma.cadastro.update({
                where: { id },
                data: {
                    foto_perfil_url: urlFoto
                },
                select: {
                    id: true,
                    nome: true,
                    telefone: true,
                    email: true,
                    tipo_usuario: true,
                    foto_perfil_url: true,
                    setor: {
                        select: {
                            id: true,
                            setor: true,
                            sigla_setor: true
                        }
                    }
                }
            });
        } catch (erro) {
            await unlink(caminhoArquivo).catch(() => undefined);
            throw erro;
        }
    }

    async listarTodos() {
        return this.prisma.cadastro.findMany({
            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo_usuario: true,
                setor_id: true
            },

            orderBy: {
                id: "asc"
            }
        });
    }

    async atualizar(
        id: number,
        dados: AtualizarUsuarioDto
    ) {
        const usuario =
            await this.prisma.cadastro.findUnique({
                where: {
                    id
                },

                select: {
                    id: true
                }
            });

        if (!usuario) {
            throw new NotFoundException(
                "Usuário não encontrado."
            );
        }

        const email =
            dados.email.trim().toLowerCase();

        const usuarioComMesmoEmail =
            await this.prisma.cadastro.findFirst({
                where: {
                    email,

                    id: {
                        not: id
                    }
                },

                select: {
                    id: true
                }
            });

        if (usuarioComMesmoEmail) {
            throw new ConflictException(
                "Já existe outro usuário com este e-mail."
            );
        }

        if (
            dados.tipo_usuario === "funcionario" &&
            dados.setor_id != null
        ) {
            const setor =
                await this.prisma.setores.findUnique({
                    where: {
                        id: dados.setor_id
                    },

                    select: {
                        id: true
                    }
                });

            if (!setor) {
                throw new BadRequestException(
                    "Setor não encontrado."
                );
            }
        }

        return this.prisma.cadastro.update({
            where: {
                id
            },

            data: {
                telefone:
                    dados.telefone.trim(),

                email,

                tipo_usuario:
                    dados.tipo_usuario,

                setor_id:
                    dados.tipo_usuario === "funcionario"
                        ? dados.setor_id ?? null
                        : null
            },

            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo_usuario: true,
                setor_id: true
            }
        });
    }

    async apagar(id: number) {
        const resultado =
            await this.prisma.cadastro.deleteMany({
                where: {
                    id
                }
            });

        if (resultado.count === 0) {
            throw new NotFoundException(
                "Usuário não encontrado."
            );
        }

        return {
            mensagem:
                "Usuário apagado com sucesso."
        };
    }
}
