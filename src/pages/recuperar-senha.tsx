import { Link } from "react-router";
import imagemRecuperacao from "../assets/img/imagem-recuperar-senha.png";
import "./RecuperarSenha.css";

function RecuperarSenha() {
  function solicitarRecuperacao(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formulario = new FormData(event.currentTarget);
    const email = formulario.get("email");

    console.log("E-mail informado:", email);

    // Na próxima etapa enviar esse e-mail ao backend.
  }

  return (
    <main className="recuperacao">
      <section className="recuperacao__formulario">

        <div className="recuperacao__conteudo">
          <Link
            className="voltar"
            to="/"
          >
            <span aria-hidden="true">←</span>
            Voltar para o login
          </Link>

          <h1>Recuperar senha</h1>

          <p>
            Informe o e-mail cadastrado. Enviaremos um
            link para você redefinir sua senha.
          </p>

          <form onSubmit={solicitarRecuperacao}>
            <div className="recuperacao__campo">
              <label htmlFor="email">E-mail</label>

              <div className="recuperacao__input">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 5h18v14H3V5Zm2 2v.4l7 4.7 7-4.7V7H5Zm14 10V9.8l-7 4.7-7-4.7V17h14Z" />
                </svg>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              className="recuperacao__botao"
              type="submit"
            >
              Enviar link de recuperação
            </button>
          </form>

          <p className="recuperacao__entrar">
            Lembrou sua senha?{" "}
            <Link to="/">Entrar</Link>
          </p>
        </div>
      </section>

      <section
        className="recuperacao__ilustracao"
        aria-label="Ilustração de recuperação de senha"
      >
        <img
          src={imagemRecuperacao}
          alt="Pessoa recebendo um e-mail seguro para recuperar a senha"
        />
      </section>
    </main>
  );
}

export default RecuperarSenha;