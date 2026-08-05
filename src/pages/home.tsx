import brasao from "../assets/img/brasao.png";
import "./css/home.css";
import { useState } from "react";

function Home() {
    const [filtroAtivo, setFiltroAtivo] = useState("todos");

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
                                <svg width="22" height="22" className="header-menu-svg" viewBox="0 0 16 16">
                                    <path className="conversa-icone-path" d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                                    <path className="conversa-icone-path" d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                </svg>
                            </span>
                        </button>

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
                            <input className="pesquisa-input" name="pesquisa-input" role="textbox" aria-label="Pesquisar ou começar uma nova conversa" autoComplete="off" dir="ltr" placeholder="Pesquisar ou começar uma nova conversa" type="text"/>
                        </div>
                    </div>

                </div>

                <div className="filtros">
                    <div className="filtros-lista">
                        <div className={`filtro-item filtro-todos ${
                            filtroAtivo === "todos" ? "ativo" : ""
                        }`}
                        onClick={() => setFiltroAtivo("todos")}
                        >
                            <div className="filtro-conteudo">
                                <span className="filtro-texto">
                                    Todos
                                </span>
                            </div>
                        </div>

                        <div className={`filtro-item filtro-nao-lidas ${
                            filtroAtivo === "nao-lidas" ? "ativo" : ""
                        }`}
                        onClick={() => setFiltroAtivo("nao-lidas")}
                        >
                            <div className="filtro-conteudo">
                                <span className="filtro-texto">
                                    Não lidas
                                </span>
                            </div>
                        </div>

                        <div className={`filtro-item filtro-grupos ${
                            filtroAtivo === "grupos" ? "ativo" : ""
                        }`}
                        onClick={() => setFiltroAtivo("grupos")}
                        >
                            <div className="filtro-conteudo">
                                <span className="filtro-texto">
                                    Grupos
                                </span>
                            </div>
                        </div>

                    </div>
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
