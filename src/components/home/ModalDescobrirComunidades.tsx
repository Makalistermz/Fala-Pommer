function ModalDescobrirComunidades() {
    return (
        <>
            <header>
                <div>
                    <section>
                        <div>
                            <h1>Descobrir comunidades</h1>
                        </div>
                        <div>
                            <span>
                                Encontre comunidades dos seus interesses e entre na conversa.
                            </span>
                        </div>
                    </section>
                    <button>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                d="m6 6 12 12m18 6 6 18"
                            />
                        </svg>
                    </button>
                </div>
            </header>
            <main>
                <div>
                    <div>
                        <div>
                            <div>
                                <span>
                                    <svg
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-search"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <input
                                    name="pesquisa-input"
                                    role="textbox"
                                    aria-label="Pesquisar comunidades"
                                    autoComplete="off"
                                    dir="ltr"
                                    placeholder="Pesquisar comunidades"
                                    type="search"
                                />
                            </div>
                        </div>
                    </div>
                    

                    <div>
                        <button>
                            <div>
                                <span>
                                    Todas
                                </span>
                            </div>
                        </button>
                        {/*criar mais botões com um map conforme tenha os topicos */}
                    </div>

                    <div>
                        <div>
                            <div>
                                <div>Foto</div>
                                <div>
                                    <strong>
                                        Nome comunidade
                                    </strong>
                                    <span>X membros</span>
                                </div>
                            </div>

                            <div>
                                <p>Descrição comunidade</p>
                            </div>

                            <div>
                                <div>
                                    topico da comunidade
                                </div>

                                <div>
                                    <button>
                                        Entrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer>
                <div>
                    <div>
                        <span>Mostrando X comunidades</span>
                    </div>

                    <div>
                        <div>
                            <span>Não achou a sua?</span>
                        </div>
                        <div>
                            <button>
                                <span>+</span> Criar comunidade
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default ModalDescobrirComunidades