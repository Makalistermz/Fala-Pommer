// Exibe o formulário de acesso e a segunda etapa de verificação.
import brasao from "../assets/img/brasao.webp";
import { useEffect, useRef, useState } from "react";
import imagemLogin from "../assets/img/imagem-pagina-login.png";
import "./css/LoginCadastro.css";
import "./css/RecuperarSenha.css";
import { Link, Navigate, useNavigate } from "react-router";
import { ModalFeedback } from "../components/ModalFeedback";
import { useAutenticacao } from "../components/AutenticacaoContext";
import { requisicaoPublica } from "../services/api";

import {
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

import { jwtDecode } from "jwt-decode";

interface GoogleUser {
  iss: string;
  nbf: number;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}

interface RespostaApi {
  message?: string | string[];
  requer_segunda_etapa?: boolean;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  email_mascarado?: string;
  expira_em?: string;
  usuario?: {
    tipo: "user" | "admin" | "funcionario" | "superAdmin";
  };
}

interface DesafioLogin {
  token: string;
  emailMascarado: string;
  expiraEm?: string;
}

function mensagemDaResposta(resultado: RespostaApi) {
  if (Array.isArray(resultado.message)) {
    return resultado.message.join(", ");
  }

  return resultado.message || "Não foi possível concluir a solicitação.";
}

function formatarCodigoRecuperacao(valor: string) {
  const codigoLimpo = valor
    .toUpperCase()
    .replace(/[ILO01]/g, "")
    .replace(/[^A-Z2-9]/g, "")
    .slice(0, 8);

  if (codigoLimpo.length <= 4) {
    return codigoLimpo;
  }

  return `${codigoLimpo.slice(0, 4)}-${codigoLimpo.slice(4)}`;
}

function Login() {
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(430);
  const [etapa, setEtapa] = useState<"credenciais" | "verificacao">(
    "credenciais",
  );
  const [desafio, setDesafio] = useState<DesafioLogin | null>(null);
  const [codigo, setCodigo] = useState("");
  const [usarRecuperacao, setUsarRecuperacao] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [segundosReenvio, setSegundosReenvio] = useState(0);
  const [feedback, setFeedback] = useState({
    aberto: false,
    tipo: "erro" as "erro" | "sucesso",
    mensagem: "",
  });

  const navigate = useNavigate();
  const {
    iniciarSessao,
    situacao: situacaoAutenticacao,
    usuario: usuarioAutenticado,
  } = useAutenticacao();

  useEffect(() => {
    const container = googleButtonContainerRef.current;
    if (!container) return;

    const atualizarLargura = () => {
      setGoogleButtonWidth(Math.min(430, Math.floor(container.clientWidth)));
    };

    atualizarLargura();

    const observer = new ResizeObserver(atualizarLargura);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (segundosReenvio <= 0) return;

    const temporizador = window.setInterval(() => {
      setSegundosReenvio((segundos) => Math.max(0, segundos - 1));
    }, 1000);

    return () => window.clearInterval(temporizador);
  }, [segundosReenvio]);

  async function lerResposta(resposta: Response) {
    const resultado = (await resposta.json()) as RespostaApi;

    if (!resposta.ok) {
      throw new Error(mensagemDaResposta(resultado));
    }

    return resultado;
  }

  function concluirAcesso(resultado: RespostaApi) {
    if (
      !resultado.access_token ||
      !resultado.refresh_token ||
      !resultado.usuario
    ) {
      throw new Error("A resposta de autenticação está incompleta.");
    }

    // Entrega os tokens ao cliente central e atualiza o usuário global.
    iniciarSessao(
      {
        access_token: resultado.access_token,
        refresh_token: resultado.refresh_token,
      },
      resultado.usuario,
    );

    if (resultado.usuario.tipo === "user") {
      navigate("/sectors");
    } else {
      navigate("/home");
    }
  }

  function mostrarErro(erro: unknown) {
    setFeedback({
      aberto: true,
      tipo: "erro",
      mensagem:
        erro instanceof Error
          ? erro.message
          : "Não foi possível conectar com o servidor.",
    });
  }

  async function entrar(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);

    const formulario = new FormData(event.currentTarget);

    try {
      const resposta = await requisicaoPublica("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formulario.get("email"),
          senha: formulario.get("senha"),
        }),
      });
      const resultado = await lerResposta(resposta);

      if (resultado.requer_segunda_etapa) {
        if (!resultado.token || !resultado.email_mascarado) {
          throw new Error("Não foi possível iniciar a segunda etapa.");
        }

        setDesafio({
          token: resultado.token,
          emailMascarado: resultado.email_mascarado,
          expiraEm: resultado.expira_em,
        });
        setCodigo("");
        setUsarRecuperacao(false);
        setSegundosReenvio(60);
        setEtapa("verificacao");
        return;
      }

      concluirAcesso(resultado);
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarSegundaEtapa(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!desafio) return;

    setCarregando(true);

    try {
      const endpoint = usarRecuperacao
        ? "/auth/2fa/login/recovery"
        : "/auth/2fa/login/confirm";
      const corpo = usarRecuperacao
        ? {
            token: desafio.token,
            codigoRecuperacao: codigo,
          }
        : {
            token: desafio.token,
            codigo,
          };
      const resposta = await requisicaoPublica(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(corpo),
      });
      const resultado = await lerResposta(resposta);

      concluirAcesso(resultado);
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      setCarregando(false);
    }
  }

  async function reenviarCodigo() {
    if (!desafio || segundosReenvio > 0) return;

    setCarregando(true);

    try {
      const resposta = await requisicaoPublica("/auth/2fa/login/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: desafio.token,
        }),
      });
      const resultado = await lerResposta(resposta);

      setDesafio((atual) =>
        atual
          ? {
              ...atual,
              emailMascarado:
                resultado.email_mascarado || atual.emailMascarado,
              expiraEm: resultado.expira_em,
            }
          : atual,
      );
      setSegundosReenvio(60);
      setFeedback({
        aberto: true,
        tipo: "sucesso",
        mensagem: "Um novo código foi enviado para o seu e-mail.",
      });
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      setCarregando(false);
    }
  }

  function voltarParaCredenciais() {
    setEtapa("credenciais");
    setDesafio(null);
    setCodigo("");
    setUsarRecuperacao(false);
    setSegundosReenvio(0);
  }

  function alternarTipoCodigo() {
    setUsarRecuperacao((valor) => !valor);
    setCodigo("");
  }

  function handleSuccess(response: CredentialResponse) {
    const token = response.credential;

    if (!token) {
      console.error("O Google não retornou uma credencial.");
      return;
    }

    const usuario = jwtDecode<GoogleUser>(token);

    console.log("Usuário:", usuario);
    console.log("Nome:", usuario.name);
    console.log("E-mail:", usuario.email);
  }

  function handleError() {
    console.error("Falha na autenticação do Google.");
  }

  if (situacaoAutenticacao === "carregando") {
    return <p>Restaurando sessão...</p>;
  }

  if (usuarioAutenticado) {
    // Impede que uma sessão válida volte a exibir o formulário de login.
    return (
      <Navigate
        to={usuarioAutenticado.tipo === "user" ? "/sectors" : "/home"}
        replace
      />
    );
  }

  return (
    <main className="login">
      <section className="login__formulario">
        <header className="login__cabecalho">
          <img src={brasao} alt="Brasão da Prefeitura" />
          <span>Prefeitura Municipal de Santa Maria de Jetibá</span>
        </header>

        <div className="login__conteudo">
          <h1>
            {etapa === "credenciais"
              ? "Bem-vindo de volta"
              : "Verifique seu acesso"}
          </h1>
          <p>
            {etapa === "credenciais"
              ? "Informe seus dados para entrar"
              : usarRecuperacao
                ? "Informe um dos seus códigos de recuperação"
                : `Enviamos um código para ${desafio?.emailMascarado || "seu e-mail"}`}
          </p>

          {etapa === "credenciais" ? (
            <>
              <form onSubmit={entrar}>
                <div className="campo">
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="senha">Senha</label>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="login__opcoes">
                  <label className="lembrar">
                    <input type="checkbox" name="lembrar" />
                    Lembrar de mim
                  </label>
                  <Link to="/recuperar-senha">Esqueci minha senha</Link>
                </div>

                <button
                  className="login__botao"
                  type="submit"
                  disabled={carregando}
                >
                  {carregando ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <div className="login__google">
                <p>Ou continue com</p>
                <div
                  className="login__google-botao"
                  ref={googleButtonContainerRef}
                >
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="outline"
                    shape="rectangular"
                    text="signin_with"
                    width={googleButtonWidth}
                  />
                </div>
              </div>

              <p className="login__cadastro">
                Ainda não possui conta? <Link to="/cadastro">Cadastre-se</Link>
              </p>
            </>
          ) : (
            <form className="login-2fa" onSubmit={confirmarSegundaEtapa}>
              <div className="login-2fa__aviso" aria-live="polite">
                <strong>
                  {usarRecuperacao ? "Código de recuperação" : "Código por e-mail"}
                </strong>
                <span>
                  {usarRecuperacao
                    ? "Cada código funciona uma única vez."
                    : "O código possui 6 dígitos e expira em 5 minutos."}
                </span>
              </div>

              <div className="campo">
                <label htmlFor="codigo-2fa">
                  {usarRecuperacao
                    ? "Código de recuperação"
                    : "Código de verificação"}
                </label>
                <input
                  id="codigo-2fa"
                  name="codigo"
                  type="text"
                  inputMode={usarRecuperacao ? "text" : "numeric"}
                  autoComplete="one-time-code"
                  placeholder={usarRecuperacao ? "ABCD-EFGH" : "000000"}
                  value={codigo}
                  onChange={(evento) =>
                    setCodigo(
                      usarRecuperacao
                        ? formatarCodigoRecuperacao(evento.target.value)
                        : evento.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  minLength={usarRecuperacao ? 9 : 6}
                  maxLength={usarRecuperacao ? 9 : 6}
                  required
                  autoFocus
                />
              </div>

              <button
                className="login__botao"
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Verificando..." : "Verificar e entrar"}
              </button>

              <div className="login-2fa__acoes">
                {!usarRecuperacao && (
                  <button
                    type="button"
                    onClick={reenviarCodigo}
                    disabled={carregando || segundosReenvio > 0}
                  >
                    {segundosReenvio > 0
                      ? `Reenviar em ${segundosReenvio}s`
                      : "Reenviar código"}
                  </button>
                )}
                <button type="button" onClick={alternarTipoCodigo}>
                  {usarRecuperacao
                    ? "Usar código enviado por e-mail"
                    : "Usar código de recuperação"}
                </button>
                <button type="button" onClick={voltarParaCredenciais}>
                  Voltar ao login
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="login__ilustracao">
        <img
          src={imagemLogin}
          alt="Ilustração de comunicação e atendimento"
        />
      </section>

      <ModalFeedback
        aberto={feedback.aberto}
        tipo={feedback.tipo}
        mensagem={feedback.mensagem}
        aoFechar={() => {
          setFeedback((estadoAtual) => ({
            ...estadoAtual,
            aberto: false,
          }));
        }}
      />
    </main>
  );
}

export default Login;
