import brasao from "../assets/img/brasao.png";
import "./css/home.css";

function Home() {
    return (
        <main className="home">
            <aside className="conversas">
                <header className="conversas-header">
                    <div className="header-name">
                        <img 
                            className="header-logo"
                            src={brasao} alt="Brasão da prefeitura" 
                            width={40}
                        />
                        <span className="header-title">Fala Pommer</span>
                    </div>

                    <div className="header-menu">
                        <button className="header-menu-button">
                            <span className="header-menu-icon">
                                <svg className="header-menu-svg" viewBox="0 0 24 24" height="28" width="28" preserveAspectRatio="xMidYMid meet">
                                    <circle className="menu-dot menu-dot-top" cx="12" cy="6" r="2" />
                                    <circle className="menu-dot menu-dot-middle" cx="12" cy="12" r="2" />
                                    <circle className="menu-dot menu-dot-bottom" cx="12" cy="18" r="2" />
                                </svg>
                            </span>
                        </button>
                    </div>

                </header>

                <div className="pesquisa">
                    <div className="pesquisa-container">
                        <div className="pesquisa-icone-container">
                            <span className="pesquisa-icone">
                                <svg width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                    <path className="pesquisa-icone-path" d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                </svg>
                            </span>
                        </div>

                        <div className="pesquisa-input-container">
                            <input className="pesquisa-input" role="textbox" aria-label="Pesquisar ou começar uma nova conversa" autoComplete="off" dir="ltr" placeholder="Pesquisar ou começar uma nova conversa" type="text"/>
                        </div>
                    </div>

                </div>

                <div className="filtros">
                {/* Todas | Não lidas | Grupos */}
                </div>

                <section className="lista-conversas">
                {/* Conversas */}
                </section>
            </aside>

            <section className="chat">
                <header className="chat-header">
                {/* Usuário da conversa */}
                </header>

                <div className="mensagens">
                {/* Mensagens */}
                </div>

                <footer className="chat-input">
                {/* Campo para enviar mensagem */}
                </footer>
            </section>
        </main>
    )
}

export default Home;
