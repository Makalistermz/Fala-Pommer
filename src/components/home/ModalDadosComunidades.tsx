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

    const pen = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
    </svg>

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
                            <button
                                className="dados-comunidade_alter-nome"
                                type="button"
                            >
                                {pen}
                            </button>
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
