import brasao from "../assets/img/brasao.png";
import imagemCadastro from "../assets/img/imagem-pagina-cadastro.png"

function Cadastro() {
    return (
        <main className="cadastro">
            <section className="cadastro__ilustracao">
                <img
                  src={imagemCadastro}
                  alt="Ilustração de comunicação e atendimento"
                />
              </section>

              <section className="cadastro__formulario">
                <header className="cadastro__cabecalho">
                  <img src={brasao} alt="Brasão da Prefeitura" />
                  <span>Prefeitura Municipal de Santa Maria de Jetibá</span>
                </header>

                <form>
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
                            type="number"
                            placeholder="Ex: 999.999.999-99"
                            autoComplete="none"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="numeroTelefone">Telefone</label>
                        
                        <input 
                            id="numeroTelefone"
                            name="numeroTelefone"
                            type="number"
                            placeholder="Ex: (27) 99999-9999"
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
                            autoComplete="current-password"
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
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button className="cadastro__botao" type="submit">
                        Cadastrar
                    </button>
                </form>
              </section>
        </main>
    );
}

export default Cadastro;