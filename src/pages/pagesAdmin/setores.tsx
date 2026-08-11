import { useEffect, useState } from "react";
import { ModalFeedback } from "../../components/ModalFeedback";

type Setor = {
    setor: string;
    sigla_setor: string;
}

function Setores() {
    const [setores, setSetores] = useState<Setor[]>([]);
    const [feedback, setFeedback] = useState({
        aberto: false,
        tipo: "erro" as "erro" | "sucesso",
        mensagem: ""
    });

    useEffect(() => {
        async function carregarSetores() {
            try {
                const resposta = await fetch(`${import.meta.env.VITE_API_URL}/setores`);

                if (!resposta.ok) {
                    throw new Error("Falha ao carregar os setores.");
                }

                const setoresCadastrados: Setor[] = await resposta.json();
                setSetores(setoresCadastrados);
            } catch (erro) {
                console.error("Falha ao carregar os setores:", erro);
            }
        }

        carregarSetores();
    }, []);

    async function criar(
    event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault(); //Evita que a página recarregue ao clicar no botão de envio

        const formulario = event.currentTarget;
        const dadosFormulario = new FormData(formulario);

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

            setSetores((setoresAtuais) => [...setoresAtuais, resultado]);
            formulario.reset();
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
                            type="text"
                            autoComplete="off"
                            required
                            />
                        </div>
                        <div className="campo-form-setor">
                            <label htmlFor="sigla_setor">Sigla do setor{obrigatorio}</label>
                            <input
                            name="sigla_setor"
                            id="sigla_setor"
                            type="text"
                            autoComplete="off"
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
                        {setores.map((setor) => (
                            <tr key={`${setor.sigla_setor}-${setor.setor}`}>
                                <td>{setor.sigla_setor}</td>
                                <td>{setor.setor}</td>
                            </tr>
                        ))}
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
