import brasao from "../assets/img/brasao.png";
import imagemLogin from "../assets/img/imagem-pagina-login.png";
import "./Login.css";

function Login() {
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

          <p className="login__cadastro">
            Ainda não possui conta? <a href="/cadastro">Cadastre-se</a>
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