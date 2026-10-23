import { useEffect, useState } from "react";
import { obterItensPaginacao } from "../../library/paginacao";
import { apiFetch } from "../../services/api";
import { formatarData } from "./relatoriosLogs";

type CriacaoLinkConvite = {
    id: number,
    comunidade: string,
    usuario: string,
    expira_em: string,
    usado: boolean,
    criado_em: string
}
//formatar data e hora da expiração e da criação
function RelatorioLinkConvite() {
    const [criacaoLinkConvite, setCriacaoLinkConvite] = useState<CriacaoLinkConvite[]>([]);



    useEffect(() => {
        const carregar = async () => {
            try {
                const resposta = await apiFetch('/comunidades/convites');

                if(!resposta.ok) {
                    throw new Error("Não foi possivel buscar logs dos links de convite")
                }

                const dados = await resposta.json() as CriacaoLinkConvite[];

                setCriacaoLinkConvite(dados)
            } catch (erro) {
                console.error(erro);
            }
        };

        void carregar();
    }, []);

    return (
        <section className="relatorios-logs" aria-labelledby="titulo-relatorios-links">
            <header className="relatorios-logs__header">
                <div>
                    <span>CONTROLE DE LINKS</span>
                    <h2 id="titulo-relatorios-erros">Criações de links de convite</h2>
                    <p>Acompanhe a criação de links de convite das comunidades</p>
                </div>
            </header>

            <div className="relatorios-logs__tabela-container">
                <table className="relatorios-logs__links">
                    <thead>
                        <tr>
                            <th scope="col">Criador</th>
                            <th scope="col">Comunidade</th>
                            <th scope="col">Data da criação</th>
                            <th scope="col">Expira em</th>
                            <th scope="col">Usado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Renderiza apenas os relatórios correspondentes à página atual. */}
                        {criacaoLinkConvite.map((convite) => (
                            <tr>
                                <td>{convite.usuario}</td>
                                <td>{convite.comunidade}</td>
                                <td>{formatarData(convite.criado_em)}</td>
                                <td>{formatarData(convite.expira_em)}</td>
                                <td>{convite.usado === true ? "Sim" : "Não"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </section>
    );
}

export default RelatorioLinkConvite;