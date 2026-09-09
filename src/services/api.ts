const API_URL = import.meta.env.VITE_API_URL;
const CHAVE_ACCESS_TOKEN = "access_token";
const EVENTO_SESSAO_ENCERRADA = "fala-pommer:sessao-encerrada";

interface TokensSessao {
  access_token: string;
  refresh_token: string;
}

let refreshTokenEmMemoria: string | null = null;
let renovacaoEmAndamento: Promise<boolean> | null = null;

// Mantém compatibilidade com as telas que ainda consultam o access token diretamente.
export function obterAccessToken() {
  return localStorage.getItem(CHAVE_ACCESS_TOKEN);
}

export function registrarTokensSessao(tokens: TokensSessao) {
  localStorage.setItem(CHAVE_ACCESS_TOKEN, tokens.access_token);
  // O refresh token só será persistido após os armazenamentos seguros web e APK.
  refreshTokenEmMemoria = tokens.refresh_token;
}

// Limpa os tokens e avisa o contexto para atualizar imediatamente a interface.
export function limparSessaoLocal() {
  localStorage.removeItem(CHAVE_ACCESS_TOKEN);
  refreshTokenEmMemoria = null;
  window.dispatchEvent(new Event(EVENTO_SESSAO_ENCERRADA));
}

export function observarSessaoEncerrada(aoEncerrar: () => void) {
  window.addEventListener(EVENTO_SESSAO_ENCERRADA, aoEncerrar);

  return () => {
    window.removeEventListener(EVENTO_SESSAO_ENCERRADA, aoEncerrar);
  };
}

export function requisicaoPublica(
  caminho: string,
  opcoes: RequestInit = {},
) {
  // Prepara as chamadas para receber cookies HttpOnly em uma etapa posterior.
  return fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    credentials: "include",
  });
}

async function executarRequisicaoAutenticada(
  caminho: string,
  opcoes: RequestInit,
) {
  // Centraliza a inclusão do JWT em todas as requisições autenticadas novas.
  const headers = new Headers(opcoes.headers);
  const accessToken = obterAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
    credentials: "include",
  });
}

async function renovarAccessToken() {
  // Sem uma credencial de renovação não é possível prolongar a sessão atual.
  if (!refreshTokenEmMemoria) {
    return false;
  }

  const resposta = await requisicaoPublica("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: refreshTokenEmMemoria,
    }),
  });

  if (!resposta.ok) {
    limparSessaoLocal();
    return false;
  }

  const tokens = (await resposta.json()) as Partial<TokensSessao>;

  if (!tokens.access_token || !tokens.refresh_token) {
    limparSessaoLocal();
    return false;
  }

  registrarTokensSessao({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  return true;
}

function renovarAccessTokenUmaVez() {
  // Compartilha uma única renovação entre requisições que recebem 401 juntas.
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = renovarAccessToken().finally(() => {
      renovacaoEmAndamento = null;
    });
  }

  return renovacaoEmAndamento;
}

export async function apiFetch(
  caminho: string,
  opcoes: RequestInit = {},
) {
  let resposta = await executarRequisicaoAutenticada(caminho, opcoes);

  if (resposta.status !== 401) {
    return resposta;
  }

  const renovado = await renovarAccessTokenUmaVez();

  if (!renovado) {
    limparSessaoLocal();
    return resposta;
  }

  // Repete a requisição original com o novo access token.
  resposta = await executarRequisicaoAutenticada(caminho, opcoes);

  if (resposta.status === 401) {
    limparSessaoLocal();
  }

  return resposta;
}

export async function revogarSessaoAtual() {
  // A limpeza local ocorre mesmo se o servidor estiver indisponível.
  try {
    if (obterAccessToken()) {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    }
  } finally {
    limparSessaoLocal();
  }
}
