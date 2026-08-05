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
                {/* Buscar conversa */}
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
