import { useState, type ReactNode, type RefObject } from "react";
import type { Comunidade } from "./Comunidades";

interface ModalDadosComunidadeProps {
    aberto: boolean;
    comunidade: Comunidade | null;
    aoFechar: () => void;
    botaoFecharRef: RefObject<HTMLButtonElement | null>;
    renderizarAvatar: (
        nome: string,
        imagem: string | null,
        comunidade?: boolean,
    ) => ReactNode;
}

function ModalDadosComunidades({
    aberto,
    comunidade,
    aoFechar,
    botaoFecharRef,
    renderizarAvatar,
}: ModalDadosComunidadeProps) {
    {/*retorna um elemento html*/}
    const [iconChangeMessage, setIconChangeMessage] = useState<React.JSX.Element | null>(null);

    if (!aberto || !comunidade) {
        return null;
    }

    const svgPen = <svg width="16" height="16" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
    </svg>

    const svgImage = <svg width="16" height="16" fill="currentColor" className="bi bi-card-image" viewBox="0 0 16 16">
        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
        <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
    </svg>

    function IconChangeMessage() {
        return (
            <div>
                <span>Alterar a foto da comunidade</span>
                {svgImage}
            </div>
        )
    }

    return (
        <div className="modal-dados__fundo" onClick={aoFechar}>
            <section
                className="modal-dados modal-dados-comunidade"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-dados-comunidade-titulo"
                onClick={(evento) => evento.stopPropagation()}
            >
                <header className="modal-dados__cabecalho">
                    <h2 id="modal-dados-comunidade-titulo">Dados da comunidade</h2>
                    <button
                        ref={botaoFecharRef}
                        type="button"
                        aria-label="Fechar"
                        onClick={aoFechar}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m6 6 12 12M18 6 6 18" />
                        </svg>
                    </button>
                </header>

                <div className="modal-dados__conteudo">
                    <section className="dados-comunidade__informacoes">
                        <div className="dados-comunidade__avatar">
                            <div 
                                className="dados-comunidade__avatar-comunidade"
                                title="Alterar imagem"
                                onMouseEnter={() => setIconChangeMessage(IconChangeMessage())}
                                onMouseLeave={() => setIconChangeMessage(null)}
                            >
                                {renderizarAvatar(comunidade.nome_comunidade, comunidade.imagem_comunidade, true)}
                                
                                {iconChangeMessage && (
                                    <div className="dados-comunidade_avatar-messagem">
                                        {iconChangeMessage}
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="dados-comunidade__identificacao">
                            <strong className="dados-comunidade__nome">{comunidade.nome_comunidade}</strong>
                            <button
                                className="dados-comunidade_alter-nome"
                                type="button"
                                title="Editar nome da comunidade"
                            >
                                {svgPen}
                            </button>
                        </div>

                        <div className="dados-comunidade__resumo">
                            <p className="dados-comunidade__participantes">
                                Comunidade <span className="dados-comunidade__separador">·</span>{" "}
                                {comunidade.totalParticipantes}{" "}
                                {comunidade.totalParticipantes === 1 ? "membro" : "membros"}
                            </p>
                        </div>

                        <div className="dados-comunidade__acoes">
                            <div className="dados-comunidade__acao">
                                <button 
                                    className="dados-comunidade__acao-botao"
                                    id="convidar"
                                    type="button"
                                >
                                    <svg width="16" height="16" fill="currentColor" className="dados-comunidade__acao-icone bi bi-link" viewBox="0 0 16 16">
                                        <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
                                        <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
                                    </svg>
                                </button>
                                <label 
                                    htmlFor="convidar"
                                    className="dados-comunidade__acao-texto"
                                >
                                    Convidar
                                </label>
                            </div>

                            <div className="dados-comunidade__acao">
                                <button 
                                    className="dados-comunidade__acao-botao"
                                    id="adicionar_membro"
                                    type="button"
                                >
                                    <svg width="16" height="16" fill="currentColor" className="dados-comunidade__acao-icone bi bi-person-add" viewBox="0 0 16 16">
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                        <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                    </svg>
                                </button>
                                <label 
                                    htmlFor="adicionar_membro" 
                                    className="dados-comunidade__acao-texto"
                                >
                                    Adicionar membro
                                </label>
                            </div>
                        </div>

                    </section>

                    <section className="dados-comunidade__descricao">
                        <div className="dados-comunidade__descricao-conteudo">
                            <div className="dados-comunidade__descricao-cabecalho">
                                <strong className="dados-comunidade__descricao-titulo">Comunidade</strong>
                            </div>

                            <div className="dados-comunidade__descricao-texto">
                                <span className="dados-comunidade__descricao-mensagem">{comunidade.descricao_comunidade}</span>
                                <button className="dados-comunidade__descricao-editar">
                                    {svgPen}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}

export default ModalDadosComunidades;
