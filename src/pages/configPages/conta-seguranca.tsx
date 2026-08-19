import { useNavigate } from "react-router";

function ContaSeguranca() {
    const navigate = useNavigate();

    async function sair() {
        const token = localStorage.getItem("access_token");

        try {
            if (token) {
                await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                });
            }
        } finally {
            localStorage.removeItem("access_token");
            navigate("/");
        }
    }

    return (
        <main className="conta-seguranca">
            <section className="conta-seguranca__item conta-seguranca__item--senha">
                <a 
                    className="conta-seguranca__acao"
                    href="/recuperar-senha"
                    target="_blank"
                >
                    <div className="conta-seguranca__icone">
                        <svg width="22" height="22" fill="currentColor" className="bi bi-key seguranca-icone" viewBox="0 0 16 16">
                            <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
                            <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                        </svg>
                    </div>

                    <div className="conta-seguranca__conteudo">
                        <strong className="conta-seguranca__titulo">Alterar senha</strong>
                        <span className="conta-seguranca__descricao">Recomendamos a alteração periódica da sua senha para garantir a segurança dos seus dados.</span>
                    </div>

                    <span className="conta-seguranca__indicador bi-arrow-right">
                        <svg width="20" height="20" fill="currentColor" className="bi" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                        </svg>
                    </span>
                </a>
            </section>

            <section className="conta-seguranca__item conta-seguranca__item--autenticacao">
                <div className="conta-seguranca__acao">
                    <div className="conta-seguranca__icone">
                        <svg width="22" height="22" fill="currentColor" className="bi bi-person-check seguranca-icone" viewBox="0 0 16 16">
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                            <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                        </svg>
                    </div>

                    <div className="conta-seguranca__conteudo">
                        <strong className="conta-seguranca__titulo">Autenticação de duas etapas</strong>
                        <span className="conta-seguranca__descricao">Adicione mais uma camada de proteção à sua conta ativando a autenticação em duas etapas.</span>
                    </div>

                    <span className="conta-seguranca__indicador">
                        <span 
                        className="conta-seguranca__alternador" 
                        aria-hidden="true"
                        onClick={(e) => {
                                        e.currentTarget.classList.toggle('conta-seguranca__alternador--ativo');
                                    }
                                }
                        />
                    </span>
                </div>
            </section>

            <section className="conta-seguranca__item conta-seguranca__item--sessoes">
                <a className="conta-seguranca__acao" onClick={sair}>
                    <div className="conta-seguranca__icone seguranca-icone-sair">
                        <svg width="22" height="22" fill="currentColor" className="bi bi-box-arrow-left seguranca-icone" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                            <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                        </svg>
                    </div>

                    <div className="conta-seguranca__conteudo">
                        <strong className="conta-seguranca__titulo conta-seguranca__titulo-sair">Encerrar sessões</strong>
                        <span className="conta-seguranca__descricao">Desconecte de outros dispositivos para garantir sua segurança.</span>
                    </div>

                    <span className="conta-seguranca__indicador bi-arrow-right icone-seta-sair">
                        <svg width="20" height="20" fill="currentColor" className="bi" viewBox="0 0 16 16" color="#b41313">
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                        </svg>
                    </span>
                </a>
            </section>
        </main>
    )
}

export default ContaSeguranca;
