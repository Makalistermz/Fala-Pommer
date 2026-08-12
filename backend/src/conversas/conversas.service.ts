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

    /*
     * Lista as conversas privadas das quais
     * o usuário autenticado participa.
     */
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
                    },

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

            const ultimaMensagem =
                conversa.mensagens[0] ?? null;

            return [{
                id: conversa.id,
                tipo: conversa.tipo,
                criadaEm: conversa.criada_em,
                contato,

                ultimaMensagem: ultimaMensagem
                    ? {
                        id: ultimaMensagem.id,
                        conteudo: ultimaMensagem.conteudo,
                        origem: ultimaMensagem.origem,
                        enviadaEm: ultimaMensagem.enviada_em
                    }
                    : null
            }];
        });
    }

    /*
     * Somente o administrador pode iniciar
     * uma conversa privada.
     *
     * O destinatário pode ser user, funcionário
     * ou outro administrador.
     */
    async criarOuBuscar(
        usuarioLogadoId: number,
        usuarioSelecionadoId: number
    ) {
        const [usuarioLogado, usuarioSelecionado] =
            await Promise.all([
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

        if (!usuarioLogado) {
            throw new NotFoundException(
                "Usuário autenticado não encontrado."
            );
        }

        if (usuarioLogado.tipo_usuario !== "admin") {
            throw new ForbiddenException(
                "Somente administradores podem iniciar conversas privadas."
            );
        }

        if (!usuarioSelecionado) {
            throw new NotFoundException(
                "Usuário selecionado não encontrado."
            );
        }

        if (usuarioLogado.id === usuarioSelecionado.id) {
            throw new BadRequestException(
                "Você não pode iniciar uma conversa consigo mesmo."
            );
        }

        const participantes = [
            usuarioLogado.id,
            usuarioSelecionado.id
        ];

        const conversaExistente =
            await this.prisma.conversa.findFirst({
                where: {
                    tipo: "privada",

                    AND: [
                        {
                            conversa_participante: {
                                some: {
                                    usuario_id: usuarioLogado.id
                                }
                            }
                        },
                        {
                            conversa_participante: {
                                some: {
                                    usuario_id: usuarioSelecionado.id
                                }
                            }
                        },
                        {
                            conversa_participante: {
                                every: {
                                    usuario_id: {
                                        in: participantes
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

        const conversa =
            conversaExistente ??
            await this.prisma.conversa.create({
                data: {
                    tipo: "privada",

                    conversa_participante: {
                        create: [
                            {
                                cadastro: {
                                    connect: {
                                        id: usuarioLogado.id
                                    }
                                }
                            },
                            {
                                cadastro: {
                                    connect: {
                                        id: usuarioSelecionado.id
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

        const contato =
            conversa.conversa_participante.find(
                (participante) =>
                    participante.usuario_id ===
                    usuarioSelecionado.id
            )?.cadastro;

        if (!contato) {
            throw new NotFoundException(
                "Contato da conversa não encontrado."
            );
        }

        return {
            id: conversa.id,
            tipo: conversa.tipo,
            criadaEm: conversa.criada_em,
            contato,
            ultimaMensagem: null
        };
    }

    /*
     * Lista atendimentos de setor.
     *
     * user: somente os próprios atendimentos.
     * funcionário: atendimentos do seu setor.
     * admin: todos os atendimentos.
     */
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

        if (
            usuarioLogado.tipo_usuario ===
            "funcionario"
        ) {
            if (!usuarioLogado.setor_id) {
                throw new BadRequestException(
                    "O funcionário não está vinculado a nenhum setor."
                );
            }

            filtro.setor_id =
                usuarioLogado.setor_id;
        }

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
                atendimento.conversa.mensagens[0] ??
                null;

            return {
                id: atendimento.conversa.id,
                tipo: atendimento.conversa.tipo,
                criadaEm:
                    atendimento.conversa.criada_em,

                setor: {
                    id: atendimento.setor.id,
                    nome: atendimento.setor.setor,
                    sigla:
                        atendimento.setor.sigla_setor
                },

                usuario: atendimento.usuario,

                ultimaMensagem: ultimaMensagem
                    ? {
                        id: ultimaMensagem.id,
                        conteudo:
                            ultimaMensagem.conteudo,
                        origem:
                            ultimaMensagem.origem,
                        enviadaEm:
                            ultimaMensagem.enviada_em
                    }
                    : null
            };
        });
    }

    /*
     * Um user inicia atendimento com um setor.
     */
    async iniciarComoUsuario(
        usuarioLogadoId: number,
        setorId: number
    ) {
        const [usuario, setor] =
            await Promise.all([
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

    /*
     * Um funcionário inicia atendimento,
     * em nome do setor, com um user.
     */
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

        if (
            funcionario.tipo_usuario !==
            "funcionario"
        ) {
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

        if (
            usuarioSelecionado.tipo_usuario !==
            "user"
        ) {
            throw new BadRequestException(
                "O atendimento só pode ser iniciado com um usuário."
            );
        }

        return this.buscarOuCriarAtendimento(
            funcionario.setor_id,
            usuarioSelecionado.id
        );
    }

    /*
     * Procura ou cria uma conversa única
     * entre determinado setor e determinado user.
     */
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

            usuario: atendimento.usuario,
            ultimaMensagem: null
        };
    }

    /*
     * Envia mensagem em uma conversa privada
     * ou em um atendimento de setor.
     */
    async enviarMensagem(
        usuarioLogadoId: number,
        conversaId: number,
        conteudo: string
    ) {
        const conteudoLimpo = conteudo.trim();

        if (!conteudoLimpo) {
            throw new BadRequestException(
                "A mensagem não pode estar vazia."
            );
        }

        const contexto =
            await this.verificarAcessoConversa(
                usuarioLogadoId,
                conversaId
            );

        let origem: "usuario" | "setor";

        if (contexto.conversa.tipo === "privada") {
            origem = "usuario";
        } else {
            if (
                contexto.usuarioLogado.tipo_usuario ===
                "admin"
            ) {
                throw new ForbiddenException(
                    "O administrador deve usar uma conversa privada para enviar mensagens."
                );
            }

            origem =
                contexto.usuarioLogado.tipo_usuario ===
                "user"
                    ? "usuario"
                    : "setor";
        }

        const mensagem =
            await this.prisma.mensagem.create({
                data: {
                    conversa_id: conversaId,
                    remetente_id: usuarioLogadoId,
                    origem,
                    conteudo: conteudoLimpo
                },

                include: {
                    remetente: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            });

        const atendimento = contexto.atendimento;

        const remetenteExibido =
            mensagem.origem === "setor" &&
            atendimento
                ? {
                    tipo: "setor" as const,
                    id: atendimento.setor.id,
                    nome: atendimento.setor.setor
                }
                : {
                    tipo: "usuario" as const,
                    id: mensagem.remetente.id,
                    nome: mensagem.remetente.nome
                };

        return {
            id: mensagem.id,
            conversaId: mensagem.conversa_id,
            conteudo: mensagem.conteudo,
            origem: mensagem.origem,
            enviadaEm: mensagem.enviada_em,
            remetente: remetenteExibido
        };
    }

    /*
     * Lista mensagens de uma conversa,
     * validando se o usuário pode acessá-la.
     */
    async listarMensagens(
        usuarioLogadoId: number,
        conversaId: number
    ) {
        const contexto =
            await this.verificarAcessoConversa(
                usuarioLogadoId,
                conversaId
            );

        const mensagens =
            await this.prisma.mensagem.findMany({
                where: {
                    conversa_id: conversaId
                },

                include: {
                    remetente: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                },

                orderBy: {
                    enviada_em: "asc"
                }
            });

        return mensagens.map((mensagem) => {
            const atendimento =
                contexto.atendimento;

            const remetenteExibido =
                mensagem.origem === "setor" &&
                atendimento
                    ? {
                        tipo: "setor" as const,
                        id: atendimento.setor.id,
                        nome:
                            atendimento.setor.setor
                    }
                    : {
                        tipo: "usuario" as const,
                        id: mensagem.remetente.id,
                        nome:
                            mensagem.remetente.nome
                    };

            const podeVerAutorReal =
                contexto.conversa.tipo === "privada" ||
                contexto.usuarioLogado.tipo_usuario !==
                    "user" ||
                mensagem.origem === "usuario";

            return {
                id: mensagem.id,
                conversaId: mensagem.conversa_id,
                conteudo: mensagem.conteudo,
                origem: mensagem.origem,
                enviadaEm: mensagem.enviada_em,
                remetente: remetenteExibido,

                ...(podeVerAutorReal && {
                    autorReal: {
                        id: mensagem.remetente.id,
                        nome:
                            mensagem.remetente.nome
                    }
                })
            };
        });
    }

    /*
     * Valida acesso tanto para conversa privada
     * quanto para atendimento de setor.
     */
    private async verificarAcessoConversa(
        usuarioLogadoId: number,
        conversaId: number
    ) {
        const [usuarioLogado, conversa] =
            await Promise.all([
                this.prisma.cadastro.findUnique({
                    where: {
                        id: usuarioLogadoId
                    },

                    select: {
                        id: true,
                        nome: true,
                        tipo_usuario: true,
                        setor_id: true
                    }
                }),

                this.prisma.conversa.findUnique({
                    where: {
                        id: conversaId
                    },

                    include: {
                        conversa_participante: {
                            select: {
                                usuario_id: true
                            }
                        },

                        atendimento_setor: {
                            include: {
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
                        }
                    }
                })
            ]);

        if (!usuarioLogado) {
            throw new NotFoundException(
                "Usuário autenticado não encontrado."
            );
        }

        if (!conversa) {
            throw new NotFoundException(
                "Conversa não encontrada."
            );
        }

        /*
         * Em conversa privada, somente os participantes
         * podem visualizar e enviar mensagens.
         */
        if (conversa.tipo === "privada") {
            const participaDaConversa =
                conversa.conversa_participante.some(
                    (participante) =>
                        participante.usuario_id ===
                        usuarioLogado.id
                );

            if (!participaDaConversa) {
                throw new ForbiddenException(
                    "Você não participa desta conversa privada."
                );
            }

            return {
                usuarioLogado,
                conversa,
                atendimento: null
            };
        }

        /*
         * Em atendimento de setor:
         * user acessa somente o próprio atendimento;
         * funcionário acessa somente seu setor;
         * admin pode visualizar todos.
         */
        if (conversa.tipo === "setor") {
            const atendimento =
                conversa.atendimento_setor;

            if (!atendimento) {
                throw new NotFoundException(
                    "Atendimento de setor não encontrado."
                );
            }

            if (
                usuarioLogado.tipo_usuario === "user" &&
                atendimento.usuario_id !==
                    usuarioLogado.id
            ) {
                throw new ForbiddenException(
                    "Você não possui acesso a este atendimento."
                );
            }

            if (
                usuarioLogado.tipo_usuario ===
                "funcionario"
            ) {
                if (!usuarioLogado.setor_id) {
                    throw new ForbiddenException(
                        "Você não está vinculado a nenhum setor."
                    );
                }

                if (
                    atendimento.setor_id !==
                    usuarioLogado.setor_id
                ) {
                    throw new ForbiddenException(
                        "Esta conversa pertence a outro setor."
                    );
                }
            }

            return {
                usuarioLogado,
                conversa,
                atendimento
            };
        }

        throw new BadRequestException(
            "Mensagens para grupos ainda não foram implementadas."
        );
    }
}