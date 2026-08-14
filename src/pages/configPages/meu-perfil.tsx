const preferencias = [
    {
        id: "notificacoes",
        label: "Notificações de mensagens",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v6.5A2.75 2.75 0 0 1 16.25 15H9l-4 3v-12.25Z" />
            </svg>
        ),
    },
    {
        id: "sons",
        label: "Sons da conversa",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />
            </svg>
        ),
    },
    {
        id: "leitura",
        label: "Confirmação de leitura",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3.5 12.5 4 4L14 8" />
                <path d="m10 14.5 2 2L20.5 8" />
            </svg>
        ),
    },
];

function MeuPerfil() {
    return (
        <main className="meu-perfil">
            <div className="meu-perfil__grade">
                <section className="meu-perfil__cartao meu-perfil__cartao--dados">
                    <header className="meu-perfil__resumo">
                        <div className="meu-perfil__avatar" aria-hidden="true">
                            MZ
                        </div>

                        <div className="meu-perfil__identidade">
                            <strong className="meu-perfil__nome">
                                Makalister Zager
                            </strong>

                            <span className="meu-perfil__perfil">
                                Funcionário
                            </span>

                            <button
                                className="meu-perfil__alterar-foto"
                                type="button"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 7.5h3l1.4-2h7.2l1.4 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" />
                                    <circle cx="12" cy="13.5" r="3.5" />
                                </svg>
                                <span>Alterar foto</span>
                            </button>
                        </div>
                    </header>

                    <div className="meu-perfil__divisor" />

                    <div className="meu-perfil__formulario">
                        <div className="meu-perfil__campo">
                            <label htmlFor="nome_completo">Nome completo</label>
                            <input
                                id="nome_completo"
                                type="text"
                                defaultValue="Makalister Zager"
                            />
                        </div>

                        <div className="meu-perfil__campo">
                            <label htmlFor="e-mail">E-mail</label>
                            <input
                                id="e-mail"
                                type="email"
                                defaultValue="makalister@pmsmj.es.gov.br"
                            />
                        </div>

                        <div className="meu-perfil__campo">
                            <label htmlFor="telefone">Telefone</label>
                            <input
                                id="telefone"
                                type="tel"
                                defaultValue="(27) 99999-9999"
                            />
                        </div>

                        <div className="meu-perfil__campo">
                            <label htmlFor="setor">Setor</label>
                            <input
                                id="setor"
                                type="text"
                                defaultValue="Secretaria de Administração"
                            />
                        </div>

                        <div className="meu-perfil__acoes">
                            <button
                                className="meu-perfil__salvar"
                                type="button"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 3h12l3 3v15H4V4a1 1 0 0 1 1-1Z" />
                                    <path d="M8 3v6h8V3M8 21v-7h8v7" />
                                </svg>
                                <span>Salvar alterações</span>
                            </button>

                            <button
                                className="meu-perfil__cancelar"
                                type="button"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </section>

                <aside className="meu-perfil__lateral">
                    <section className="meu-perfil__cartao meu-perfil__preferencias">
                        <h2>Preferências rápidas</h2>

                        <div className="meu-perfil__preferencias-lista">
                            {preferencias.map((preferencia) => (
                                <div
                                    className="meu-perfil__preferencia"
                                    key={preferencia.id}
                                >
                                    <span className="meu-perfil__preferencia-icone">
                                        {preferencia.icon}
                                    </span>

                                    <span className="meu-perfil__preferencia-texto">
                                        {preferencia.label}
                                    </span>

                                    <span
                                        className="meu-perfil__switch meu-perfil__switch--ativo"
                                        role="switch"
                                        aria-checked="true"
                                        aria-label={preferencia.label}
                                    >
                                        <span />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="meu-perfil__cartao meu-perfil__seguranca">
                        <h2>Segurança da conta</h2>

                        <div className="meu-perfil__seguranca-conteudo">
                            <div
                                className="meu-perfil__seguranca-icone"
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 3 5.5 6v5.5c0 4.2 2.7 7.9 6.5 9.5 3.8-1.6 6.5-5.3 6.5-9.5V6L12 3Z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </div>

                            <div className="meu-perfil__seguranca-info">
                                <p>Sua conta está protegida</p>

                                <a
                                    href="/recuperar-senha"
                                    className="meu-perfil__alterar-senha"
                                    type="button"
                                    target="_blank"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <circle cx="8" cy="15" r="3" />
                                        <path d="m10.2 12.8 6.3-6.3a2.1 2.1 0 1 1 3 3l-1 1-1.5-1.5-1.5 1.5 1.5 1.5-1.5 1.5-1.5-1.5-3.8 3.8" />
                                    </svg>
                                    <span>Alterar senha</span>
                                </a>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}

export default MeuPerfil;
