import brasao from "../assets/img/brasao.png";
import "./css/home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import EmojiPicker from "../assets/emojiPicker";

interface UsuarioConversa {
    id: number;
    nome: string;
}

interface Conversa {
    id: number;
    tipo: "privada" | "grupo";
    criadaEm: string;
    contato: UsuarioConversa;
}

function Home() {
    const [novaConversaAberta, setNovaConversaAberta] = useState(false);

    const [usuarios, setUsuarios] = useState<UsuarioConversa[]>([]);

    const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioConversa | null>(null);

    const [buscaUsuario, setBuscaUsuario] = useState("");

    const [buscaConversa, setBuscaConversa] = useState("");

    const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);

    const [filtroAtivo, setFiltroAtivo] = useState("todos");

    const [contatoAtivo, setContatoAtivo] = useState<number | null>(null);

    const [menuAberto, setMenuAberto] = useState(false);

    const [menuAbertoArquivos, setMenuAbertoArquivo] = useState(false);

    const [conversas, setConversas] = useState<Conversa[]>([]);

    const [mensagem, setMensagem] = useState("");

    const [seletorEmojiAberto, setSeletorEmojiAberto] =
        useState(false);

    const navigate = useNavigate();

    function sair() {
        localStorage.removeItem("access_token");

        navigate("/");
    }

    interface Usuario {
        sub: number;
        email: string;
        tipo: "user" | "admin" | "funcionario";
    }

    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        async function buscarPerfil() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                return;
            }

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/Perfil`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resposta.ok) {
                    return;
                }

                const dados = await resposta.json();

                console.log("Usuário autenticado:", dados);

                setUsuario(dados);
            } catch (erro) {
                console.error("Erro ao buscar perfil:", erro);
            }
        }

        buscarPerfil();
    }, []);

    useEffect(() => {
        async function buscarConversas() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                return;
            }

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/conversas`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível carregar as conversas."
                    );
                }

                const dados: Conversa[] = await resposta.json();

                setConversas(dados);
            } catch (erro) {
                console.error(
                    "Erro ao carregar conversas:",
                    erro
                );
            }
        }

        buscarConversas();
    }, []);

    async function abrirNovaConversa() {
        setNovaConversaAberta(true);
        setCarregandoUsuarios(true);

        const token = localStorage.getItem("access_token");

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/usuarios/conversas`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível buscar os usuários.");
            }

            const dados = await resposta.json();

            setUsuarios(dados);

        } catch (erro) {
            console.error(erro);
        } finally {
            setCarregandoUsuarios(false);
        }
    }

    async function selecionarUsuario(
        usuario: UsuarioConversa
    ) {
        const token = localStorage.getItem("access_token");

        if (!token) {
            return;
        }

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        usuarioId: usuario.id
                    })
                }
            );

            if (!resposta.ok) {
                const resultado = await resposta.json();

                throw new Error(
                    Array.isArray(resultado.message)
                        ? resultado.message.join(", ")
                        : resultado.message
                );
            }

            const conversa: Conversa =
                await resposta.json();

            setUsuarioSelecionado(conversa.contato);
            setContatoAtivo(conversa.id);

            setConversas((conversasAtuais) => {
                const jaExiste = conversasAtuais.some(
                    (item) => item.id === conversa.id
                );

                return jaExiste
                    ? conversasAtuais
                    : [conversa, ...conversasAtuais];
            });

            setNovaConversaAberta(false);
        } catch (erro) {
            console.error(
                "Erro ao iniciar conversa:",
                erro
            );
        }
    }

    const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.nome
            .toLowerCase()
            .includes(buscaUsuario.toLowerCase())
    );

    const conversasFiltradas = conversas.filter((conversa) =>
        conversa.contato.nome
            .toLowerCase()
            .includes(buscaConversa.trim().toLowerCase())
    );

    function adicionarEmoji(emoji: string) {
        setMensagem((mensagemAtual) =>
            mensagemAtual + emoji
        );
    }

    return (
        <main className="home">
            <aside className="conversas">
                <header className="conversas-header">
                    <div className="header-name">
                        <img 
                            className="header-logo"
                            src={brasao} alt="Brasão da prefeitura" 
                            width={40}
                        />
                        <span className="header-title">Fala Pommer</span>
                    </div>

                    <div className="header-menu">
                        <button 
                            className="header-menu-button"
                            onClick={abrirNovaConversa}
                            aria-label="Nova conversa"
                        >
                            <span className="header-menu-icon">
                                <svg width="24" height="24" className="header-menu-svg mensagem" viewBox="0 0 16 16">
                                    <path className="conversa-icone-path" d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                                    <path className="conversa-icone-path" d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                </svg>
                            </span>
                        </button>

                        <button 
                            className="header-menu-button" 
                            onClick={() => setMenuAberto(aberto => !aberto)}
                        >
                            <span className="header-menu-icon">
                                <svg className="header-menu-svg" viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet">
                                    <circle className="menu-dot menu-dot-top" cx="12" cy="6" r="2" />
                                    <circle className="menu-dot menu-dot-middle" cx="12" cy="12" r="2" />
                                    <circle className="menu-dot menu-dot-bottom" cx="12" cy="18" r="2" />
                                </svg>
                            </span>
                        </button>
                    </div>

                </header>

                <div className="pesquisa">
                    <div className="pesquisa-container">
                        <div className="pesquisa-icone-container">
                            <span className="pesquisa-icone">
                                <svg width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                    <path className="pesquisa-icone-path" d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                </svg>
                            </span>
                        </div>

                        <div className="pesquisa-input-container">
                            <input
                                className="pesquisa-input"
                                name="pesquisa-input"
                                role="textbox"
                                aria-label="Pesquisar conversa"
                                autoComplete="off"
                                dir="ltr"
                                placeholder="Pesquisar conversa"
                                type="search"
                                value={buscaConversa}
                                onChange={(event) =>
                                    setBuscaConversa(event.target.value)
                                }
                            />
                        </div>
                    </div>

                </div>

                <div className="filtros">
                    <div className="filtros-lista">
                        <div className={`filtro-item filtro-todos ${
                            filtroAtivo === "todos" ? "ativo" : ""
                        }`}
                        onClick={() => setFiltroAtivo("todos")}
                        >
                            <div className="filtro-conteudo">
                                <span className="filtro-texto">
                                    Todos
                                </span>
                            </div>
                        </div>

                        <div className={`filtro-item filtro-nao-lidas ${
                            filtroAtivo === "nao-lidas" ? "ativo" : ""
                        }`}
                        onClick={() => setFiltroAtivo("nao-lidas")}
                        >
                            <div className="filtro-conteudo">
                                <span className="filtro-texto">
                                    Não lidas
                                </span>
                            </div>
                        </div>

                        <div className={`filtro-item filtro-grupos ${
                            filtroAtivo === "grupos" ? "ativo" : ""
                        }`}
                        onClick={() => setFiltroAtivo("grupos")}
                        >
                            <div className="filtro-conteudo">
                                <span className="filtro-texto">
                                    Grupos
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <section className="lista-conversas">

                    {conversasFiltradas.map((conversa) => (

                        <button
                            key={conversa.id}
                            onClick={() => {
                                setUsuarioSelecionado(
                                    conversa.contato
                                );
                                setContatoAtivo(conversa.id);
                            }}
                            className={`conversa-item ${
                                contatoAtivo === conversa.id &&
                                usuarioSelecionado?.id ===
                                    conversa.contato.id
                                    ? "contato-ativo"
                                    : ""
                            }`}
                        >
                            <div className="conversa-avatar">
                                {conversa.contato.nome
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="conversa-dados">
                                <strong>
                                    {conversa.contato.nome}
                                </strong>

                                <span>
                                    Clique para iniciar a conversa
                                </span>
                            </div>
                        </button>

                    ))}

                    {buscaConversa.trim() &&
                        conversasFiltradas.length === 0 && (
                            <p className="lista-conversas__vazia">
                                Nenhuma conversa encontrada.
                            </p>
                        )}

                </section>

                <div
                    className={`nova-conversa ${
                        novaConversaAberta ? "nova-conversa--aberta" : ""
                    }`}
                >
                    <header className="nova-conversa__header">
                        <button
                            className="nova-conversa__voltar"
                            onClick={() => setNovaConversaAberta(false)}
                            aria-label="Voltar"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 16 16"
                                fill="currentColor"
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
                        >
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>

                        <input
                            type="text"
                            placeholder="Pesquisar usuário"
                            value={buscaUsuario}
                            onChange={(event) => setBuscaUsuario(event.target.value)}
                        />

                    </div>


                    <div className="nova-conversa__titulo-lista">
                        USUÁRIOS
                    </div>


                    <div className="nova-conversa__usuarios">

                        {carregandoUsuarios && (
                            <p className="nova-conversa__mensagem">
                                Carregando usuários...
                            </p>
                        )}

                        {!carregandoUsuarios &&
                            usuariosFiltrados.map((usuario) => (

                                <button
                                    key={usuario.id}
                                    className="nova-conversa__usuario"
                                    onClick={() => selecionarUsuario(usuario)}
                                >

                                    <div className="nova-conversa__avatar">
                                        {usuario.nome.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="nova-conversa__dados">

                                        <strong>
                                            {usuario.nome}
                                        </strong>

                                        <span>
                                            Usuário Fala Pommer
                                        </span>

                                    </div>

                                </button>

                            ))
                        }


                        {!carregandoUsuarios &&
                            usuariosFiltrados.length === 0 && (

                                <p className="nova-conversa__mensagem">
                                    Nenhum usuário encontrado.
                                </p>

                            )
                        }

                    </div>

                </div>

            </aside>


            <section className="chat">
                {usuarioSelecionado ? (
                    <>
                        <header className="chat-header">
                            <div className="chat-header__usuario">
                                <div className="chat-header__avatar">
                                    {usuarioSelecionado.nome
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="chat-header__dados">
                                    <strong>
                                        {usuarioSelecionado.nome}
                                    </strong>
                                </div>
                            </div>
                        </header>

                        <div className="mensagens">
                            {/* Mensagens */}
                        </div>

                        <footer className="chat-input">
                            <div className="chat-input__conteudo">
                                <div className="chat-input__acao">
                                    <button
                                        type="button"
                                        aria-label="Anexar arquivo"
                                        onClick={() => setMenuAbertoArquivo(aberto => !aberto)}
                                    >
                                        <svg width="16" height="16" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
                                        </svg>
                                    </button>

                                    {menuAbertoArquivos && (
                                        <div className="menu-arquivos">
                                            <nav className="menu-arquivos__lista">
                                                <a href="#" className="menu-arquivos__item documentos">
                                                    <div className="menu-arquivos__icone">
                                                        <svg width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                                                            <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                                                            <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                                                        </svg>
                                                    </div>
                                                    <span className="menu-arquivos__texto">Documentos</span>
                                                </a>
                                                <a href="#" className="menu-arquivos__item fotos-videos">
                                                    <div className="menu-arquivos__icone">
                                                        <svg width="16" height="16" fill="currentColor" className="bi bi-images" viewBox="0 0 16 16">
                                                            <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                                                            <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"/>
                                                        </svg>
                                                    </div>
                                                    <span className="menu-arquivos__texto">Fotos e Videos</span>
                                                </a>
                                                <a href="#" className="menu-arquivos__item audio">
                                                    <div className="menu-arquivos__icone">
                                                        <svg width="16" height="16" fill="currentColor" className="bi bi-headphones" viewBox="0 0 16 16">
                                                            <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5"/>
                                                        </svg>
                                                    </div>
                                                    <span className="menu-arquivos__texto">Áudio</span>
                                                </a>
                                            </nav>
                                        </div>
                                    )}
                                </div>

                                <div className="chat-input__acao">
                                    <button
                                        type="button"
                                        aria-label="Adicionar emoji"
                                        aria-expanded={seletorEmojiAberto}
                                        onClick={() =>
                                            setSeletorEmojiAberto(
                                                (aberto) => !aberto
                                            )
                                        }
                                    >
                                        <svg width="16" height="16" fill="currentColor" className="bi bi-emoji-smile" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                            <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/>
                                        </svg>
                                    </button>

                                    {seletorEmojiAberto && (
                                        <div className="chat-input__emojis">
                                            <EmojiPicker
                                                aoSelecionar={(emoji) => {
                                                    adicionarEmoji(emoji);
                                                    setSeletorEmojiAberto(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="chat-input__campo">
                                    <input
                                        type="text"
                                        name="mensagem"
                                        aria-label="Mensagem"
                                        placeholder="Digite uma mensagem"
                                        autoComplete="off"
                                        value={mensagem}
                                        onChange={(event) =>
                                            setMensagem(event.target.value)
                                        }
                                    />
                                </div>

                                <div className="chat-input__audio">
                                    <button
                                        type="button"
                                        aria-label="Enviar áudio"
                                    >
                                        <svg width="16" height="16" fill="currentColor" className="bi bi-mic" viewBox="0 0 16 16">
                                            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
                                            <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3"/>
                                        </svg>
                                    </button>
                                </div>

                                <div className="chat-input__enviar">
                                    <button
                                        type="button"
                                        aria-label="Enviar mensagem"
                                    >
                                        <svg width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                                            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </>
                ) : (
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

                        <p>
                            Selecione um contato ao lado para iniciar
                            uma conversa.
                        </p>
                    </div>
                )}
            </section>

            {menuAberto && (
                <div className="menu-modal">
                    {usuario?.tipo === "admin" && (
                        <div className="menu-modal-item menu-modal-administracao">
                            <a href="#" className="menu-modal-button">
                                <svg width="16" height="16" fill="currentColor" className="bi bi-cup-hot icones-modal" viewBox="0 0 16 16">
                                    <path className="menu-modal-icone-path" fill-rule="evenodd" d="M.5 6a.5.5 0 0 0-.488.608l1.652 7.434A2.5 2.5 0 0 0 4.104 16h5.792a2.5 2.5 0 0 0 2.44-1.958l.131-.59a3 3 0 0 0 1.3-5.854l.221-.99A.5.5 0 0 0 13.5 6zM13 12.5a2 2 0 0 1-.316-.025l.867-3.898A2.001 2.001 0 0 1 13 12.5M2.64 13.825 1.123 7h11.754l-1.517 6.825A1.5 1.5 0 0 1 9.896 15H4.104a1.5 1.5 0 0 1-1.464-1.175"/>
                                    <path className="menu-modal-icone-path" d="m4.4.8-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 3.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 3.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 3 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 4.4.8m3 0-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 6.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 6.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 6 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 7.4.8m3 0-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.252.382l-.019.025-.005.008-.002.002A.5.5 0 0 1 9.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 9.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 9 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 10.4.8"/>
                                </svg>
                                <span className="menu-modal-texto">Administração</span>
                            </a>
                        </div>
                    )}

                    <div className="menu-modal-item menu-modal-configuracoes">
                        <a href="#" target="_blank" className="menu-modal-button">
                            <svg width="16" height="16" fill="currentColor" className="bi bi-gear icones-modal" viewBox="0 0 16 16">
                                <path className="menu-modal-icone-path" d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
                                <path className="menu-modal-icone-path" d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
                            </svg>
                            <span className="menu-modal-texto">Configurações</span>
                        </a>
                    </div>

                    <div className="menu-modal-item menu-modal-sair">
                        <a onClick={sair} className="menu-modal-button sair">
                            <svg width="16" height="16" fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                                <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                            </svg>
                            <span className="menu-modal-texto">Sair</span>
                        </a>
                    </div>
                
                </div>
            )}

        </main>
    )
}

export default Home;
