function RestaurarSessao({
    return (
        <section
            ref={raiz}
            className={`rs-root${reduzir ? ' rs-rm' : ''}`}
            aria-label="Restaurando sessão"
            aria-busy={!concluida}
        >
            <div className="rs-strips rs-y" aria-hidden="true">
                {Array.from({ length: NTIRAS }, (_, i) => (
                    <i key={i} />
                ))}
            </div>

            <div className="rs-strips rs-b" aria-hidden="true">
                {Array.from({ length: NTIRAS }, (_, i) => (
                    <i key={i} />
                ))}
            </div>

            <div className="rs-content" ref={conteudo}>
                <div className="rs-hud rs-pad">
                    <span className="rs-brand">
                        <span className="rs-brand-mark" aria-hidden="true">
                            <img src={brasao} alt="" />
                        </span>
                        Fala Pommer
                    </span>

                    <span className="rs-hud-right">
                        <span className="rs-status">
                            <span className={`rs-typing${concluida ? ' rs-done' : ''}`} aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </span>
                            <span>{concluida ? 'Pronto' : 'Restaurando'}</span>
                        </span>

                        <span className="rs-timer">
                            <span>tempo</span>
                            <b ref={tempo} />
                        </span>
                    </span>
                </div>

                <div className="rs-head rs-pad">
                    <Titulo
                        linhas={concluida ? ['Sessão', 'restaurada!'] : ['Restaurando', 'sua sessão']}
                        parado={concluida}
                    />
                </div>

                <div className="rs-band" aria-hidden="true">
                    <div className="rs-band-track">
                        <span>
                            Acordando o servidor com um cafézinho • Procurando suas conversas • Chamando o pessoal do grupo • Tirando o digitando… do vácuo • Conferindo quem está online • Sacudindo as mensagens não lidas • Avisando que você voltou •
                        </span>
                        <span>
                            Acordando o servidor com um cafézinho • Procurando suas conversas • Chamando o pessoal do grupo • Tirando o digitando… do vácuo • Conferindo quem está online • Sacudindo as mensagens não lidas • Avisando que você voltou •
                        </span>
                    </div>
                </div>

                <div className="rs-foot rs-pad">
                    <div className="rs-tray-wrap">
                        <p className="rs-tray-label">
                            recolocando tudo no lugar · <span ref={contagem} />
                        </p>

                        <div className="rs-tray">
                            {ITENS.map((t, i) => (
                                <span
                                key={t}
                                className="rs-chip"
                                style={{ background: obterTemaAparencia() === 'escuro' ? CORESDARKMODE[i % CORESDARKMODE.length] : CORES[i % CORES.length] }}
                                >
                                    <span className="rs-ck" aria-hidden="true">
                                        <svg viewBox="0 0 18 14">
                                        <path className="rs-t1" d="M1.5 7.5 L5 11 L11.5 3.5" />
                                        <path className="rs-t2" d="M6 7.5 L9.5 11 L16 3.5" />
                                        </svg>
                                    </span>
                                    <span>{t}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        ref={barra}
                        className="rs-counter"
                        role="progressbar"
                        aria-label="Progresso da restauração"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={0}
                    >
                        <span className="rs-num" ref={numero} />
                        <span className="rs-pc" aria-hidden="true">
                        %
                        </span>
                    </div>
                </div>
            </div>

            <p className="rs-sr" role="status">
                {concluida ? 'Sessão restaurada.' : 'Restaurando sua sessão.'}
            </p>
        </section>
    );
}

export default RestaurarSessao;