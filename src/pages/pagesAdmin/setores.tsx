import { useState } from "react";
import { ModalFeedback } from "../../components/ModalFeedback";

function Setores() {
    const [feedback, setFeedback] = useState({
            aberto: false,
            tipo: "erro" as "erro" | "sucesso",
            mensagem: ""
        });

    async function criar(
    event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault(); //Evita que a página recarregue ao clicar no botão de envio

        const dadosFormulario = new FormData(event.currentTarget);

        const dados = Object.fromEntries(dadosFormulario.entries());

        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/setores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados),
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                setFeedback({
                    aberto: true,
                    tipo: "erro",
                    mensagem: Array.isArray(resultado.message)
                        ? resultado.message.join(", ")
                        : resultado.message
                });

                return;
            }

            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: "O setor foi cadastrado com sucesso"
            });
        } catch(erro) {
            console.error("Falha ao enviar o formulario:", erro);

            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: "Não foi possível conectar com o servidor."
            });
        }

    }

    const estiloObrigatorio: React.CSSProperties = {
        color: 'red',
    }
    const obrigatorio = <span style={estiloObrigatorio}>*</span>;

    return (
        <section className="setores">
            <header className="setores__header">
                <div>
                    <span>CONTROLE DE SETORES</span>
                    <h2 id="titulo-setores">Criação e controle dos setores</h2>
                    <p>Crie e acompanhe os setores do sistema</p>
                </div>
            </header>

            <div className="formulario-setor">
                <form method="POST" className="setor-form" onSubmit={criar}>
                    <div className="container-campo-setor">
                        <div className="campo-form-setor">
                            <label htmlFor="setor" >Setor{obrigatorio}</label>
                            <input
                            name="setor"
                            id="setor"
                            placeholder="Adicione o setor"
                            type="text"
                            required
                            />
                        </div>
                        <div className="campo-form-setor">
                            <label htmlFor="sigla_setor">Sigla do setor{obrigatorio}</label>
                            <input
                            name="sigla_setor"
                            id="sigla_setor"
                            placeholder="Adicione a sigla do setor"
                            type="text"
                            required
                            />
                        </div>
                    </div>

                    <button className="botao-enviar-setor" type="submit">Enviar</button>
                </form>
            </div>

            <div className="setores__tabela-container">
                <table className="setores__tabela">
                    <thead>
                        <tr>
                            <th scope="col">Sigla</th>
                            <th scope="col">Setor</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>
                                {/*adicionar quando tiver os valores */}
                            </td>
                            <td>
                                {/*adicionar quando tiver os valores */}
                            </td>
                        </tr>
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

export default Setores;