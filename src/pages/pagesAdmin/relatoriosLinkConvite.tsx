import { useEffect, useState } from "react";
import { obterItensPaginacao } from "../../library/paginacao";
import { apiFetch } from "../../services/api";

function RelatorioLinkConvite() {

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
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </section>
    );
}

export default RelatorioLinkConvite;