import { useState } from "react";
import { useNavegacaoAudio } from "../../components/NavegacaoAudioContext";
import { NotificacaoConfiguracao } from "../../components/NotificacaoConfiguracao";
import {
    aplicarAltoContraste,
    obterPreferenciaAltoContraste,
} from "../../library/altoContraste";
import {
    aplicarTextoAmpliado,
    obterPreferenciaTextoAmpliado,
} from "../../library/textoAmpliado";

function Acessibilidade() {
    const { navegacaoAudioAtiva, setNavegacaoAudioAtiva } = useNavegacaoAudio();
    const [mostrarOpcaoDalto, setMostrarOpcaoDalto] = useState(false);
    const [altoContrasteAtivo, setAltoContrasteAtivo] = useState(
        obterPreferenciaAltoContraste
    );
    const [textoAmpliadoAtivo, setTextoAmpliadoAtivo] = useState(
        obterPreferenciaTextoAmpliado
    );
    const [notificacao, setNotificacao] = useState<{
        id: number;
        estado: "ativado" | "desativado";
    } | null>(null);

    function mostrarNotificacao(ativado: boolean) {
        setNotificacao((notificacaoAtual) => ({
            id: (notificacaoAtual?.id ?? 0) + 1,
            estado: ativado ? "ativado" : "desativado",
        }));
    }

    function alternarAltoContraste() {
        const proximoEstado = !altoContrasteAtivo;
        setAltoContrasteAtivo(proximoEstado);
        aplicarAltoContraste(proximoEstado);

        mostrarNotificacao(proximoEstado);
    }

    function alternarTextoAmpliado() {
        const proximoEstado = !textoAmpliadoAtivo;
        setTextoAmpliadoAtivo(proximoEstado);
        aplicarTextoAmpliado(proximoEstado);

        mostrarNotificacao(proximoEstado);
    }

    function alternarNavegacaoAudio() {
        const proximoEstado = !navegacaoAudioAtiva;
        setNavegacaoAudioAtiva(proximoEstado);

        mostrarNotificacao(proximoEstado);

        if (proximoEstado && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const fala = new SpeechSynthesisUtterance("Navegação por áudio ativada");
            fala.lang = "pt-BR";
            window.speechSynthesis.speak(fala);
        }
    }

    function renderizarOpcaoDalto() {
        setMostrarOpcaoDalto(anterior => !anterior);
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
                            <strong id="alto-contraste-titulo" className="acessibilidade__titulo">Alto contraste</strong>
                            <span id="alto-contraste-descricao" className="acessibilidade__descricao">Ajusta o contraste para proporcionar maior legibilidade e conforto visual.</span>
                        </div>

                        <span className="acessibilidade__indicador">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={altoContrasteAtivo}
                                aria-labelledby="alto-contraste-titulo"
                                aria-describedby="alto-contraste-descricao"
                                data-audio-text="Alto contraste"
                                className={`acessibilidade__alternador ${
                                    altoContrasteAtivo ? "acessibilidade__alternador--ativo" : ""
                                }`}
                                onClick={alternarAltoContraste}
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
                            <strong id="texto-ampliado-titulo" className="acessibilidade__titulo">Texto ampliado</strong>
                            <span id="texto-ampliado-descricao" className="acessibilidade__descricao">Redimensiona os textos do aplicativo para melhorar a visualização.</span>
                        </div>

                        <span className="acessibilidade__indicador">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={textoAmpliadoAtivo}
                                aria-labelledby="texto-ampliado-titulo"
                                aria-describedby="texto-ampliado-descricao"
                                data-audio-text="Texto ampliado"
                                className={`acessibilidade__alternador ${
                                    textoAmpliadoAtivo ? "acessibilidade__alternador--ativo" : ""
                                }`}
                                onClick={alternarTextoAmpliado}
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

                <section
                    className="acessibilidade__item acessibilidade__item--daltonismo"
                    aria-labelledby="daltonismo-titulo"
                    aria-describedby="daltonismo-descricao"
                >
                    <div 
                        className="acessibilidade__acao acessibilidade__acao--detalhes"
                        onClick={renderizarOpcaoDalto}
                    >
                        <div className="acessibilidade__conteudo">
                            <strong id="daltonismo-titulo" className="acessibilidade__titulo">
                                Modo para daltonismo
                            </strong>
                            <span id="daltonismo-descricao" className="acessibilidade__descricao">
                                Ajusta as cores da interface para otimizar o contraste e a identificação visual para diferentes tipos de daltonismo.
                            </span>
                        </div>

                        <span className="acessibilidade__indicador acessibilidade__seta" aria-hidden="true">
                            {mostrarOpcaoDalto 
                                ? <svg width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                </svg>

                                : <svg width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                            </svg> 
                            }
                        </span>
                    </div>

                    {mostrarOpcaoDalto && (
                        <div className="opcoes-acessibilidade">
                            <div className="opcoes-acessibilidade__opcao">
                                <input className="opcoes-acessibilidade__controle" type="radio" name="protanopia" id="protanopia" />
                                <label className="opcoes-acessibilidade__rotulo" htmlFor="protanopia">
                                    <strong className="opcoes-acessibilidade__titulo">Protanopia</strong>
                                    <span className="opcoes-acessibilidade__descricao">Reduz a percepção do vermelho, alterando a forma como tons vermelhos e verdes são vistos.</span>
                                </label>
                            </div>
                            <div className="opcoes-acessibilidade__opcao">
                                <input className="opcoes-acessibilidade__controle" type="radio" name="deuteranopia" id="deuteranopia" />
                                <label className="opcoes-acessibilidade__rotulo" htmlFor="deuteranopia">
                                    <strong className="opcoes-acessibilidade__titulo">Deuteranopia</strong>
                                    <span className="opcoes-acessibilidade__descricao">Reduz a percepção do verde, dificultando a diferenciação entre verde, vermelho e amarelo.</span>
                                </label>
                            </div>
                            <div className="opcoes-acessibilidade__opcao">
                                <input className="opcoes-acessibilidade__controle" type="radio" name="tritanopia" id="tritanopia" />
                                <label className="opcoes-acessibilidade__rotulo" htmlFor="tritanopia">
                                    <strong className="opcoes-acessibilidade__titulo">Tritanopia</strong>
                                    <span className="opcoes-acessibilidade__descricao">Reduz a percepção do azul, alterando a distinção entre cores como azul, verde, amarelo e rosa.</span>
                                </label>
                            </div>
                            <div className="opcoes-acessibilidade__opcao">
                                <input className="opcoes-acessibilidade__controle" type="radio" name="acromatopsia" id="acromatopsia" />
                                <label className="opcoes-acessibilidade__rotulo" htmlFor="acromatopsia">
                                    <strong className="opcoes-acessibilidade__titulo">Acromatopsia</strong>
                                    <span className="opcoes-acessibilidade__descricao">Ausência total da visão de cores; a interface é percebida em escala de cinza.</span>
                                </label>
                            </div>
                        </div>
                    )}

                </section>
            </main>

            {notificacao && (
                <NotificacaoConfiguracao
                    key={notificacao.id}
                    estado={notificacao.estado}
                    aoFechar={() => setNotificacao(null)}
                />
            )}
        </>
    )
}

export default Acessibilidade;
