import type { ReactNode, RefObject } from "react";
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
    if (!aberto || !comunidade) {
        return null;
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
                                <div className="dados-comunidade__avatar-comunidade">
                                    {renderizarAvatar(comunidade.nome_comunidade, comunidade.imagem_comunidade, true)}
                                </div>
                            </div>

                            <div className="dados-comunidade__identificacao">
                                <strong className="dados-comunidade__nome">{comunidade.nome_comunidade}</strong>
                            </div>

                            <div className="dados-comunidade__resumo">
                                <p className="dados-comunidade__participantes">
                                    Comunidade <span className="dados-comunidade__separador">·</span>{" "}
                                    {comunidade.totalParticipantes}{" "}
                                    {comunidade.totalParticipantes === 1 ? "membro" : "membros"}
                                </p>
                            </div>
                    </section>
                </div>
            </section>
        </div>
    );
}

export default ModalDadosComunidades;
