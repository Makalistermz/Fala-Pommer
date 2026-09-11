// Testa a paginação e a busca incremental de mensagens.
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConversasService } from "./conversas.service";

describe("ConversasService", () => {
  const mensagem = (id: number) => ({
    id,
    conversa_id: 10,
    remetente_id: 1,
    origem: "usuario",
    conteudo: `Mensagem ${id}`,
    enviada_em: new Date("2026-08-24T12:00:00.000Z"),
    arquivo_nome: null,
    arquivo_url: null,
    arquivo_tipo: null,
    arquivo_mime: null,
    arquivo_tamanho: null,
    remetente: {
      id: 1,
      nome: "Usuário",
      tipo_usuario: "user",
    },
  });

  const prismaMock = {
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    cadastro: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    conversa: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conversa_setor: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    conversa_participante: {
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    conversa_leitura: {
      deleteMany: jest.fn(),
    },
    mensagem: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      create: jest.fn(),
    },
    avaliacao: {
      findMany: jest.fn(),
    },
  };

  let service: ConversasService;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operacao) =>
      operacao(prismaMock),
    );
    prismaMock.$queryRaw.mockResolvedValue([{ id: 1 }]);
    prismaMock.conversa_participante.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.conversa_participante.delete.mockResolvedValue({});
    prismaMock.conversa_participante.count.mockResolvedValue(2);
    prismaMock.conversa_leitura.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Usuário",
      tipo_usuario: "user",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [{ usuario_id: 1, ocultada_em: null }],
      atendimento_setor: null,
    });
    prismaMock.conversa_setor.findMany.mockResolvedValue([]);
    prismaMock.mensagem.groupBy.mockResolvedValue([]);
    service = new ConversasService(
      prismaMock as unknown as PrismaService,
    );
  });

  it("lista as avaliações dos últimos 30 dias com seus setores", async () => {
    const criadaEmFinancas = new Date("2026-09-03T15:00:00.000Z");
    const criadaEmTributos = new Date("2026-09-02T15:00:00.000Z");

    prismaMock.avaliacao.findMany.mockResolvedValue([
      {
        id: 11,
        nota: 5,
        descricao: "Atendimento excelente",
        criada_em: criadaEmFinancas,
        avaliador: { id: 20, nome: "Ana Souza" },
        finalizacao: {
          conversa: {
            atendimento_setor: {
              setor: {
                id: 2,
                setor: "Finanças",
                sigla_setor: "FIN",
                secretaria: { secretaria: "Secretaria da Fazenda" },
              },
            },
          },
        },
      },
      {
        id: 10,
        nota: 4,
        descricao: null,
        criada_em: criadaEmTributos,
        avaliador: { id: 21, nome: "Carlos Lima" },
        finalizacao: {
          conversa: {
            atendimento_setor: {
              setor: {
                id: 3,
                setor: "Tributos",
                sigla_setor: "TRI",
                secretaria: { secretaria: "Secretaria da Fazenda" },
              },
            },
          },
        },
      },
    ]);

    await expect(service.listarAvaliacoes()).resolves.toEqual([
      {
        id: 11,
        nota: 5,
        descricao: "Atendimento excelente",
        criadaEm: criadaEmFinancas,
        avaliador: { id: 20, nome: "Ana Souza" },
        setor: {
          id: 2,
          nome: "Finanças",
          sigla: "FIN",
          secretaria: "Secretaria da Fazenda",
        },
      },
      {
        id: 10,
        nota: 4,
        descricao: null,
        criadaEm: criadaEmTributos,
        avaliador: { id: 21, nome: "Carlos Lima" },
        setor: {
          id: 3,
          nome: "Tributos",
          sigla: "TRI",
          secretaria: "Secretaria da Fazenda",
        },
      },
    ]);
    expect(prismaMock.avaliacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          criada_em: {
            gte: expect.any(Date),
          },
        },
        orderBy: [
          { criada_em: "desc" },
          { id: "desc" },
        ],
      }),
    );
  });

  it("carrega as 50 mensagens mais recentes em ordem cronológica", async () => {
    prismaMock.mensagem.findMany.mockResolvedValue([
      mensagem(3),
      mensagem(2),
      mensagem(1),
    ]);

    const resultado = await service.listarMensagens(1, 10);

    expect(prismaMock.mensagem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversa_id: 10 },
        orderBy: { id: "desc" },
        take: 50,
      }),
    );
    expect(resultado.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("carrega somente mensagens posteriores ao último ID", async () => {
    prismaMock.mensagem.findMany.mockResolvedValue([
      mensagem(11),
      mensagem(12),
    ]);

    const resultado = await service.listarMensagens(1, 10, {
      depoisDe: 10,
      limite: 100,
    });

    expect(prismaMock.mensagem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          conversa_id: 10,
          id: { gt: 10 },
        },
        orderBy: { id: "asc" },
        take: 100,
      }),
    );
    expect(resultado.map((item) => item.id)).toEqual([11, 12]);
  });

  it("carrega mensagens anteriores e devolve em ordem cronológica", async () => {
    prismaMock.mensagem.findMany.mockResolvedValue([
      mensagem(9),
      mensagem(8),
    ]);

    const resultado = await service.listarMensagens(1, 10, {
      antesDe: 10,
      limite: 25,
    });

    expect(prismaMock.mensagem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          conversa_id: 10,
          id: { lt: 10 },
        },
        orderBy: { id: "desc" },
        take: 25,
      }),
    );
    expect(resultado.map((item) => item.id)).toEqual([8, 9]);
  });

  it("impede abrir uma conversa privada ocultada para o usuário", async () => {
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        {
          usuario_id: 1,
          ocultada_em: new Date("2026-09-02T12:00:00.000Z"),
          cadastro: { tipo_usuario: "user" },
        },
        {
          usuario_id: 2,
          ocultada_em: null,
          cadastro: { tipo_usuario: "admin" },
        },
      ],
      atendimento_setor: null,
    });

    await expect(service.listarMensagens(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("mostra somente mensagens privadas posteriores à reabertura", async () => {
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        {
          usuario_id: 1,
          ocultada_em: null,
          visivel_desde_mensagem_id: 50,
          cadastro: { tipo_usuario: "user" },
        },
        {
          usuario_id: 2,
          ocultada_em: null,
          visivel_desde_mensagem_id: null,
          cadastro: { tipo_usuario: "admin" },
        },
      ],
      atendimento_setor: null,
    });
    prismaMock.mensagem.findMany.mockResolvedValue([]);

    await service.listarMensagens(1, 10);

    expect(prismaMock.mensagem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          conversa_id: 10,
          id: { gte: 50 },
        }),
      }),
    );
  });

  it("reabre a conversa para o usuário ao receber mensagem administrativa", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 2,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: 7,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        {
          usuario_id: 2,
          ocultada_em: null,
          visivel_desde_mensagem_id: null,
          cadastro: { tipo_usuario: "admin" },
        },
        {
          usuario_id: 1,
          ocultada_em: new Date("2026-09-02T12:00:00.000Z"),
          visivel_desde_mensagem_id: null,
          cadastro: { tipo_usuario: "user" },
        },
      ],
      atendimento_setor: null,
    });
    prismaMock.mensagem.create.mockResolvedValue({
      id: 20,
      conversa_id: 10,
      remetente_id: 2,
      origem: "usuario",
      conteudo: "Nova mensagem",
      enviada_em: new Date("2026-09-02T13:00:00.000Z"),
      arquivo_nome: null,
      arquivo_url: null,
      arquivo_tipo: null,
      arquivo_mime: null,
      arquivo_tamanho: null,
      remetente: {
        id: 2,
        nome: "Administrador",
        tipo_usuario: "admin",
        foto_perfil_url: null,
      },
    });

    await service.enviarMensagem(2, 10, "Nova mensagem");

    expect(prismaMock.conversa_participante.updateMany).toHaveBeenCalledWith({
      where: {
        conversa_id: 10,
        ocultada_em: { not: null },
        cadastro: { tipo_usuario: "user" },
      },
      data: {
        ocultada_em: null,
        visivel_desde_mensagem_id: 20,
      },
    });
  });

  it("recusa filtros anterior e posterior ao mesmo tempo", async () => {
    await expect(
      service.listarMensagens(1, 10, {
        depoisDe: 10,
        antesDe: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("lista para o admin somente atendimentos dos setores da sua secretaria", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: 7,
    });

    await expect(service.listarAtendimentos(1)).resolves.toEqual([]);
    expect(prismaMock.conversa_setor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          setor: {
            secretaria_id: 7,
          },
        },
      }),
    );
  });

  it("não lista atendimentos antigos ocultados para o usuário comum", async () => {
    await expect(service.listarAtendimentos(1)).resolves.toEqual([]);

    expect(prismaMock.conversa_setor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuario_id: 1,
          ocultada_para_usuario_em: null,
        },
      }),
    );
  });

  it("impede abrir diretamente atendimento ocultado para o usuário", async () => {
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 1,
        ocultada_para_usuario_em: new Date("2026-09-02T12:00:00.000Z"),
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
          secretaria_id: 7,
        },
        usuario: {
          id: 1,
          nome: "Usuário",
        },
      },
    });

    await expect(service.listarMensagens(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("retorna lista vazia para admin sem secretaria", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: null,
    });

    await expect(service.listarAtendimentos(1)).resolves.toEqual([]);
    expect(prismaMock.conversa_setor.findMany).not.toHaveBeenCalled();
  });

  it("permite admin abrir atendimento de setor da sua secretaria", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: 7,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
          secretaria_id: 7,
        },
        usuario: {
          id: 3,
          nome: "Munícipe",
        },
      },
    });
    prismaMock.mensagem.findMany.mockResolvedValue([]);

    await expect(service.listarMensagens(1, 10)).resolves.toEqual([]);
  });

  it("impede admin sem secretaria de abrir atendimento diretamente", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
          secretaria_id: 7,
        },
        usuario: {
          id: 3,
          nome: "Munícipe",
        },
      },
    });

    await expect(service.listarMensagens(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("impede admin de abrir atendimento de setor de outra secretaria", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: 7,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
          secretaria_id: 8,
        },
        usuario: {
          id: 3,
          nome: "Munícipe",
        },
      },
    });

    await expect(service.listarMensagens(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("permite admin enviar mensagem em atendimento de setor da sua secretaria", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: 7,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
          secretaria_id: 7,
        },
        usuario: {
          id: 3,
          nome: "Munícipe",
        },
      },
    });
    prismaMock.mensagem.create.mockResolvedValue({
      id: 20,
      conversa_id: 10,
      remetente_id: 1,
      origem: "usuario",
      conteudo: "Resposta do administrador",
      enviada_em: new Date("2026-08-28T12:00:00.000Z"),
      arquivo_nome: null,
      arquivo_url: null,
      arquivo_tipo: null,
      arquivo_mime: null,
      arquivo_tamanho: null,
      remetente: {
        id: 1,
        nome: "Administrador",
        tipo_usuario: "admin",
      },
    });

    await expect(
      service.enviarMensagem(1, 10, "Resposta do administrador"),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 20,
        conversaId: 10,
        origem: "usuario",
        remetente: expect.objectContaining({
          tipo: "admin",
          id: 1,
        }),
      }),
    );
    expect(prismaMock.mensagem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conversa_id: 10,
          remetente_id: 1,
          origem: "usuario",
          conteudo: "Resposta do administrador",
        }),
      }),
    );
  });

  it("permite admin sinalizar digitação em atendimento da sua secretaria", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
      secretaria_id: 7,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
          secretaria_id: 7,
        },
        usuario: {
          id: 3,
          nome: "Munícipe",
        },
      },
    });

    await expect(service.atualizarDigitacao(1, 10, true)).resolves.toEqual({
      conversaId: 10,
      digitando: true,
    });
  });

  it("permite superAdmin fiscalizar conversa privada entre perfis inferiores", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "user" } },
      ],
      atendimento_setor: null,
    });
    prismaMock.mensagem.findMany.mockResolvedValue([]);

    await expect(service.listarMensagens(9, 10)).resolves.toEqual([]);
  });

  it("impede superAdmin de visualizar conversa privada de outro superAdmin", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        { usuario_id: 7, cadastro: { tipo_usuario: "superAdmin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "user" } },
      ],
      atendimento_setor: null,
    });

    await expect(service.listarMensagens(9, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("lista conversas próprias e conversas inferiores para o superAdmin", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
    });
    prismaMock.conversa.findMany.mockResolvedValue([]);

    await service.listar(9);

    expect(prismaMock.conversa.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            {
              conversa_participante: {
                some: { usuario_id: 9, ocultada_em: null },
              },
            },
            {
              conversa_participante: {
                none: {
                  cadastro: { tipo_usuario: "superAdmin" },
                },
              },
            },
          ],
        }),
      }),
    );
  });

  it("permite conversa privada entre dois superAdmins quando o solicitante participa", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        {
          usuario_id: 9,
          ocultada_em: null,
          cadastro: { tipo_usuario: "superAdmin" },
        },
        {
          usuario_id: 7,
          ocultada_em: null,
          cadastro: { tipo_usuario: "superAdmin" },
        },
      ],
      atendimento_setor: null,
    });
    prismaMock.mensagem.findMany.mockResolvedValue([]);

    await expect(service.listarMensagens(9, 10)).resolves.toEqual([]);
  });

  it("mantém a fiscalização de conversas privadas somente para leitura", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "user" } },
      ],
      atendimento_setor: null,
    });

    await expect(
      service.enviarMensagem(9, 10, "Mensagem indevida"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("cria grupo com o nome escolhido e inclui o criador", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "admin",
      desativado_em: null,
    });
    prismaMock.cadastro.findMany.mockResolvedValue([
      { id: 2 },
      { id: 3 },
    ]);
    prismaMock.conversa.create.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      nome: "Equipe de atendimento",
      criada_em: new Date("2026-09-01T12:00:00.000Z"),
      conversa_participante: [
        { usuario_id: 1, cadastro: { id: 1, nome: "Admin" } },
        { usuario_id: 2, cadastro: { id: 2, nome: "Contato A" } },
        { usuario_id: 3, cadastro: { id: 3, nome: "Contato B" } },
      ],
    });

    await expect(
      service.criarGrupo(1, "  Equipe de atendimento  ", [2, 3]),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 30,
        tipo: "grupo",
        nome: "Equipe de atendimento",
        totalParticipantes: 3,
      }),
    );

    expect(prismaMock.conversa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: "grupo",
          nome: "Equipe de atendimento",
          conversa_participante: {
            create: [
              { cadastro: { connect: { id: 1 } } },
              { cadastro: { connect: { id: 2 } } },
              { cadastro: { connect: { id: 3 } } },
            ],
          },
        }),
      }),
    );
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(3);
  });

  it("adiciona pelo menos um novo participante ao grupo", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "admin",
      desativado_em: null,
    });
    prismaMock.cadastro.findMany.mockResolvedValue([{ id: 2 }]);
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [{ usuario_id: 1 }],
    });
    prismaMock.conversa.update.mockResolvedValue({
      id: 30,
      conversa_participante: [
        { cadastro: { id: 1, nome: "Admin" } },
        { cadastro: { id: 2, nome: "Contato" } },
      ],
    });

    await expect(
      service.adicionarParticipantesGrupo(1, 30, [2]),
    ).resolves.toEqual({
      grupoId: 30,
      participantes: [
        { id: 1, nome: "Admin" },
        { id: 2, nome: "Contato" },
      ],
      totalParticipantes: 2,
    });

    expect(prismaMock.conversa.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 30 },
        data: {
          conversa_participante: {
            create: [
              { cadastro: { connect: { id: 2 } } },
            ],
          },
        },
      }),
    );
  });

  it("impede que quem não participa adicione pessoas ao grupo", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "admin",
      desativado_em: null,
    });
    prismaMock.cadastro.findMany.mockResolvedValue([{ id: 2 }]);
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [{ usuario_id: 3 }],
    });

    await expect(
      service.adicionarParticipantesGrupo(1, 30, [2]),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaMock.conversa.update).not.toHaveBeenCalled();
  });

  it("impede adicionar usuário comum ao grupo", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "admin",
      desativado_em: null,
    });
    prismaMock.cadastro.findMany.mockResolvedValue([
      { id: 2 },
    ]);

    await expect(
      service.criarGrupo(1, "Grupo interno", [2, 3]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.conversa.create).not.toHaveBeenCalled();
  });

  it("impede criar o grupo se o criador for desativado durante a operação", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "user",
      desativado_em: new Date("2026-09-02T12:00:00.000Z"),
    });

    await expect(
      service.criarGrupo(1, "Grupo interno", [2, 3]),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(3);
    expect(prismaMock.cadastro.findMany).not.toHaveBeenCalled();
    expect(prismaMock.conversa.create).not.toHaveBeenCalled();
  });

  it("lista para funcionário somente os grupos dos quais participa", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "funcionario",
    });
    prismaMock.conversa.findMany.mockResolvedValue([]);

    await expect(service.listarGrupos(1)).resolves.toEqual([]);
    expect(prismaMock.conversa.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tipo: "grupo",
          conversa_participante: {
            some: { usuario_id: 1 },
          },
        },
      }),
    );
  });

  it("remove o participante e sua leitura ao sair do grupo", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "funcionario",
      desativado_em: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [{ usuario_id: 1 }],
    });

    await expect(service.sairDoGrupo(1, 30)).resolves.toEqual({
      grupoId: 30,
      totalParticipantes: 2,
      somenteLeitura: false,
    });
    expect(prismaMock.conversa_leitura.deleteMany).toHaveBeenCalledWith({
      where: { conversa_id: 30, usuario_id: 1 },
    });
    expect(prismaMock.conversa_participante.delete).toHaveBeenCalledWith({
      where: {
        conversa_id_usuario_id: {
          conversa_id: 30,
          usuario_id: 1,
        },
      },
    });
    expect(prismaMock.conversa_participante.count).toHaveBeenCalledWith({
      where: { conversa_id: 30 },
    });
  });

  it("mantém o grupo somente para leitura quando o superAdmin sai", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      tipo_usuario: "superAdmin",
      desativado_em: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [{ usuario_id: 9 }],
    });

    await expect(service.sairDoGrupo(9, 30)).resolves.toEqual({
      grupoId: 30,
      totalParticipantes: 2,
      somenteLeitura: true,
    });
  });

  it("impede sair de um grupo do qual não participa", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      tipo_usuario: "admin",
      desativado_em: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [],
    });

    await expect(service.sairDoGrupo(1, 30)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.conversa_participante.delete).not.toHaveBeenCalled();
  });

  it("permite que superAdmin visualize grupo sem participar", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
      secretaria_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "funcionario" } },
      ],
      atendimento_setor: null,
    });
    prismaMock.mensagem.findMany.mockResolvedValue([]);

    await expect(service.listarMensagens(9, 30)).resolves.toEqual([]);
  });

  it("mantém superAdmin não participante em somente leitura", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
      secretaria_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "funcionario" } },
      ],
      atendimento_setor: null,
    });

    await expect(
      service.enviarMensagem(9, 30, "Mensagem indevida"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prismaMock.mensagem.create).not.toHaveBeenCalled();
  });

  it("permite que participante envie mensagem no grupo como usuário", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 3,
      nome: "Funcionário participante",
      tipo_usuario: "funcionario",
      setor_id: 2,
      secretaria_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "funcionario" } },
      ],
      atendimento_setor: null,
    });
    prismaMock.mensagem.create.mockResolvedValue({
      id: 31,
      conversa_id: 30,
      remetente_id: 3,
      origem: "usuario",
      conteudo: "Olá, grupo",
      enviada_em: new Date("2026-09-01T13:00:00.000Z"),
      remetente: {
        id: 3,
        nome: "Funcionário participante",
        tipo_usuario: "funcionario",
      },
    });

    await expect(
      service.enviarMensagem(3, 30, "Olá, grupo"),
    ).resolves.toEqual(
      expect.objectContaining({
        conversaId: 30,
        origem: "usuario",
      }),
    );
    expect(prismaMock.mensagem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conversa_id: 30,
          remetente_id: 3,
          origem: "usuario",
        }),
      }),
    );
  });

  it("impede contato fora do grupo de visualizar mensagens", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 8,
      nome: "Funcionário externo",
      tipo_usuario: "funcionario",
      setor_id: 2,
      secretaria_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
        { usuario_id: 3, cadastro: { tipo_usuario: "funcionario" } },
      ],
      atendimento_setor: null,
    });

    await expect(service.listarMensagens(8, 30)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("impede usuário comum de visualizar grupo mesmo se constar como participante", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 7,
      nome: "Usuário comum",
      tipo_usuario: "user",
      setor_id: null,
      secretaria_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 30,
      tipo: "grupo",
      conversa_participante: [
        { usuario_id: 7, cadastro: { tipo_usuario: "user" } },
        { usuario_id: 2, cadastro: { tipo_usuario: "admin" } },
      ],
      atendimento_setor: null,
    });

    await expect(service.listarMensagens(7, 30)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("permite que superAdmin sinalize digitação em atendimento de setor", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 9,
      nome: "Super administrador",
      tipo_usuario: "superAdmin",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
        setor: {
          id: 2,
          setor: "Atendimento",
          sigla_setor: "ATD",
        },
        usuario: {
          id: 3,
          nome: "Munícipe",
        },
      },
    });

    await expect(service.atualizarDigitacao(9, 10, true)).resolves.toEqual({
      conversaId: 10,
      digitando: true,
    });
  });
});
