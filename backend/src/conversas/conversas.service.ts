import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ConversasService {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async listar(usuarioLogadoId: number) {
        const conversas =
            await this.prisma.conversa.findMany({
                where: {
                    tipo: "privada",
                    conversa_participante: {
                        some: {
                            usuario_id: usuarioLogadoId
                        }
                    }
                },

                include: {
                    conversa_participante: {
                        where: {
                            usuario_id: {
                                not: usuarioLogadoId
                            }
                        },

                        include: {
                            cadastro: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipo_usuario: true
                                }
                            }
                        }
                    }
                },

                orderBy: {
                    criada_em: "desc"
                }
            });

        return conversas.flatMap((conversa) => {
            const contato =
                conversa.conversa_participante[0]?.cadastro;

            if (!contato) {
                return [];
            }

            return [{
                id: conversa.id,
                tipo: conversa.tipo,
                criadaEm: conversa.criada_em,
                contato
            }];
        });
    }

    async criarOuBuscar(
        usuarioLogadoId: number,
        usuarioSelecionadoId: number
    ) {
        if (usuarioLogadoId === usuarioSelecionadoId) {
            throw new BadRequestException(
                "Você não pode iniciar uma conversa consigo mesmo."
            );
        }

        const usuarioSelecionado =
            await this.prisma.cadastro.findUnique({
                where: {
                    id: usuarioSelecionadoId
                },

                select: {
                    id: true,
                    nome: true,
                    tipo_usuario: true
                }
            });

        if (!usuarioSelecionado) {
            throw new NotFoundException(
                "Usuário não encontrado."
            );
        }

        if (usuarioSelecionado.tipo_usuario !== "user") {
            throw new BadRequestException(
                "Só é possível iniciar conversa com usuários."
            );
        }

        const conversaExistente =
            await this.prisma.conversa.findFirst({
                where: {
                    tipo: "privada",

                    AND: [
                        {
                            conversa_participante: {
                                some: {
                                    usuario_id: usuarioLogadoId
                                }
                            }
                        },
                        {
                            conversa_participante: {
                                some: {
                                    usuario_id: usuarioSelecionadoId
                                }
                            }
                        },
                        {
                            conversa_participante: {
                                every: {
                                    usuario_id: {
                                        in: [
                                            usuarioLogadoId,
                                            usuarioSelecionadoId
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                },

                include: {
                    conversa_participante: {
                        include: {
                            cadastro: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipo_usuario: true
                                }
                            }
                        }
                    }
                }
            });

        const conversa = conversaExistente ??
            await this.prisma.conversa.create({
                data: {
                    tipo: "privada",

                    conversa_participante: {
                        create: [
                            {
                                cadastro: {
                                    connect: {
                                        id: usuarioLogadoId
                                    }
                                }
                            },
                            {
                                cadastro: {
                                    connect: {
                                        id: usuarioSelecionadoId
                                    }
                                }
                            }
                        ]
                    }
                },

                include: {
                    conversa_participante: {
                        include: {
                            cadastro: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipo_usuario: true
                                }
                            }
                        }
                    }
                }
            });

        const contato = conversa.conversa_participante
            .find(
                (participante) =>
                    participante.usuario_id ===
                    usuarioSelecionadoId
            )!.cadastro;

        return {
            id: conversa.id,
            tipo: conversa.tipo,
            criadaEm: conversa.criada_em,
            contato
        };
    }

    async listarAtendimentos(
        usuarioLogadoId: number
        ) {
        const usuarioLogado =
            await this.prisma.cadastro.findUnique({
            where: {
                id: usuarioLogadoId
            },
            select: {
                id: true,
                tipo_usuario: true,
                setor_id: true
            }
            });

        if (!usuarioLogado) {
            throw new NotFoundException(
            "Usuário autenticado não encontrado."
            );
        }

        const filtro: {
            usuario_id?: number;
            setor_id?: number;
        } = {};

        if (usuarioLogado.tipo_usuario === "user") {
            filtro.usuario_id = usuarioLogado.id;
        }

        if (usuarioLogado.tipo_usuario === "funcionario") {
            if (!usuarioLogado.setor_id) {
            throw new BadRequestException(
                "O funcionário não está vinculado a nenhum setor."
            );
            }

            filtro.setor_id = usuarioLogado.setor_id;
        }

        /*
        * Quando o perfil for admin, o filtro permanece vazio.
        * Dessa forma, o administrador visualiza todos os atendimentos.
        */

        const atendimentos =
            await this.prisma.conversa_setor.findMany({
            where: filtro,

            include: {
                conversa: {
                select: {
                    id: true,
                    tipo: true,
                    criada_em: true,

                    mensagens: {
                    orderBy: {
                        enviada_em: "desc"
                    },

                    take: 1,

                    select: {
                        id: true,
                        conteudo: true,
                        origem: true,
                        enviada_em: true
                    }
                    }
                }
                },

                setor: {
                select: {
                    id: true,
                    setor: true,
                    sigla_setor: true
                }
                },

                usuario: {
                select: {
                    id: true,
                    nome: true
                }
                }
            },

            orderBy: {
                criada_em: "desc"
            }
            });

        return atendimentos.map((atendimento) => {
            const ultimaMensagem =
            atendimento.conversa.mensagens[0] ?? null;

            return {
            id: atendimento.conversa.id,
            tipo: atendimento.conversa.tipo,
            criadaEm: atendimento.conversa.criada_em,

            setor: {
                id: atendimento.setor.id,
                nome: atendimento.setor.setor,
                sigla: atendimento.setor.sigla_setor
            },

            usuario: atendimento.usuario,

            ultimaMensagem: ultimaMensagem
                ? {
                    id: ultimaMensagem.id,
                    conteudo: ultimaMensagem.conteudo,
                    origem: ultimaMensagem.origem,
                    enviadaEm: ultimaMensagem.enviada_em
                }
                : null
            };
        });
    }

    async iniciarComoUsuario(
        usuarioLogadoId: number,
        setorId: number
        ) {
        const [usuario, setor] = await Promise.all([
            this.prisma.cadastro.findUnique({
            where: {
                id: usuarioLogadoId
            },
            select: {
                id: true,
                nome: true,
                tipo_usuario: true
            }
            }),

            this.prisma.setores.findUnique({
            where: {
                id: setorId
            },
            select: {
                id: true,
                setor: true,
                sigla_setor: true
            }
            })
        ]);

        if (!usuario) {
            throw new NotFoundException(
            "Usuário autenticado não encontrado."
            );
        }

        if (usuario.tipo_usuario !== "user") {
            throw new ForbiddenException(
            "Somente usuários podem iniciar atendimento com um setor."
            );
        }

        if (!setor) {
            throw new NotFoundException(
            "Setor não encontrado."
            );
        }

        return this.buscarOuCriarAtendimento(
            setor.id,
            usuario.id
        );
        }

        async iniciarComoFuncionario(
        funcionarioId: number,
        usuarioSelecionadoId: number
        ) {
        const [funcionario, usuarioSelecionado] =
            await Promise.all([
            this.prisma.cadastro.findUnique({
                where: {
                id: funcionarioId
                },
                select: {
                id: true,
                tipo_usuario: true,
                setor_id: true
                }
            }),

            this.prisma.cadastro.findUnique({
                where: {
                id: usuarioSelecionadoId
                },
                select: {
                id: true,
                nome: true,
                tipo_usuario: true
                }
            })
            ]);

        if (!funcionario) {
            throw new NotFoundException(
            "Funcionário autenticado não encontrado."
            );
        }

        if (funcionario.tipo_usuario !== "funcionario") {
            throw new ForbiddenException(
            "Somente funcionários podem iniciar esse atendimento."
            );
        }

        if (!funcionario.setor_id) {
            throw new BadRequestException(
            "O funcionário não está vinculado a nenhum setor."
            );
        }

        if (!usuarioSelecionado) {
            throw new NotFoundException(
            "Usuário não encontrado."
            );
        }

        if (usuarioSelecionado.tipo_usuario !== "user") {
            throw new BadRequestException(
            "O atendimento só pode ser iniciado com um usuário."
            );
        }

        return this.buscarOuCriarAtendimento(
            funcionario.setor_id,
            usuarioSelecionado.id
        );
        }

        private async buscarOuCriarAtendimento(
        setorId: number,
        usuarioId: number
        ) {
        const atendimento =
            await this.prisma.conversa_setor.upsert({
            where: {
                setor_id_usuario_id: {
                setor_id: setorId,
                usuario_id: usuarioId
                }
            },

            update: {},

            create: {
                conversa: {
                create: {
                    tipo: "setor"
                }
                },

                setor: {
                connect: {
                    id: setorId
                }
                },

                usuario: {
                connect: {
                    id: usuarioId
                }
                }
            },

            include: {
                conversa: {
                select: {
                    id: true,
                    tipo: true,
                    criada_em: true
                }
                },

                setor: {
                select: {
                    id: true,
                    setor: true,
                    sigla_setor: true
                }
                },

                usuario: {
                select: {
                    id: true,
                    nome: true
                }
                }
            }
            });

        return {
            id: atendimento.conversa.id,
            tipo: atendimento.conversa.tipo,
            criadaEm: atendimento.conversa.criada_em,

            setor: {
            id: atendimento.setor.id,
            nome: atendimento.setor.setor,
            sigla: atendimento.setor.sigla_setor
            },

            usuario: atendimento.usuario
        };
    }
}
