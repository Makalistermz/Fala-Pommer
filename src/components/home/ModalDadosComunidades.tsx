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

    const svgGear = <svg width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
    </svg>

    const dataFormatada = new Date(comunidade.comunidade_criada_em).toLocaleDateString('pt-br');

    function IconChangeMessage() {
        return (
            <div>
                <span>Alterar a foto da comunidade</span>
                {svgImage}
            </div>
        )
    }

    return (
        <div className="modal-dados__fundo" onClick={aoFechar} data-lenis-prevent>
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
                                    title="Convidar usando link"
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
                                    title="Adicionar membro"
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
                                <button 
                                    className="dados-comunidade__descricao-editar"
                                    type="button"
                                    title="Editar descrição da comunidade"
                                >
                                    {svgPen}
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="dados-comunidade__configuracao-container">
                        <button
                            className="dados-comunidade__configuracao"
                            type="button"
                            aria-label="Abrir configurações da comunidade"
                        >
                            <div className="dados-comunidade__config-icon-text">
                                <div className="dados-comunidade__configuracao-icone">
                                    {svgGear}
                                </div>
                                <div className="dados-comunidade__configuracao-texto">
                                    <span>Configuração da comunidade</span>
                                </div>
                            </div>
                            <div className="dados-comunidade__configuracao-seta">
                                <svg width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                </svg>
                            </div>
                        </button>
                    </div>

                    <div className="dados-comunidade__membros">
                        <div className="dados-comunidade__membros-conteudo">
                            <div className="dados-comunidade__membros-cabecalho">
                                <span className="dados-comunidade__membros-total">
                                    {comunidade.totalParticipantes}{" "}
                                    {comunidade.totalParticipantes === 1 ? "membro da comunidade" : "membros da comunidade"}
                                </span>
                                <button className="dados-comunidade__membros-pesquisar">
                                    <svg width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                    </svg>
                                </button>
                            </div>

                            <button 
                                className="dados-comunidade__membros-adicionar"
                                type="button"
                            >
                                <div className="dados-comunidade__membros-adicionar-icone">
                                    <svg width="16" height="16" fill="currentColor" className="bi bi-person-add" viewBox="0 0 16 16">
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                        <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                    </svg>
                                </div>
                                <div className="dados-comunidade__membros-adicionar-texto">
                                    <span>Adicionar membro</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="dados-comunidade__sair-container">
                    <button className="dados-comunidade__sair" type="button">
                        <div className="dados-comunidade__sair-icone">
                            <svg width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                            </svg>
                        </div>
                        <div className="dados-comunidade__sair-texto">
                            <span className="dados-comunidade__sair-rotulo">
                                Sair da comunidade
                            </span>
                        </div>
                    </button>
                </div>

                <footer className="dados-comunidade__rodape">
                    <span className="dados-comunidade__criacao">
                        Essa comunidade foi criada por {comunidade.criador_nome} no dia {dataFormatada}
                    </span>
                </footer>

            </section>
        </div>
    );
}

export default ModalDadosComunidades;
