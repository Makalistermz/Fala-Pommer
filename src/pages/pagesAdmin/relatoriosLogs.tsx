import { useEffect, useState } from "react";

type RelatorioLog = {
    id: number;
    usuario: string;
    tipoUsuario: "admin" | "user" | "funcionario";
    entrada: string;
    saida: string | null;
};

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
});

const NOMES_PERFIS: Record<RelatorioLog["tipoUsuario"], string> = {
    admin: "Administrador",
    user: "Usuário",
    funcionario: "Funcionário",
};

function formatarData(data: string) {
    return FORMATADOR_DATA.format(new Date(data));
}

function RelatoriosLogs() {
    const [relatorios, setRelatorios] = useState<RelatorioLog[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const controlador = new AbortController();

        async function carregarRelatorios() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                setErro("Sessão expirada. Entre novamente para consultar os relatórios.");
                setCarregando(false);
                return;
            }

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/relatorios-logs`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controlador.signal,
                    },
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível consultar os relatórios.");
                }

                const dados = await resposta.json() as RelatorioLog[];
                setRelatorios(dados);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setErro("Não foi possível carregar o histórico de acessos.");
            } finally {
                if (!controlador.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        void carregarRelatorios();

        return () => controlador.abort();
    }, []);

    return (
        <section className="relatorios-logs" aria-labelledby="titulo-relatorios-logs">
            <header className="relatorios-logs__header">
                <div>
                    <span>CONTROLE DE ACESSOS</span>
                    <h2 id="titulo-relatorios-logs">Entradas e saídas do sistema</h2>
                    <p>Acompanhe o histórico de acesso dos usuários.</p>
                </div>
            </header>

            <div className="relatorios-logs__tabela-container">
                <table className="relatorios-logs__tabela">
                    <thead>
                        <tr>
                            <th scope="col">Usuário</th>
                            <th scope="col">Perfil</th>
                            <th scope="col">Entrada</th>
                            <th scope="col">Saída</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carregando && (
                            <tr>
                                <td className="relatorios-logs__mensagem" colSpan={5}>
                                    Carregando relatórios...
                                </td>
                            </tr>
                        )}

                        {!carregando && erro && (
                            <tr>
                                <td className="relatorios-logs__mensagem relatorios-logs__mensagem--erro" colSpan={5}>
                                    {erro}
                                </td>
                            </tr>
                        )}

                        {!carregando && !erro && relatorios.length === 0 && (
                            <tr>
                                <td className="relatorios-logs__mensagem" colSpan={5}>
                                    Nenhum acesso registrado.
                                </td>
                            </tr>
                        )}

                        {!carregando && !erro && relatorios.map((relatorio) => (
                            <tr key={relatorio.id}>
                                <td>
                                    <strong className="relatorios-logs__usuario">
                                        {relatorio.usuario}
                                    </strong>
                                </td>
                                <td>{NOMES_PERFIS[relatorio.tipoUsuario]}</td>
                                <td>{formatarData(relatorio.entrada)}</td>
                                <td>
                                    {relatorio.saida
                                        ? formatarData(relatorio.saida)
                                        : "Não registrada"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default RelatoriosLogs;
