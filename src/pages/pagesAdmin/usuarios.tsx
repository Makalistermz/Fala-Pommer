import { useEffect, useState } from "react";
import { ModalConfirmacao } from "../../components/ModalConfirmacao";
import { ModalFeedback } from "../../components/ModalFeedback";

interface Usuario {
    id: number;
    nome: string;
    telefone: string;
    email: string;
    tipo_usuario: string;
}

const ITENS_POR_PAGINA = 25;

function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [pesquisa, setPesquisa] = useState("");
    const [usuarioParaApagar, setUsuarioParaApagar] = useState<Usuario | null>(null);
    const [usuarioSendoApagado, setUsuarioSendoApagado] = useState<number | null>(null);
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);
    const [feedback, setFeedback] = useState({
        aberto: false,
        tipo: "erro" as "erro" | "sucesso",
        mensagem: "",
    });

    const termoPesquisa = pesquisa.trim().toLocaleLowerCase("pt-BR");
    const usuariosFiltrados = usuarios.filter((usuario) =>
        String(usuario.id).includes(termoPesquisa) ||
        usuario.nome.toLocaleLowerCase("pt-BR").includes(termoPesquisa) ||
        usuario.telefone.toLocaleLowerCase("pt-BR").includes(termoPesquisa) ||
        usuario.email.toLocaleLowerCase("pt-BR").includes(termoPesquisa)
    );

    const totalPaginas = Math.ceil(usuariosFiltrados.length / ITENS_POR_PAGINA);
    const inicioPagina = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const usuariosPaginados = usuariosFiltrados.slice(
        inicioPagina,
        inicioPagina + ITENS_POR_PAGINA,
    );

    useEffect(() => {
        async function carregarUsuarios() {
            const token = localStorage.getItem("access_token");

            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/usuarios`,
                {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os usuários");
            }

            const dados: Usuario[] = await resposta.json();
            setUsuarios(dados);
        }

        carregarUsuarios().catch(console.error);
    }, []);

    useEffect(() => {
        if (totalPaginas > 0 && paginaAtual > totalPaginas) {
            setPaginaAtual(totalPaginas);
        }
    }, [paginaAtual, totalPaginas]);

    useEffect(() => {
        if (!usuarioEmEdicao) return;

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                setUsuarioEmEdicao(null);
            }
        }

        document.addEventListener("keydown", fecharComEscape);
        return () => document.removeEventListener("keydown", fecharComEscape);
    }, [usuarioEmEdicao]);

    async function apagar() {
        if (!usuarioParaApagar) return;

        setUsuarioSendoApagado(usuarioParaApagar.id);

        try {
            const token = localStorage.getItem("access_token");
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/usuarios/${usuarioParaApagar.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.message ?? "Não foi possível apagar o usuário.",
                );
            }

            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.filter(
                    (usuarioAtual) => usuarioAtual.id !== usuarioParaApagar.id,
                ),
            );
            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: "O usuário foi apagado com sucesso",
            });
        } catch (erro) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: erro instanceof Error
                    ? erro.message
                    : "Não foi possível apagar o usuário.",
            });
        } finally {
            setUsuarioSendoApagado(null);
            setUsuarioParaApagar(null);
        }
    }

    return (
        <section className="usuarios">
            <header className="usuarios__header">
                <div>
                    <span>CONTROLE DE USUÁRIOS</span>
                    <h2 id="titulo-usuarios">Alterar cargo e setor do usuário</h2>
                    <p>Ajuste o cargo e o setor de atuação do usuário no sistema.</p>
                </div>
            </header>

            <div className="usuarios__pesquisa">
                <input
                    type="search"
                    value={pesquisa}
                    onChange={(evento) => {
                        setPesquisa(evento.target.value);
                        setPaginaAtual(1);
                    }}
                    placeholder="Pesquisar usuários..."
                    aria-label="Pesquisar usuários"
                />
            </div>

            <div className="usuarios__tabela-container">
                <table className="usuarios__tabela">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Telefone</th>
                            <th scope="col">Email</th>
                            <th scope="col">Tipo de Usuário</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {usuariosPaginados.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className="usuarios__linha"
                                tabIndex={0}
                                onClick={() => setUsuarioEmEdicao(usuario)}
                                onKeyDown={(evento) => {
                                    if (evento.target !== evento.currentTarget) return;

                                    if (evento.key === "Enter" || evento.key === " ") {
                                        evento.preventDefault();
                                        setUsuarioEmEdicao(usuario);
                                    }
                                }}
                            >
                                <td>{usuario.id}</td>
                                <td>{usuario.nome}</td>
                                <td>{usuario.telefone}</td>
                                <td>{usuario.email}</td>
                                <td>{usuario.tipo_usuario}</td>
                                <td className="usuarios__acoes">
                                    <div className="usuarios__acoes-botoes">
                                        <button
                                            className="usuarios__botao-editar"
                                            type="button"
                                            onClick={(evento) => {
                                                evento.stopPropagation();
                                                setUsuarioEmEdicao(usuario);
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="usuarios__botao-apagar"
                                            type="button"
                                            onClick={(evento) => {
                                                evento.stopPropagation();
                                                setUsuarioParaApagar(usuario);
                                            }}
                                            disabled={usuarioSendoApagado === usuario.id}
                                        >
                                            {usuarioSendoApagado === usuario.id
                                                ? "Apagando..."
                                                : "Apagar"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPaginas > 1 && (
                <nav
                    aria-label="Paginação dos usuários"
                    className="relatorios-logs__paginacao"
                >
                    <button
                        type="button"
                        onClick={() => setPaginaAtual((pagina) => pagina - 1)}
                        disabled={paginaAtual === 1}
                    >
                        Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, indice) => {
                        const pagina = indice + 1;

                        return (
                            <button
                                key={pagina}
                                type="button"
                                onClick={() => setPaginaAtual(pagina)}
                                aria-current={paginaAtual === pagina ? "page" : undefined}
                                disabled={paginaAtual === pagina}
                            >
                                {pagina}
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

            {usuarioEmEdicao && (
                <div
                    className="usuarios__painel-fundo"
                    onClick={() => setUsuarioEmEdicao(null)}
                >
                    <aside
                        className="usuarios__painel-lateral"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Editar usuário"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <header className="header__painel-lateral">
                            <span>Informações</span>
                            <button
                                className="usuarios__painel-fechar"
                                type="button"
                                onClick={() => setUsuarioEmEdicao(null)}
                                aria-label="Fechar painel"
                            >
                                ×
                            </button>
                        </header>

                        <section>

                            <div>
                                <label>ID</label>
                                <input type="text" />
                            </div>

                            <div>
                                <label htmlFor="">Nome</label>
                                <input type="text" />
                            </div>

                            <div>
                                <label htmlFor="">Telefone</label>
                                <input type="text" />
                            </div>

                            <div>
                                <label htmlFor="">E-mail</label>
                                <input type="text" />
                            </div>

                            <div>
                                <label htmlFor="">Tipo de Usuario</label>
                                <input type="text" /> {/*adicionar um estilo de TCombo onde vai aparecer as tres opções de usuario  */}
                            </div>

                            <div>
                                <label htmlFor="">Setor vinculado</label>
                                <input type="text" /> {/*a mesma coisa adicionar uma especie de TCombo onde vai aparecer as opções de setores */}
                            </div>

                        </section>

                        <div className="usuarios__painel-conteudo" />
                    </aside>
                </div>
            )}

            <ModalConfirmacao
                aberto={usuarioParaApagar !== null}
                titulo="Apagar usuário?"
                mensagem={usuarioParaApagar
                    ? `Deseja realmente apagar o usuário ${usuarioParaApagar.nome}?`
                    : ""}
                carregando={usuarioSendoApagado !== null}
                aoCancelar={() => setUsuarioParaApagar(null)}
                aoConfirmar={() => void apagar()}
            />

            <ModalFeedback
                aberto={feedback.aberto}
                tipo={feedback.tipo}
                mensagem={feedback.mensagem}
                aoFechar={() => {
                    setFeedback((estadoAtual) => ({
                        ...estadoAtual,
                        aberto: false,
                    }));
                }}
            />
        </section>
    )
}

export default Usuarios;
