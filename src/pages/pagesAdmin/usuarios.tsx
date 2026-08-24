// Permite consultar e gerenciar os usuários cadastrados.
import { useEffect, useState } from "react";
import { obterItensPaginacao } from "../../library/paginacao";
import { ModalConfirmacao } from "../../components/ModalConfirmacao";
import { ModalFeedback } from "../../components/ModalFeedback";

interface Usuario {
    id: number;
    nome: string;
    telefone: string;
    email: string;
    tipo_usuario: string;
    setor_id?: number | null;
}

interface Setor {
    id: number;
    setor: string;
    sigla_setor: string;
}

const ITENS_POR_PAGINA = 25;

function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [pesquisa, setPesquisa] = useState("");
    const [usuarioParaApagar, setUsuarioParaApagar] = useState<Usuario | null>(null);
    const [usuarioSendoApagado, setUsuarioSendoApagado] = useState<number | null>(null);
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);
    const [setorEmEdicao, setSetorEmEdicao] = useState("");
    const [salvandoAlteracoes, setSalvandoAlteracoes] = useState(false);
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
        async function carregarSetores() {
            const token = localStorage.getItem("access_token");
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/setores`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os setores");
            }

            const dados: Setor[] = await resposta.json();
            setSetores(dados);
        }

        carregarSetores().catch(console.error);
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

    function abrirEdicao(usuario: Usuario) {
        setUsuarioEmEdicao({ ...usuario });
        setSetorEmEdicao(usuario.setor_id ? String(usuario.setor_id) : "");
    }

    async function salvarAlteracoes() {
        if (!usuarioEmEdicao) return;

        setSalvandoAlteracoes(true);

        try {
            const token = localStorage.getItem("access_token");
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/usuarios/${usuarioEmEdicao.id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        telefone: usuarioEmEdicao.telefone,
                        email: usuarioEmEdicao.email,
                        tipo_usuario: usuarioEmEdicao.tipo_usuario,
                        setor_id: setorEmEdicao ? Number(setorEmEdicao) : null,
                    }),
                },
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                const mensagem = Array.isArray(resultado.message)
                    ? resultado.message.join(" ")
                    : resultado.message;
                throw new Error(mensagem ?? "Não foi possível salvar as alterações.");
            }

            const usuarioAtualizado = resultado as Usuario;
            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((usuarioAtual) =>
                    usuarioAtual.id === usuarioAtualizado.id
                        ? usuarioAtualizado
                        : usuarioAtual,
                ),
            );
            setUsuarioEmEdicao(null);
            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: "As alterações do usuário foram salvas com sucesso.",
            });
        } catch (erro) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: erro instanceof Error
                    ? erro.message
                    : "Não foi possível salvar as alterações.",
            });
        } finally {
            setSalvandoAlteracoes(false);
        }
    }

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
                                onClick={() => abrirEdicao(usuario)}
                                onKeyDown={(evento) => {
                                    if (evento.target !== evento.currentTarget) return;

                                    if (evento.key === "Enter" || evento.key === " ") {
                                        evento.preventDefault();
                                        abrirEdicao(usuario);
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
                                                abrirEdicao(usuario);
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

                        <section className="container-info__painel-lateral">

                            <div className="info__painel-lateral">
                                <label>ID</label>
                                <input type="text" value={usuarioEmEdicao.id} readOnly />
                            </div>

                            <div className="info__painel-lateral">
                                <label htmlFor="">Nome</label>
                                <input type="text" value={usuarioEmEdicao.nome} readOnly />
                            </div>

                            <div className="info__painel-lateral">
                                <label htmlFor="telefone">Telefone</label>
                                <input
                                    type="text"
                                    id="telefone"
                                    value={usuarioEmEdicao.telefone}
                                    onChange={(evento) => {
                                        setUsuarioEmEdicao((usuarioAtual) =>
                                            usuarioAtual
                                                ? { ...usuarioAtual, telefone: evento.target.value }
                                                : null,
                                        );
                                    }}
                                />
                            </div>

                            <div className="info__painel-lateral">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    type="text"
                                    id="email"
                                    value={usuarioEmEdicao.email}
                                    onChange={(evento) => {
                                        setUsuarioEmEdicao((usuarioAtual) =>
                                            usuarioAtual
                                                ? { ...usuarioAtual, email: evento.target.value }
                                                : null,
                                        );
                                    }}
                                />
                            </div>

                            <div className="info__painel-lateral">
                                <label htmlFor="tipo-usuario">Tipo de Usuario</label>
                                <select
                                    id="tipo-usuario"
                                    value={usuarioEmEdicao.tipo_usuario}
                                    onChange={(evento) => {
                                        const tipoUsuario = evento.target.value;

                                        setUsuarioEmEdicao((usuarioAtual) =>
                                            usuarioAtual
                                                ? { ...usuarioAtual, tipo_usuario: tipoUsuario }
                                                : null,
                                        );

                                        if (tipoUsuario !== "funcionario") {
                                            setSetorEmEdicao("");
                                        }
                                    }}
                                >
                                    <option value="user">Usuário</option>
                                    <option value="funcionario">Funcionário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            {usuarioEmEdicao.tipo_usuario === "funcionario" && (
                                <div className="info__painel-lateral">
                                    <label htmlFor="setor-vinculado">Setor vinculado</label>
                                    <select
                                        id="setor-vinculado"
                                        value={setorEmEdicao}
                                        onChange={(evento) => setSetorEmEdicao(evento.target.value)}
                                    >
                                        <option value="" disabled>Selecione um setor</option>
                                        {setores.map((setor) => (
                                            <option key={setor.id} value={setor.id}>
                                                {setor.sigla_setor} - {setor.setor}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => void salvarAlteracoes()}
                                className="botao__info-painel-lateral"
                                disabled={salvandoAlteracoes}
                            >
                                {salvandoAlteracoes ? "Salvando..." : "Salvar alterações"}
                            </button>

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
