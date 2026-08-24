// Testa a paginação e a busca incremental de mensagens.
import { BadRequestException } from "@nestjs/common";
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
});
