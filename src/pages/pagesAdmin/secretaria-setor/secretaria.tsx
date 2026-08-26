import { useState } from "react";
import { ModalFeedback } from "../../../components/ModalFeedback";

function Secretaria() {
    const [feedback, setFeedback] = useState({
        aberto: false,
        tipo: "erro" as "erro" | "sucesso",
        mensagem: ""
    });

    const estiloObrigatorio: React.CSSProperties = {
        color: 'red',
    }
    const obrigatorio = <span style={estiloObrigatorio}>*</span>;

    return (
        <section className="secretaria">
            <header className="secretaria__header">
                <div>
                    <span>CONTROLE DE SECRETARIA</span>
                    <h2 id="titulo-secretaria">Criação e controle das secretarias</h2>
                    <p>Crie e acompanhe as secretarias do sistema</p>
                </div>
            </header>

            <div className="formulario-secretaria">
                <form method="POST" className="secretaria-form">
                    <div className="container-campo-secretaria">
                        <div className="campo-form-secretaria">
                            <label htmlFor="secretaria" >Secretaria{obrigatorio}</label>
                            <input
                            name="secretaria"
                            id="secretaria"
                            type="text"
                            autoComplete="off"
                            required
                            />
                        </div>
                        <div className="campo-form-secretaria">
                            <label htmlFor="sigla_secretaria">Sigla da secretaria{obrigatorio}</label>
                            <input
                            name="sigla_secretaria"
                            id="sigla_secretaria"
                            type="text"
                            autoComplete="off"
                            required
                            />
                        </div>
                    </div>

                    <button className="botao-enviar-secretaria" type="submit">Enviar</button>
                </form>
            </div>

            <div className="setores__tabela-container">
                <table className="setores__tabela">
                    <thead>
                        <tr>
                            <th scope="col">Sigla</th>
                            <th scope="col">Secretaria</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                    </tbody>
                </table>
            </div>

            <ModalFeedback
                aberto={feedback.aberto}
                tipo={feedback.tipo}
                mensagem={feedback.mensagem}
                aoFechar={() => {
                    setFeedback((estadoAtual) => ({
                        ...estadoAtual,
                        aberto: false
                    }));
                }}
            />
        </section>
    )
}

export default Secretaria;