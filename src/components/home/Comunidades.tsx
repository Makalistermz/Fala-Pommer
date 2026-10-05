import "./Comunidades.css";
import { useState } from "react";

function Comunidades() {
    const [novaComunidade, setNovaComunidade] = useState(false);
    const [criarComunidade, setCriarComunidade] = useState(false);

    if (novaComunidade) {
        return (
            <>
                <header className="nova-comunidade">
                    <button
                        type="button"
                        aria-label="Voltar para comunidades"
                        title="Voltar para comunidades"
                        onClick={() => {
                            setNovaComunidade(false);
                            setCriarComunidade(false);
                        }}
                    >
                        <svg width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16" aria-hidden="true">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>

                    <span>Nova Comunidade</span>
                </header>

                {!criarComunidade 
                    ? <main className="nova-comunidade__conteudo background-comunidades">
                        <section className="nova-comunidade__apresentacao">
                            <div className="nova-comunidade__icone">
                                <svg className="nova-comunidade__icone-svg" viewBox="0 0 24 24" aria-hidden="true">
                                    <path className="nova-comunidade__icone-path" fill="currentColor" strokeWidth="0.3" paintOrder="fill stroke" fillRule="evenodd" d="M6.37 18.67a1.81 1.81 0 0 1-.58-1.24c-.01-.5-.03-1.5.03-1.94a2.7 2.7 0 0 1 .4-1.1 2.84 2.84 0 0 1 .9-.82c.46-.28.98-.46 1.4-.58A12.2 12.2 0 0 1 12 12.5a12.69 12.69 0 0 1 3.47.49 5.76 5.76 0 0 1 1.52.65c.28.19.56.44.78.76a2.41 2.41 0 0 1 .41 1.1c.06.43.04 1.43.03 1.93a1.9 1.9 0 0 1-.58 1.24c-.22.2-.48.33-.75.33H7.12c-.27 0-.53-.13-.75-.33Zm13.6-3.27c.04.6.03.86.02 1.6v.49a4.58 4.58 0 0 1-.3 1.51h2.97c.72 0 1.31-1.85 1.33-2.58.01-.4.02-.13-.02-.46a2.34 2.34 0 0 0-.95-1.6 4.27 4.27 0 0 0-1.41-.68h-.02v-.01a7.72 7.72 0 0 0-2.35-.27 4.18 4.18 0 0 1 .72 2Zm-2.04-3.95a2.65 2.65 0 0 0 3.16.06 2.67 2.67 0 1 0-3.16-.06ZM14.9 9.62A3.54 3.54 0 0 0 15.5 7a3.56 3.56 0 1 0-.61 2.62Zm-7.88.4a2.67 2.67 0 1 0-5.16-1.38 2.67 2.67 0 0 0 5.16 1.38Zm-4.42 3.6-.18.05h-.03a4.3 4.3 0 0 0-1.41.69 2.3 2.3 0 0 0-.95 1.6c-.04.33-.03 1.06-.02 1.46.02.73.61 1.58 1.33 1.58H4.3a4.58 4.58 0 0 1-.3-1.51V17c-.01-.74-.02-1 .03-1.6 0-.05 0-.1.02-.15a4.48 4.48 0 0 1 .7-1.85 7.22 7.22 0 0 0-2.16.22Zm9.4.88c-1.21 0-2.22.2-2.92.4-.37.12-.68.23-.91.38-.23.13-.3.25-.34.34a.7.7 0 0 0-.03.14s0-.01 0 0L7.79 17h8.42v-1.24c-.01-.01 0 .01 0 0a.7.7 0 0 0-.04-.14c-.03-.09-.11-.2-.34-.34a3.84 3.84 0 0 0-.91-.37c-.7-.2-1.7-.41-2.92-.41ZM12 6a1.55 1.55 0 1 0 0 3.11c.86 0 1.56-.7 1.56-1.55C13.56 6.7 12.86 6 12 6Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <div className="nova-comunidade__titulo-container">
                                <strong className="nova-comunidade__titulo">Criar comunidade</strong>
                            </div>
                            <div className="nova-comunidade__descricao-container">
                                <p className="nova-comunidade__descricao">Conecte sua comunidade em um só lugar. Crie grupos temáticos e envie avisos para todos em instantes.</p>
                            </div>
                        </section>

                        <div className="nova-comunidade__acoes">
                            <button 
                                className="nova-comunidade__comecar" 
                                type="button"
                                onClick={() => setCriarComunidade(true)}
                                >
                                Começar
                            </button>
                        </div>
                    </main>

                    : <h1>teste</h1>
                }
            </>
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

            <main className="comunidades-conteudo background-comunidades">
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
