import imagemCadastro from "../assets/img/imagem-pagina-cadastro.png"

function Cadastro() {

    async function cadastrar(
    event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const dadosFormulario = new FormData(event.currentTarget);

        const dados = Object.fromEntries(dadosFormulario.entries());

        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados),
            });

            if(!resposta.ok) {
                throw new Error(`Erro no servidor: ${resposta.status}`)
            }

            const resultado = await resposta.json();

            console.log(resultado.mensagem);
        } catch (erro) {
            console.error("Falha ao enviar o cadastro:", erro);
        }
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
                            <label htmlFor="confirmarSenha">Confirmar senha</label>
                            <input
                                id="confirmarSenha"
                                name="confirmarSenha"
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