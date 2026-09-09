import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  apiFetch,
  limparSessaoLocal,
  observarSessaoEncerrada,
  obterAccessToken,
  registrarTokensSessao,
  revogarSessaoAtual,
} from "../services/api";
import {
  AutenticacaoContext,
  type TokensAutenticacao,
  type UsuarioAutenticado,
} from "./AutenticacaoContext";

interface AutenticacaoProviderProps {
  children: ReactNode;
}

export function AutenticacaoProvider({
  children,
}: AutenticacaoProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    // Sincroniza a interface quando o cliente HTTP encerra uma sessão inválida.
    const removerObservador = observarSessaoEncerrada(() => {
      if (ativo) {
        setUsuario(null);
        setCarregando(false);
      }
    });

    async function restaurarSessao() {
      // Evita consultar o perfil quando não há nenhuma autenticação anterior.
      if (!obterAccessToken()) {
        if (ativo) {
          setCarregando(false);
        }
        return;
      }

      try {
        // O backend confirma a validade, o perfil e a sessão vinculada ao JWT.
        const resposta = await apiFetch("/auth/perfil");

        if (!resposta.ok) {
          limparSessaoLocal();
          return;
        }

        const perfil = (await resposta.json()) as UsuarioAutenticado;

        if (ativo) {
          setUsuario(perfil);
        }
      } catch {
        limparSessaoLocal();
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void restaurarSessao();

    return () => {
      ativo = false;
      removerObservador();
    };
  }, []);

  const iniciarSessao = useCallback(
    (tokens: TokensAutenticacao, usuarioLogado: UsuarioAutenticado) => {
      // Disponibiliza os tokens ao cliente HTTP e libera as rotas protegidas.
      registrarTokensSessao(tokens);
      setUsuario(usuarioLogado);
      setCarregando(false);
    },
    [],
  );

  const encerrarSessao = useCallback(async () => {
    // Revoga primeiro no backend e depois reflete o logout no estado global.
    await revogarSessaoAtual();
    setUsuario(null);
    setCarregando(false);
  }, []);

  const valor = useMemo(
    () => ({
      situacao: carregando
        ? ("carregando" as const)
        : usuario
          ? ("autenticado" as const)
          : ("deslogado" as const),
      usuario,
      iniciarSessao,
      encerrarSessao,
    }),
    [carregando, encerrarSessao, iniciarSessao, usuario],
  );

  return (
    <AutenticacaoContext.Provider value={valor}>
      {children}
    </AutenticacaoContext.Provider>
  );
}
