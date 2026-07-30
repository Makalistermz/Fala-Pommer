import brasao from "../assets/img/brasao.png";
import imagemLogin from "../assets/img/imagem-pagina-login.png";
import "./LoginCadastro.css";
import { Link } from "react-router";

import {
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

import { jwtDecode } from "jwt-decode";

interface GoogleUser {
  iss: string;
  nbf: number;
  aud: string;
  sub: string; // ID único do usuário no Google
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string; // URL da foto de perfil
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}

function Login() {
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

        // Futuramente:
        // enviar token para o backend validar
    }

    function handleError() {
        console.error("Falha na autenticação do Google.");
    }

  return (
    <main className="login">
      <section className="login__formulario">
        <header className="login__cabecalho">
          <img src={brasao} alt="Brasão da Prefeitura" />
          <span>Prefeitura Municipal de Santa Maria de Jetibá</span>
        </header>

        <div className="login__conteudo">
          <h1>Bem-vindo de volta</h1>
          <p>Informe seus dados para entrar</p>

          <form>
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

              <a href="/recuperar-senha">Esqueci minha senha</a>
            </div>

            <button className="login__botao" type="submit">
              Entrar
            </button>
          </form>

        <div className="login__google">
            <p className="">Ou continue com</p>

            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="outline"
              shape="rectangular"
              text="signin_with"
              width={430}
            />
        </div>

          <p className="login__cadastro">
            Ainda não possui conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </section>

      <section className="login__ilustracao">
        <img
          src={imagemLogin}
          alt="Ilustração de comunicação e atendimento"
        />
      </section>
    </main>
  );
}

export default Login;