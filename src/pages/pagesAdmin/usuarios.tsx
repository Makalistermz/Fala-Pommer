import { useEffect, useState } from "react";

interface Usuario {
    id: number;
    nome: string;
    telefone: string;
    email: string;
}

const ITENS_POR_PAGINA = 50;

function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [pesquisa, setPesquisa] = useState("");

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
                        </tr>
                    </thead>

                    <tbody>
                        {usuariosPaginados.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.nome}</td>
                                <td>{usuario.telefone}</td>
                                <td>{usuario.email}</td>
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
        </section>
    )
}

export default Usuarios;
