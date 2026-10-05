import "./Comunidades.css";
import { useState } from "react";

function Comunidades() {
    const [novaComunidade, setNovaComunidade] = useState(false);

    if (novaComunidade) {
        return (
            <header className="nova-comunidade">
                <button type="button" onClick={() => setNovaComunidade(false)}>
                    <svg width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                    </svg>
                </button>

                <span>Nova Comunidade</span>
            </header>
        );
    }

    return (
        <>
            <header className="comunidades-header">
                <div className="comunidades-header__conteudo">
                    <strong className="comunidades-header__titulo">
                        Comunidades
                    </strong>
                    
                    <button
                        type="button"
                        className="comunidades-header__adicionar"
                        aria-label="Criar nova comunidade"
                        title="Criar nova comunidade"
                        onClick={() => setNovaComunidade(true)}
                    >
                        <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="bi bi-plus-circle"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                        </svg>
                    </button>
                </div>
            </header>

            <main className="comunidades-conteudo">
                <section className="comunidades-acoes">
                    <button
                        type="button"
                        className="comunidades-acoes__nova"
                        aria-label="Criar nova comunidade"
                        onClick={() => setNovaComunidade(true)}
                    >
                        <div
                            className="comunidades-acoes__icone"
                            aria-hidden="true"
                        >
                            <svg
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="comunidades-acoes__icone-svg bi bi-people-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                            </svg>
                        </div>
                        <span className="comunidades-acoes__texto">
                            Nova comunidade
                        </span>
                    </button>
                </section>
            </main>

        </>
    );
}

export default Comunidades;
