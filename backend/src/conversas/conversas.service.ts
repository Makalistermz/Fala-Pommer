import {
    BadRequestException,
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
}
