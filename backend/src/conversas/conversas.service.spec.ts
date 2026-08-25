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
    cadastro: {
      findUnique: jest.fn(),
    },
    conversa: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    mensagem: {
      findMany: jest.fn(),
    },
  };

  let service: ConversasService;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Usuário",
      tipo_usuario: "user",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "privada",
      conversa_participante: [{ usuario_id: 1 }],
      atendimento_setor: null,
    });
    service = new ConversasService(
      prismaMock as unknown as PrismaService,
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

  it("recusa filtros anterior e posterior ao mesmo tempo", async () => {
    await expect(
      service.listarMensagens(1, 10, {
        depoisDe: 10,
        antesDe: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
  });

  it("impede admin de listar atendimentos de setor", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
    });

    await expect(service.listarAtendimentos(1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("impede admin de abrir atendimento de setor pelo ID", async () => {
    prismaMock.cadastro.findUnique.mockResolvedValue({
      id: 1,
      nome: "Administrador",
      tipo_usuario: "admin",
      setor_id: null,
    });
    prismaMock.conversa.findUnique.mockResolvedValue({
      id: 10,
      tipo: "setor",
      conversa_participante: [],
      atendimento_setor: {
        setor_id: 2,
        usuario_id: 3,
      },
    });

    await expect(service.listarMensagens(1, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.mensagem.findMany).not.toHaveBeenCalled();
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

  it("filtra da lista do superAdmin as conversas privadas de outros superAdmins", async () => {
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
          conversa_participante: {
            none: {
              usuario_id: { not: 9 },
              cadastro: { tipo_usuario: "superAdmin" },
            },
          },
        }),
      }),
    );
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
