import { useState } from "react";
import brasao from "../assets/img/brasao.png";
import "./css/home.css";

interface Setor {
    id: number;
    setor: string;
    sigla_setor: string;
}

function Sectors() {
    const [novaConversaAberta, setNovaConversaAberta] = useState(false);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [buscaSetor, setBuscaSetor] = useState("");
    const [carregandoSetores, setCarregandoSetores] = useState(false);
    const [erroSetores, setErroSetores] = useState("");

    async function abrirNovaConversa() {
        setNovaConversaAberta(true);
        setBuscaSetor("");
        setErroSetores("");
        setCarregandoSetores(true);

        const token = localStorage.getItem("access_token");

        if (!token) {
            setErroSetores("Não foi possível carregar os setores.");
            setCarregandoSetores(false);
            return;
        }

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/setores/com-funcionarios`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os setores.");
            }

            setSetores((await resposta.json()) as Setor[]);
        } catch (erro) {
            setErroSetores(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível carregar os setores.",
            );
        } finally {
            setCarregandoSetores(false);
        }
    }

    const termoBusca = buscaSetor.trim().toLowerCase();
    const setoresFiltrados = setores.filter(
        (setor) =>
            setor.setor.toLowerCase().includes(termoBusca) ||
            setor.sigla_setor.toLowerCase().includes(termoBusca),
    );

    return (
        <main className="home">
            <aside className="conversas">
                <header className="conversas-header">
                    <div className="header-name">
                        <img
                            className="header-logo"
                            src={brasao}
                            alt="Brasão da prefeitura"
                            width={40}
                        />

                        <span className="header-title">Fala Pommer</span>
                    </div>

                    <div className="header-menu">
                        <button
                            type="button"
                            className="header-menu-button"
                            aria-label="Nova conversa"
                            aria-expanded={novaConversaAberta}
                            onClick={() => void abrirNovaConversa()}
                        >
                            <span className="header-menu-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    className="header-menu-svg mensagem"
                                    viewBox="0 0 16 16"
                                    aria-hidden="true"
                                >
                                    <path
                                        className="conversa-icone-path"
                                        d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"
                                    />
                                    <path
                                        className="conversa-icone-path"
                                        d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                                    />
                                </svg>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="header-menu-button"
                            aria-label="Abrir menu"
                        >
                            <span className="header-menu-icon">
                                <svg
                                    className="header-menu-svg"
                                    viewBox="0 0 24 24"
                                    height="24"
                                    width="24"
                                    aria-hidden="true"
                                >
                                    <circle
                                        className="menu-dot menu-dot-top"
                                        cx="12"
                                        cy="6"
                                        r="2"
                                    />
                                    <circle
                                        className="menu-dot menu-dot-middle"
                                        cx="12"
                                        cy="12"
                                        r="2"
                                    />
                                    <circle
                                        className="menu-dot menu-dot-bottom"
                                        cx="12"
                                        cy="18"
                                        r="2"
                                    />
                                </svg>
                            </span>
                        </button>
                    </div>
                </header>

                <div className="pesquisa">
                    <div className="pesquisa-container">
                        <div className="pesquisa-icone-container">
                            <span className="pesquisa-icone">
                                <svg
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-search"
                                    viewBox="0 0 16 16"
                                    aria-hidden="true"
                                >
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                </svg>
                            </span>
                        </div>

                        <div className="pesquisa-input-container">
                            <input
                                className="pesquisa-input"
                                name="pesquisa-input"
                                aria-label="Pesquisar conversa"
                                autoComplete="off"
                                placeholder="Pesquisar conversa"
                                type="search"
                            />
                        </div>
                    </div>
                </div>

                <div className="filtros">
                    <div className="filtros-lista">
                        <button
                            type="button"
                            className="filtro-item filtro-todos ativo"
                            aria-pressed="true"
                        >
                            <span className="filtro-conteudo">
                                <span className="filtro-texto">Todos</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="filtro-item filtro-nao-lidas"
                            aria-pressed="false"
                        >
                            <span className="filtro-conteudo">
                                <span className="filtro-texto">Não lidas</span>
                            </span>
                        </button>
                    </div>
                </div>

                <section className="lista-conversas" aria-label="Conversas">
                    <p className="lista-conversas__vazia">
                        Nenhuma conversa disponível.
                    </p>
                </section>

                <section
                    className={`nova-conversa ${
                        novaConversaAberta ? "nova-conversa--aberta" : ""
                    }`}
                    aria-hidden={!novaConversaAberta}
                    aria-label="Selecionar setor"
                >
                    <header className="nova-conversa__header">
                        <button
                            type="button"
                            className="nova-conversa__voltar"
                            aria-label="Voltar"
                            tabIndex={novaConversaAberta ? 0 : -1}
                            onClick={() => setNovaConversaAberta(false)}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                                />
                            </svg>
                        </button>

                        <h2>Nova conversa</h2>
                    </header>

                    <div className="nova-conversa__pesquisa">
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>

                        <input
                            type="search"
                            placeholder="Pesquisar setor"
                            aria-label="Pesquisar setor"
                            autoComplete="off"
                            value={buscaSetor}
                            tabIndex={novaConversaAberta ? 0 : -1}
                            onChange={(event) => setBuscaSetor(event.target.value)}
                        />
                    </div>

                    <div className="nova-conversa__titulo-lista">SETORES</div>

                    <div className="nova-conversa__usuarios">
                        {carregandoSetores && (
                            <p className="nova-conversa__mensagem">
                                Carregando...
                            </p>
                        )}

                        {!carregandoSetores && erroSetores && (
                            <p className="nova-conversa__mensagem" role="alert">
                                {erroSetores}
                            </p>
                        )}

                        {!carregandoSetores &&
                            !erroSetores &&
                            setoresFiltrados.map((setor) => (
                                <button
                                    key={setor.id}
                                    type="button"
                                    className="nova-conversa__usuario"
                                    tabIndex={novaConversaAberta ? 0 : -1}
                                >
                                    <div className="nova-conversa__avatar">
                                        {setor.sigla_setor.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="nova-conversa__dados">
                                        <strong>{setor.setor}</strong>
                                        <span>{setor.sigla_setor}</span>
                                    </div>
                                </button>
                            ))}

                        {!carregandoSetores &&
                            !erroSetores &&
                            setoresFiltrados.length === 0 && (
                                <p className="nova-conversa__mensagem">
                                    Nenhum setor com funcionário vinculado foi
                                    encontrado.
                                </p>
                            )}
                    </div>
                </section>
            </aside>

            <section className="chat">
                <div className="chat-vazio">
                    <div className="chat-vazio__icone">
                        <svg
                            width="38"
                            height="38"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                            <path d="M8 10h.01" />
                            <path d="M12 10h.01" />
                            <path d="M16 10h.01" />
                        </svg>
                    </div>

                    <h2>Nenhuma conversa selecionada</h2>
                    <p>Selecione um setor ao lado para iniciar uma conversa.</p>
                </div>
            </section>
        </main>
    );
}

export default Sectors;
