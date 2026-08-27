// Permite consultar e gerenciar os setores cadastrados.
import { useEffect, useState } from "react";
import { obterItensPaginacao } from "../../../library/paginacao";
import { ModalConfirmacao } from "../../../components/ModalConfirmacao";
import { ModalFeedback } from "../../../components/ModalFeedback";

type Setor = {
    id: number;
    setor: string;
    sigla_setor: string;
    secretaria_id: number;
    secretaria_relacao: Secretaria;
}

type Secretaria = {
    id: number;
    secretaria: string;
    sigla_secretaria: string;
}

const ITENS_POR_PAGINA = 20;

function Setores() {
    const [setores, setSetores] = useState<Setor[]>([]);
    const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [setorParaApagar, setSetorParaApagar] = useState<Setor | null>(null);
    const [setorSendoApagado, setSetorSendoApagado] = useState<number | null>(null);
    const [feedback, setFeedback] = useState({
        aberto: false,
        tipo: "erro" as "erro" | "sucesso",
        mensagem: ""
    });

    const totalPaginas = Math.ceil(setores.length / ITENS_POR_PAGINA);
    const inicioPagina = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const setoresPaginados = setores.slice(
        inicioPagina,
        inicioPagina + ITENS_POR_PAGINA,
    );

    useEffect(() => {
        async function carregarDados() {
            try {
                const token = localStorage.getItem("access_token");
                const headers = {
                    Authorization: `Bearer ${token}`,
                };
                const [respostaSetores, respostaSecretarias] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/setores`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/secretaria`, { headers }),
                ]);

                if (!respostaSetores.ok || !respostaSecretarias.ok) {
                    throw new Error("Falha ao carregar os setores e secretarias.");
                }

                const setoresCadastrados: Setor[] = await respostaSetores.json();
                const secretariasCadastradas: Secretaria[] =
                    await respostaSecretarias.json();
                setSetores(setoresCadastrados);
                setSecretarias(secretariasCadastradas);
            } catch (erro) {
                console.error("Falha ao carregar setores e secretarias:", erro);
                setFeedback({
                    aberto: true,
                    tipo: "erro",
                    mensagem: "Não foi possível carregar os setores e secretarias.",
                });
            }
        }

        void carregarDados();
    }, []);

    useEffect(() => {
        if (totalPaginas > 0 && paginaAtual > totalPaginas) {
            setPaginaAtual(totalPaginas);
        }
    }, [paginaAtual, totalPaginas]);

    async function criar(
    event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault(); //Evita que a página recarregue ao clicar no botão de envio

        const formulario = event.currentTarget;
        const dadosFormulario = new FormData(formulario);

        const dados = Object.fromEntries(dadosFormulario.entries());

        try {
            const token = localStorage.getItem("access_token");
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/setores`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
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

    async function apagar() {
        if (!setorParaApagar) return;

        setSetorSendoApagado(setorParaApagar.id);

        try {
            const token = localStorage.getItem("access_token");
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/setores/${setorParaApagar.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.message ?? "Não foi possível apagar o setor.");
            }

            setSetores((setoresAtuais) =>
                setoresAtuais.filter((setorAtual) => setorAtual.id !== setorParaApagar.id),
            );
            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: "O setor foi apagado com sucesso"
            });
        } catch (erro) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: erro instanceof Error
                    ? erro.message
                    : "Não foi possível apagar o setor."
            });
        } finally {
            setSetorSendoApagado(null);
            setSetorParaApagar(null);
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
                        <div className="campo-form-setor campo-form-setor--secretaria">
                            <label htmlFor="campo-add-secretaria">Secretaria</label>
                            <select
                                name="secretaria_id"
                                id="campo-add-secretaria"
                                defaultValue=""
                                required
                            >
                                <option value="" disabled>
                                    Selecione uma secretaria
                                </option>
                                {secretarias.map((secretaria) => (
                                    <option key={secretaria.id} value={secretaria.id}>
                                        {secretaria.sigla_secretaria} - {secretaria.secretaria}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="campo-form-setor">
                            <label htmlFor="setor">Setor{obrigatorio}</label>
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
                            <th scope="col">Secretaria</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {setoresPaginados.map((setor) => (
                            <tr key={setor.id}>
                                <td>{setor.sigla_setor}</td>
                                <td>{setor.setor}</td>
                                <td>{setor.secretaria_relacao.sigla_secretaria}</td>
                                <td className="setores__acoes">
                                    <button
                                        className="setores__botao-apagar"
                                        type="button"
                                        onClick={() => setSetorParaApagar(setor)}
                                        disabled={setorSendoApagado === setor.id}
                                    >
                                        {setorSendoApagado === setor.id ? "Apagando..." : "Apagar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPaginas > 1 && (
                <nav
                    aria-label="Paginação dos setores"
                    className="relatorios-logs__paginacao"
                >
                    <button
                        type="button"
                        onClick={() => setPaginaAtual((pagina) => pagina - 1)}
                        disabled={paginaAtual === 1}
                    >
                        Anterior
                    </button>

                    {obterItensPaginacao(paginaAtual, totalPaginas).map((item) => {
                        if (typeof item === "string") {
                            return (
                                <span key={item} aria-hidden="true">
                                    …
                                </span>
                            );
                        }

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setPaginaAtual(item)}
                                aria-current={paginaAtual === item ? "page" : undefined}
                                disabled={paginaAtual === item}
                            >
                                {item}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setPaginaAtual((pagina) => pagina + 1)}
                        disabled={paginaAtual === totalPaginas}
                    >
                        Próxima
                    </button>
                </nav>
            )}

            <ModalConfirmacao
                aberto={setorParaApagar !== null}
                titulo="Apagar setor?"
                mensagem={setorParaApagar
                    ? `Deseja realmente apagar o setor ${setorParaApagar.setor}?`
                    : ""}
                carregando={setorSendoApagado !== null}
                aoCancelar={() => setSetorParaApagar(null)}
                aoConfirmar={() => void apagar()}
            />

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
