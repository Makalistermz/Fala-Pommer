import { useEffect, useState } from "react";
import { obterItensPaginacao } from "../../../library/paginacao";

interface UsuarioAlvo {
    id: number;
    nome: string;
}

interface Historico {
    id: number;
    administrador: UsuarioAlvo;
    usuario_alvo: UsuarioAlvo;
    acao: "usuario_desativado" | "usuario_reativado";
    motivo: string | null;
    criado_em: string;
    tipo_usuario_anterior: string | null;
}

const ITENS_POR_PAGINA = 20;

function formatarAcao(acao: Historico["acao"]) {
    return acao === "usuario_desativado" ? "Desativação" : "Reativação";
}

function formatarTipoUsuario(tipo: string | null) {
    const tipos: Record<string, string> = {
        user: "Usuário",
        funcionario: "Funcionário",
        admin: "Administrador",
        superAdmin: "Super administrador",
    };

    return tipo ? tipos[tipo] ?? tipo : "—";
}

function formatarData(data: string) {
    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(dataConvertida);
}

function HistoricoAdministrativo() {
    const [historicos, setHistoricos] = useState<Historico[]>([]);
    const [pesquisa, setPesquisa] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const termoPesquisa = pesquisa.trim().toLocaleLowerCase("pt-BR");
    const historicosFiltrados = historicos.filter((historico) => (
        String(historico.id).includes(termoPesquisa) ||
        String(historico.administrador.id).includes(termoPesquisa) ||
        historico.administrador.nome
            .toLocaleLowerCase("pt-BR")
            .includes(termoPesquisa) ||
        String(historico.usuario_alvo.id).includes(termoPesquisa) ||
        historico.usuario_alvo.nome
            .toLocaleLowerCase("pt-BR")
            .includes(termoPesquisa) ||
        formatarAcao(historico.acao)
            .toLocaleLowerCase("pt-BR")
            .includes(termoPesquisa) ||
        (historico.motivo ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(termoPesquisa)
    ));

    const totalPaginas = Math.ceil(
        historicosFiltrados.length / ITENS_POR_PAGINA,
    );
    const inicioPagina = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const historicosPaginados = historicosFiltrados.slice(
        inicioPagina,
        inicioPagina + ITENS_POR_PAGINA,
    );

    useEffect(() => {
        let componenteAtivo = true;

        async function carregarHistorico() {
            try {
                const token = localStorage.getItem("access_token");
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/usuarios/historico-administrativo`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar o histórico administrativo.");
                }

                const dados: Historico[] = await resposta.json();

                if (componenteAtivo) {
                    setHistoricos(
                        dados.sort((primeiro, segundo) =>
                            segundo.criado_em.localeCompare(primeiro.criado_em),
                        ),
                    );
                }
            } catch (erroCarregamento) {
                if (componenteAtivo) {
                    setErro(
                        erroCarregamento instanceof Error
                            ? erroCarregamento.message
                            : "Não foi possível carregar o histórico administrativo.",
                    );
                }
            } finally {
                if (componenteAtivo) setCarregando(false);
            }
        }

        void carregarHistorico();

        return () => {
            componenteAtivo = false;
        };
    }, []);

    useEffect(() => {
        if (totalPaginas > 0 && paginaAtual > totalPaginas) {
            setPaginaAtual(totalPaginas);
        }
    }, [paginaAtual, totalPaginas]);

    return (
        <section className="usuarios">
            <header className="usuarios__header">
                <div>
                    <span>CONTROLE DE USUÁRIOS</span>
                    <h2 id="titulo-historico-administrativo">
                        Histórico de Ativação e Desativação
                    </h2>
                    <p>
                        Visualize quando e por quem os status dos usuários foram alterados.
                    </p>
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
                    placeholder="Pesquisar no histórico..."
                    aria-label="Pesquisar no histórico administrativo"
                />
            </div>

            <div className="usuarios__tabela-container">
                <table className="usuarios__tabela">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Feito por</th>
                            <th scope="col">Usuário alvo</th>
                            <th scope="col">Ação</th>
                            <th scope="col">Motivo</th>
                            <th scope="col">Quando</th>
                            <th scope="col">Tipo anterior</th>
                        </tr>
                    </thead>

                    <tbody>
                        {carregando && (
                            <tr>
                                <td colSpan={7}>Carregando histórico...</td>
                            </tr>
                        )}

                        {!carregando && erro && (
                            <tr>
                                <td colSpan={7}>{erro}</td>
                            </tr>
                        )}

                        {!carregando && !erro && historicosPaginados.length === 0 && (
                            <tr>
                                <td colSpan={7}>Nenhum registro encontrado.</td>
                            </tr>
                        )}

                        {!carregando && !erro && historicosPaginados.map((historico) => (
                            <tr key={historico.id}>
                                <td>{historico.id}</td>
                                <td>{historico.administrador.nome}</td>
                                <td>
                                    {historico.usuario_alvo.nome}
                                </td>
                                <td>
                                    <span
                                        className={`usuarios__status usuarios__status--${
                                            historico.acao === "usuario_desativado"
                                                ? "desativada"
                                                : "ativa"
                                        }`}
                                    >
                                        {formatarAcao(historico.acao)}
                                    </span>
                                </td>
                                <td>{historico.motivo || "—"}</td>
                                <td>{formatarData(historico.criado_em)}</td>
                                <td>{formatarTipoUsuario(historico.tipo_usuario_anterior)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPaginas > 1 && (
                <nav
                    aria-label="Paginação do histórico administrativo"
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
        </section>
    );
}

export default HistoricoAdministrativo;
