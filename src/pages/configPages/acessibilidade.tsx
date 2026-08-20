import { useNavegacaoAudio } from "../../components/NavegacaoAudioContext";

function Acessibilidade() {
    const { navegacaoAudioAtiva, setNavegacaoAudioAtiva } = useNavegacaoAudio();

    function alternarNavegacaoAudio() {
        const proximoEstado = !navegacaoAudioAtiva;
        setNavegacaoAudioAtiva(proximoEstado);

        if (proximoEstado && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const fala = new SpeechSynthesisUtterance("Navegação por áudio ativada");
            fala.lang = "pt-BR";
            window.speechSynthesis.speak(fala);
        }
    }

    return (
        <>
            <main className="acessibilidade">
                <section className="acessibilidade__item acessibilidade__item--autenticacao">
                    <div className="acessibilidade__acao">
                        <div className="acessibilidade__icone">
                            <svg width="22" height="22" fill="currentColor" className="bi bi-shadows" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8 7a.5.5 0 0 1 0-1h3.5q.048 0 .093.009A7 7 0 0 0 12.9 13H8a.5.5 0 0 1 0-1h5.745q.331-.474.581-1H8a.5.5 0 0 1 0-1h6.71a7 7 0 0 0 .22-1H8a.5.5 0 0 1 0-1h7q0-.51-.07-1H8a.5.5 0 0 1 0-1h6.71a7 7 0 0 0-.384-1H8a.5.5 0 0 1 0-1h5.745a7 7 0 0 0-.846-1H8a.5.5 0 0 1 0-1h3.608A7 7 0 1 0 8 15"/>
                            </svg>
                        </div>

                        <div className="acessibilidade__conteudo">
                            <strong className="acessibilidade__titulo">Alto contraste</strong>
                            <span className="acessibilidade__descricao">Ajusta o contraste para proporcionar maior legibilidade e conforto visual.</span>
                        </div>

                        <span className="acessibilidade__indicador">
                            <span 
                            className="acessibilidade__alternador" 
                            aria-hidden="true"
                            onClick={(e) => {
                                            e.currentTarget.classList.toggle('acessibilidade__alternador--ativo');
                                        }
                                    }
                            />
                        </span>
                    </div>
                </section>

                <section className="acessibilidade__item acessibilidade__item--autenticacao">
                    <div className="acessibilidade__acao">
                        <div className="acessibilidade__icone">
                            <svg width="22" height="22" fill="currentColor" className="bi bi-type" viewBox="0 0 16 16">
                                <path d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081zm2.7-7.923L6.34 9.314H3.51l1.4-4.156zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525"/>
                            </svg>
                        </div>

                        <div className="acessibilidade__conteudo">
                            <strong className="acessibilidade__titulo">Texto ampliado</strong>
                            <span className="acessibilidade__descricao">Redimensiona os textos do aplicativo para melhorar a visualização.</span>
                        </div>

                        <span className="acessibilidade__indicador">
                            <span 
                            className="acessibilidade__alternador" 
                            aria-hidden="true"
                            onClick={(e) => {
                                            e.currentTarget.classList.toggle('acessibilidade__alternador--ativo');
                                        }
                                    }
                            />
                        </span>
                    </div>
                </section>

                <section className="acessibilidade__item acessibilidade__item--autenticacao">
                    <div className="acessibilidade__acao">
                        <div className="acessibilidade__icone">
                            <svg width="22" height="22" fill="currentColor" className="bi bi-soundwave" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5m12 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5"/>
                            </svg>
                        </div>

                        <div className="acessibilidade__conteudo">
                            <strong className="acessibilidade__titulo">Navegação por áudio</strong>
                            <span className="acessibilidade__descricao">Oferece retornos sonoros para facilitar o uso do aplicativo sem depender apenas da visão.</span>
                        </div>

                        <span className="acessibilidade__indicador">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={navegacaoAudioAtiva}
                                aria-label="Navegação por áudio"
                                className={`acessibilidade__alternador ${
                                    navegacaoAudioAtiva ? "acessibilidade__alternador--ativo" : ""
                                }`}
                                onClick={alternarNavegacaoAudio}
                            />
                        </span>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Acessibilidade;
