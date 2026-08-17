// Solicita a confirmação do usuário antes de uma ação.
import { useEffect } from "react";
import "./ModalConfirmacao.css";

type ModalConfirmacaoProps = {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    carregando?: boolean;
    aoCancelar: () => void;
    aoConfirmar: () => void;
};

export function ModalConfirmacao({
    aberto,
    titulo,
    mensagem,
    carregando = false,
    aoCancelar,
    aoConfirmar,
}: ModalConfirmacaoProps) {
    useEffect(() => {
        if (!aberto) return;

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !carregando) {
                aoCancelar();
            }
        }

        document.addEventListener("keydown", fecharComEscape);
        return () => document.removeEventListener("keydown", fecharComEscape);
    }, [aberto, carregando, aoCancelar]);

    if (!aberto) return null;

    function cancelar() {
        if (!carregando) aoCancelar();
    }

    return (
        <div className="modal-confirmacao-fundo" onClick={cancelar}>
            <div
                className="modal-confirmacao"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modal-confirmacao-titulo"
                aria-describedby="modal-confirmacao-mensagem"
                onClick={(evento) => evento.stopPropagation()}
            >
                <div className="modal-confirmacao__icone" aria-hidden="true">!</div>

                <h2 id="modal-confirmacao-titulo">{titulo}</h2>
                <p id="modal-confirmacao-mensagem">{mensagem}</p>

                <div className="modal-confirmacao__acoes">
                    <button
                        className="modal-confirmacao__cancelar"
                        type="button"
                        onClick={cancelar}
                        disabled={carregando}
                        autoFocus
                    >
                        Cancelar
                    </button>
                    <button
                        className="modal-confirmacao__confirmar"
                        type="button"
                        onClick={aoConfirmar}
                        disabled={carregando}
                    >
                        {carregando ? "Apagando..." : "Apagar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
