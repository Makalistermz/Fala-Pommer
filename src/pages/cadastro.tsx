import imagemCadastro from "../assets/img/imagem-pagina-cadastro.png"

function Cadastro() {

    async function cadastrar(
    event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const dadosFormulario = new FormData(event.currentTarget);

        const dados = Object.fromEntries(dadosFormulario.entries());

        console.log(dados)
    }

    return (
        <main className="cadastro">
            <section className="cadastro__ilustracao">
                <img
                  src={imagemCadastro}
                  alt="Ilustração de comunicação e atendimento"
                />
              </section>

              <section className="cadastro__formulario">

                <section className="cadastro__conteudo">
                    <h1>Bem-vindo ao Fala Pommer</h1>
                    <p>Preencha os dados para concluir o cadastro</p>
                    <form method="POST" onSubmit={cadastrar}>
                        <div className="campo">
                            <label htmlFor="nome">Nome completo</label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                placeholder="Digite seu nome completo"
                                autoComplete="additional-name"
                                required
                            />
                        </div>
                        <div className="campo">
                            <label htmlFor="dataNascimento">Data de nascimento</label>
                            <input
                                id="dataNascimento"
                                name="dataNascimento"
                                type="date"
                                required
                            />
                        </div>
                        <div className="campo">
                            <label htmlFor="cpf">CPF</label>
                            <input
                                id="cpf"
                                name="cpf"
                                type="text"
                                inputMode="numeric"
                                placeholder="Ex: 999.999.999-99"
                                autoComplete="off"
                                maxLength={14}
                                required
                            />
                        </div>
                        <div className="campo">
                            <label htmlFor="numeroTelefone">Telefone</label>
                    
                            <input
                                id="numeroTelefone"
                                name="numeroTelefone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="Ex: (27) 99999-9999"
                                maxLength={15}
                            />
                        </div>
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
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div className="campo">
                            <label htmlFor="Confirmarsenha">Confirmar senha</label>
                            <input
                                id="Confirmarsenha"
                                name="Confirmarsenha"
                                type="password"
                                placeholder="Confirme sua senha"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <button className="cadastro__botao" type="submit">
                            Cadastrar
                        </button>
                    </form>
                </section>
              </section>
        </main>
    );
}

export default Cadastro;