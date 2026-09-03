// Coleta a avaliação do usuário antes de finalizar uma conversa.
import { useEffect, useState, type FormEvent } from "react";
import "./ModalFinalizarConversa.css";

type DadosFinalizacao = {
    avaliacao: number;
    descricao: string;
};

type ModalFinalizarConversaProps = {
    aberto: boolean;
    aoCancelar: () => void;
    aoEnviar: (dados: DadosFinalizacao) => void;
};

export function ModalFinalizarConversa({
    aberto,
    aoCancelar,
    aoEnviar,
}: ModalFinalizarConversaProps) {
    const [avaliacao, setAvaliacao] = useState(0);
    const [descricao, setDescricao] = useState("");

    useEffect(() => {
        if (!aberto) {
            return;
        }

        setAvaliacao(0);
        setDescricao("");

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                aoCancelar();
            }
        }

        window.addEventListener("keydown", fecharComEscape);

        return () => {
            window.removeEventListener("keydown", fecharComEscape);
        };
    }, [aberto, aoCancelar]);

    if (!aberto) {
        return null;
    }

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        aoEnviar({
            avaliacao,
            descricao: descricao.trim(),
        });
    }

    return (
        <div
            className="modal-finalizar-fundo"
            role="presentation"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) {
                    aoCancelar();
                }
            }}
        >
            <form
                className="modal-finalizar"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-finalizar-titulo"
                onSubmit={enviar}
            >
                <header className="modal-finalizar__cabecalho">
                    <div>
                        <span>AVALIAÇÃO DO ATENDIMENTO</span>
                        <h2 id="modal-finalizar-titulo">Finalizar conversa</h2>
                    </div>

                    <button
                        type="button"
                        className="modal-finalizar__fechar"
                        aria-label="Fechar modal"
                        onClick={aoCancelar}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m6 6 12 12M18 6 6 18" />
                        </svg>
                    </button>
                </header>

                <div className="modal-finalizar__conteudo">
                    <div className="modal-finalizar__introducao">
                        <p>Sua opinião é muito importante! Qual nota você dá para o nosso atendimento?</p>
                    </div>

                    <fieldset className="modal-finalizar__avaliacao">
                        <legend>Como você avalia este atendimento?</legend>

                        <div
                            className="modal-finalizar__estrelas"
                            role="radiogroup"
                            aria-label="Avaliação de uma a cinco estrelas"
                        >
                            {[1, 2, 3, 4, 5].map((estrela) => (
                                <button
                                    key={estrela}
                                    type="button"
                                    role="radio"
                                    aria-checked={avaliacao === estrela}
                                    aria-label={estrela === 1
                                        ? "1 estrela"
                                        : `${estrela} estrelas`}
                                    className={estrela <= avaliacao
                                        ? "modal-finalizar__estrela modal-finalizar__estrela--ativa"
                                        : "modal-finalizar__estrela"}
                                    onClick={() => setAvaliacao(estrela)}
                                    onMouseEnter={() => setAvaliacao(estrela)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <label className="modal-finalizar__descricao">
                        <span>Descrição</span>
                        <textarea
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            placeholder="Conte como foi o atendimento..."
                            rows={5}
                        />
                    </label>
                </div>

                <footer className="modal-finalizar__acoes">
                    <button
                        type="button"
                        className="modal-finalizar__cancelar"
                        onClick={aoCancelar}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="modal-finalizar__enviar"
                    >
                        Enviar
                    </button>
                </footer>
            </form>
        </div>
    );
}
