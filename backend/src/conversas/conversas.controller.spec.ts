// Testa o encaminhamento dos filtros de mensagens pelo controlador.
import { type RequisicaoAutenticada } from "../auth/auth.guard";
import { ConversasController } from "./conversas.controller";
import { ConversasService } from "./conversas.service";

describe("ConversasController", () => {
  const conversasServiceMock = {
    listarMensagens: jest.fn(),
  };

  const controller = new ConversasController(
    conversasServiceMock as unknown as ConversasService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("encaminha usuário, conversa e paginação ao serviço", () => {
    const requisicao = {
      usuario: {
        sub: 7,
      },
    } as RequisicaoAutenticada;
    const consulta = {
      depoisDe: 100,
      limite: 50,
    };

    controller.listarMensagens(requisicao, 15, consulta);

    expect(conversasServiceMock.listarMensagens).toHaveBeenCalledWith(
      7,
      15,
      consulta,
    );
  });
});
