import brasao from "../assets/img/brasao.png";
import "./css/home.css";
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type RefObject,
} from "react";
import { useNavigate } from "react-router";
import EmojiPicker from "../assets/emojiPicker";
import gsap from "gsap";

type TipoUsuario = "user" | "admin" | "funcionario";

interface UsuarioBasico {
    id: number;
    nome: string;
}

interface UsuarioConversa extends UsuarioBasico {
    tipoUsuario: TipoUsuario;
    setor: {
        id: number;
        nome: string;
        sigla: string;
    } | null;
}

interface Setor {
    id: number;
    setor: string;
    sigla_setor: string;
}

interface UltimaMensagem {
    id: number;
    conteudo: string;
    origem: "usuario" | "setor";
    arquivoNome?: string | null;
    arquivoTipo?: string | null;
    enviadaEm: string;
}

interface ConversaSetor {
    id: number;
    tipo: "setor";
    criadaEm: string;

    setor: {
        id: number;
        nome: string;
        sigla: string;
    };

    usuario: UsuarioBasico;
    ultimaMensagem: UltimaMensagem | null;
}

interface ConversaPrivada {
    id: number;
    tipo: "privada";
    criadaEm: string;
    contato: {
        id: number;
        nome: string;
        tipo_usuario: TipoUsuario;
    };
    ultimaMensagem: UltimaMensagem | null;
}

type Conversa = ConversaSetor | ConversaPrivada;

interface MensagemChat {
    id: number;
    conversaId: number;
    conteudo: string;
    origem: "usuario" | "setor";
    enviadaEm: string;

    remetente: {
        tipo: "usuario" | "setor";
        id: number;
        nome: string;
    };

    autorReal?: {
        id: number;
        nome: string;
    };

    arquivo?: {
        nome: string;
        url: string;
        tipo: "documento" | "imagem" | "video" | "audio";
        mime: string;
        tamanho: number;
    } | null;
}

function Home() {
    const [novaConversaAberta, setNovaConversaAberta] = useState(false);

    const [usuarios, setUsuarios] = useState<UsuarioConversa[]>([]);

    const [setores, setSetores] = useState<Setor[]>([]);

    const [conversaSelecionada, setConversaSelecionada] =
        useState<Conversa | null>(null);

    const [mensagensChat, setMensagensChat] = useState<MensagemChat[]>([]);

    const [carregandoMensagens, setCarregandoMensagens] = useState(false);

    const [enviandoMensagem, setEnviandoMensagem] = useState(false);

    const fimMensagensRef = useRef<HTMLDivElement>(null);
    const balõesRef = useRef<Map<number, HTMLElement>>(new Map());
    const idsAnimadosRef = useRef<Set<number>>(new Set());

    const [buscaUsuario, setBuscaUsuario] = useState("");

    const [buscaConversa, setBuscaConversa] = useState("");

    const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);

    const [filtroAtivo, setFiltroAtivo] = useState("todos");

    const [menuAberto, setMenuAberto] = useState(false);

    const [menuAbertoArquivos, setMenuAbertoArquivo] = useState(false);

    const [conversas, setConversas] = useState<Conversa[]>([]);

    const [mensagem, setMensagem] = useState("");

    const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
        null,
    );

    const [seletorEmojiAberto, setSeletorEmojiAberto] = useState(false);

    const inputDocumentosRef = useRef<HTMLInputElement>(null);

    const inputMidiasRef = useRef<HTMLInputElement>(null);

    const inputAudiosRef = useRef<HTMLInputElement>(null);
    const gravadorAudioRef = useRef<MediaRecorder | null>(null);
    const fluxoAudioRef = useRef<MediaStream | null>(null);
    const partesAudioRef = useRef<Blob[]>([]);
    const [gravandoAudio, setGravandoAudio] = useState(false);

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

    interface Usuario {
        sub: number;
        email: string;
        tipo: TipoUsuario;
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
                    Authorization: `Bearer ${token}`,
                    },
                },
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
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [respostaPrivadas, respostaSetores] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/conversas`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/conversas/setor`, { headers }),
                ]);

                if (!respostaPrivadas.ok || !respostaSetores.ok) {
                    throw new Error("Não foi possível carregar as conversas.");
                }

                const [conversasPrivadas, conversasSetores] = await Promise.all([
                    respostaPrivadas.json() as Promise<ConversaPrivada[]>,
                    respostaSetores.json() as Promise<ConversaSetor[]>,
                ]);

                const todasConversas: Conversa[] = [
                    ...conversasPrivadas,
                    ...conversasSetores,
                ].sort((conversaA, conversaB) => {
                const dataA = new Date(
                    conversaA.ultimaMensagem?.enviadaEm ?? conversaA.criadaEm,
                ).getTime();

                const dataB = new Date(
                    conversaB.ultimaMensagem?.enviadaEm ?? conversaB.criadaEm,
                ).getTime();

                return dataB - dataA;
                });

                setConversas(todasConversas);
            } catch (erro) {
                console.error("Erro ao carregar conversas:", erro);
            }
        }

        buscarConversas();
    }, []);

    async function abrirNovaConversa() {
        if (!usuario) {
            return;
        }

        setNovaConversaAberta(true);
        setCarregandoUsuarios(true);
        setBuscaUsuario("");

        const token = localStorage.getItem("access_token");

        if (!token) {
            setCarregandoUsuarios(false);
            return;
        }

        try {
            const rota = usuario.tipo === "user" ? "/setores" : "/usuarios/conversas";

            const resposta = await fetch(`${import.meta.env.VITE_API_URL}${rota}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar as opções.");
            }

            const dados = await resposta.json();

            if (usuario.tipo === "user") {
                setSetores(dados as Setor[]);
                setUsuarios([]);
            } else {
                setUsuarios(dados as UsuarioConversa[]);
                setSetores([]);
            }
        } catch (erro) {
            console.error(erro);
        } finally {
            setCarregandoUsuarios(false);
        }
    }

    async function selecionarUsuario(contato: UsuarioConversa) {
        const token = localStorage.getItem("access_token");

        if (!token || !usuario || usuario.tipo === "user") {
            return;
        }

        try {
            const rota =
                usuario.tipo === "admin" ? "/conversas" : "/conversas/setor/usuario";

            const resposta = await fetch(`${import.meta.env.VITE_API_URL}${rota}`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                usuarioId: contato.id,
                }),
            });

            if (!resposta.ok) {
                const resultado = await resposta.json();

                throw new Error(
                Array.isArray(resultado.message)
                    ? resultado.message.join(", ")
                    : resultado.message,
                );
            }

            const conversa = (await resposta.json()) as Conversa;
            adicionarEAbrirConversa(conversa);
        } catch (erro) {
            console.error("Erro ao iniciar conversa:", erro);
        }
    }

    async function selecionarSetor(setor: Setor) {
        const token = localStorage.getItem("access_token");

        if (!token) {
            return;
        }

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/setor`,
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    setorId: setor.id,
                }),
                },
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                Array.isArray(resultado.message)
                    ? resultado.message.join(", ")
                    : resultado.message,
                );
            }

            adicionarEAbrirConversa(resultado);
        } catch (erro) {
            console.error("Erro ao iniciar atendimento:", erro);
        }
    }

    async function enviarMensagem() {
        const conteudo = mensagem.trim();
        const token = localStorage.getItem("access_token");

        if (
            (!conteudo && !arquivoSelecionado) ||
            !token ||
            !conversaSelecionada ||
            enviandoMensagem
        ) {
            return;
        }

        setEnviandoMensagem(true);

        try {
            const corpo = arquivoSelecionado
                ? new FormData()
                : JSON.stringify({ conteudo });

            if (corpo instanceof FormData) {
                if (conteudo) corpo.append("conteudo", conteudo);
                corpo.append("arquivo", arquivoSelecionado!);
            }

            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/${conversaSelecionada.id}/mensagens`,
                {
                method: "POST",
                headers: arquivoSelecionado
                    ? { Authorization: `Bearer ${token}` }
                    : {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                body: corpo,
                },
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                Array.isArray(resultado.message)
                    ? resultado.message.join(", ")
                    : resultado.message,
                );
            }

            const novaMensagem = resultado as MensagemChat;

            setMensagensChat((mensagensAtuais) => [...mensagensAtuais, novaMensagem]);

            setConversas((conversasAtuais) =>
                conversasAtuais.reduce<Conversa[]>((resultado, conversa) => {
                if (conversa.id !== conversaSelecionada.id) {
                    resultado.push(conversa);
                    return resultado;
                }

                const conversaAtualizada: Conversa = {
                    ...conversa,
                    ultimaMensagem: {
                    id: novaMensagem.id,
                    conteudo: novaMensagem.conteudo,
                    origem: novaMensagem.origem,
                    arquivoNome: novaMensagem.arquivo?.nome,
                    arquivoTipo: novaMensagem.arquivo?.tipo,
                    enviadaEm: novaMensagem.enviadaEm,
                    },
                };

                resultado.unshift(conversaAtualizada);
                return resultado;
                }, []),
            );

            setMensagem("");
            setArquivoSelecionado(null);
        } catch (erro) {
            console.error("Erro ao enviar mensagem:", erro);
            window.alert(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível enviar a mensagem.",
            );
        } finally {
            setEnviandoMensagem(false);
        }
    }

    const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(buscaUsuario.toLowerCase()),
    );

    function adicionarEAbrirConversa(conversa: Conversa) {
        setConversas((conversasAtuais) => {
            const jaExiste = conversasAtuais.some((item) => item.id === conversa.id);

        return jaExiste
            ? conversasAtuais.map((item) =>
                item.id === conversa.id ? conversa : item,
            )
            : [conversa, ...conversasAtuais];
        });

        setNovaConversaAberta(false);
        void abrirConversa(conversa);
    }

    async function abrirConversa(conversa: Conversa) {
        setConversaSelecionada(conversa);
        setMensagensChat([]);
        setCarregandoMensagens(true);

        const token = localStorage.getItem("access_token");

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/${conversa.id}/mensagens`,
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar as mensagens.");
            }

            const dados: MensagemChat[] = await resposta.json();

            setMensagensChat(dados);
        } catch (erro) {
            console.error(erro);
            setMensagensChat([]);
        } finally {
            setCarregandoMensagens(false);
        }
    }

    function nomeDaConversa(conversa: Conversa) {
        if (conversa.tipo === "privada") {
            return conversa.contato.nome;
        }

        return usuario?.tipo === "user"
        ? conversa.setor.nome
        : conversa.usuario.nome;
    }

    function subtituloDaConversa(conversa: Conversa) {
        if (conversa.tipo === "setor") {
            return usuario?.tipo === "user"
                ? conversa.setor.sigla
                : conversa.setor.nome;
        }

        if (conversa.contato.tipo_usuario === "funcionario") {
            return "Conversa privada com funcionário";
        }

        if (conversa.contato.tipo_usuario === "admin") {
            return "Conversa privada com administrador";
        }

        return "Conversa privada";
    }

    function mensagemFoiEnviadaPorMim(item: MensagemChat) {
        if (!usuario || !conversaSelecionada) {
            return false;
        }

        if (conversaSelecionada.tipo === "privada") {
            const remetenteRealId = item.autorReal?.id ?? item.remetente.id;
            return remetenteRealId === usuario.sub;
        }

        if (usuario.tipo === "user") {
            return item.origem === "usuario" && item.remetente.id === usuario.sub;
        }

        if (usuario.tipo === "funcionario") {
            return item.origem === "setor";
        }

        return false;
    }

    const conversasFiltradas = conversas.filter((conversa) => {
        const texto =
        conversa.tipo === "privada"
            ? `${conversa.contato.nome} ${conversa.contato.tipo_usuario}`
            : `${conversa.setor.nome} ${conversa.setor.sigla} ${conversa.usuario.nome}`;

        return texto.toLowerCase().includes(buscaConversa.trim().toLowerCase());
    });

    const podeEnviarMensagem =
        conversaSelecionada?.tipo === "privada" || usuario?.tipo !== "admin";

    const setoresFiltrados = setores.filter((setor) => {
        const busca = buscaUsuario.trim().toLowerCase();

        return (
            setor.setor.toLowerCase().includes(busca) ||
            setor.sigla_setor.toLowerCase().includes(busca)
        );
    });

    useEffect(() => {
        idsAnimadosRef.current.clear();
        balõesRef.current.clear();
    }, [conversaSelecionada?.id]);

    useEffect(() => {
        if (carregandoMensagens) return;

        const mensagensNovas = mensagensChat.filter(
            (item) => !idsAnimadosRef.current.has(item.id),
        );

        const elementos = mensagensNovas
            .map((item) => balõesRef.current.get(item.id))
            .filter((elemento): elemento is HTMLElement => Boolean(elemento));

        mensagensNovas.forEach((item) => idsAnimadosRef.current.add(item.id));

        if (elementos.length > 0) {
            gsap.fromTo(
                elementos,
                { opacity: 0, scale: 0.7, y: 10 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.35,
                    ease: "back.out(2)",
                    stagger: 0.08,
                },
            );
        }

        const idsAtuais = new Set(mensagensChat.map((item) => item.id));

        for (const id of balõesRef.current.keys()) {
            if (!idsAtuais.has(id)) {
                balõesRef.current.delete(id);
            }
        }
    }, [mensagensChat, carregandoMensagens]);

    useEffect(() => {
        fimMensagensRef.current?.scrollIntoView({
        behavior: "smooth",
        });
    }, [mensagensChat]);

    function adicionarEmoji(emoji: string) {
        setMensagem((mensagemAtual) => mensagemAtual + emoji);
    }

    function abrirSeletorArquivo(referencia: RefObject<HTMLInputElement | null>) {
        referencia.current?.click();
        setMenuAbertoArquivo(false);
    }

    function selecionarArquivo(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0];

        if (arquivo && arquivo.size > 25 * 1024 * 1024) {
            window.alert("O arquivo deve ter no máximo 25 MB.");
        } else if (arquivo) {
            setArquivoSelecionado(arquivo);
        }

        event.target.value = "";
    }

    async function alternarGravacaoAudio() {
        if (gravandoAudio) {
            gravadorAudioRef.current?.stop();
            setGravandoAudio(false);
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
            window.alert("A gravação de áudio não é suportada neste navegador.");
            return;
        }

        try {
            const fluxo = await navigator.mediaDevices.getUserMedia({ audio: true });
            const gravador = new MediaRecorder(fluxo);

            fluxoAudioRef.current = fluxo;
            gravadorAudioRef.current = gravador;
            partesAudioRef.current = [];

            gravador.ondataavailable = (evento) => {
                if (evento.data.size > 0) {
                    partesAudioRef.current.push(evento.data);
                }
            };

            gravador.onstop = () => {
                const audio = new Blob(partesAudioRef.current, {
                    type: "audio/webm",
                });

                if (audio.size > 0) {
                    setArquivoSelecionado(
                        new File([audio], `audio-${Date.now()}.webm`, {
                            type: "audio/webm",
                        }),
                    );
                }

                fluxo.getTracks().forEach((trilha) => trilha.stop());
                fluxoAudioRef.current = null;
                gravadorAudioRef.current = null;
                partesAudioRef.current = [];
            };

            gravador.start();
            setGravandoAudio(true);
        } catch (erro) {
            console.error("Erro ao acessar o microfone:", erro);
            window.alert("Não foi possível acessar o microfone.");
        }
    }

    useEffect(() => () => {
        if (gravadorAudioRef.current?.state === "recording") {
            gravadorAudioRef.current.stop();
        }

        fluxoAudioRef.current?.getTracks().forEach((trilha) => trilha.stop());
    }, []);

    function formatarTamanhoArquivo(tamanho: number) {
        if (tamanho < 1024) {
            return `${tamanho} B`;
        }

        if (tamanho < 1024 * 1024) {
            return `${(tamanho / 1024).toFixed(1)} KB`;
        }

        return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
    }

    function obterUrlArquivo(url: string) {
        return url.startsWith("http")
            ? url
            : `${import.meta.env.VITE_API_URL}${url}`;
    }

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
                {usuario && (
                <button
                    type="button"
                    className="header-menu-button"
                    onClick={abrirNovaConversa}
                    aria-label="Nova conversa"
                >
                    <span className="header-menu-icon">
                    <svg
                        width="24"
                        height="24"
                        className="header-menu-svg mensagem"
                        viewBox="0 0 16 16"
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
                )}

                <button
                className="header-menu-button"
                onClick={() => setMenuAberto((aberto) => !aberto)}
                >
                <span className="header-menu-icon">
                    <svg
                    className="header-menu-svg"
                    viewBox="0 0 24 24"
                    height="24"
                    width="24"
                    preserveAspectRatio="xMidYMid meet"
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
                    >
                    <path
                        className="pesquisa-icone-path"
                        d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
                    />
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
                    onChange={(event) => setBuscaConversa(event.target.value)}
                />
                </div>
            </div>
            </div>

            <div className="filtros">
            <div className="filtros-lista">
                <div
                className={`filtro-item filtro-todos ${
                    filtroAtivo === "todos" ? "ativo" : ""
                }`}
                onClick={() => setFiltroAtivo("todos")}
                >
                <div className="filtro-conteudo">
                    <span className="filtro-texto">Todos</span>
                </div>
                </div>

                <div
                className={`filtro-item filtro-nao-lidas ${
                    filtroAtivo === "nao-lidas" ? "ativo" : ""
                }`}
                onClick={() => setFiltroAtivo("nao-lidas")}
                >
                <div className="filtro-conteudo">
                    <span className="filtro-texto">Não lidas</span>
                </div>
                </div>

                <div
                className={`filtro-item filtro-grupos ${
                    filtroAtivo === "grupos" ? "ativo" : ""
                }`}
                onClick={() => setFiltroAtivo("grupos")}
                >
                <div className="filtro-conteudo">
                    <span className="filtro-texto">Grupos</span>
                </div>
                </div>
            </div>
            </div>

            <section className="lista-conversas">
            {conversasFiltradas.map((conversa) => (
                <button
                key={conversa.id}
                type="button"
                onClick={() => void abrirConversa(conversa)}
                className={`conversa-item ${
                    conversaSelecionada?.id === conversa.id ? "contato-ativo" : ""
                }`}
                >
                <div className="conversa-avatar">
                    {nomeDaConversa(conversa).charAt(0).toUpperCase()}
                </div>

                <div className="conversa-dados">
                    <strong>{nomeDaConversa(conversa)}</strong>

                    <span>
                    {conversa.ultimaMensagem?.conteudo ||
                        (conversa.ultimaMensagem?.arquivoNome
                            ? `📎 ${conversa.ultimaMensagem.arquivoNome}`
                            : "Conversa iniciada")}
                    </span>
                </div>
                </button>
            ))}

            {buscaConversa.trim() && conversasFiltradas.length === 0 && (
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
                <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>

                <input
                type="text"
                placeholder={
                    usuario?.tipo === "user"
                    ? "Pesquisar setor"
                    : usuario?.tipo === "admin"
                        ? "Pesquisar contato"
                        : "Pesquisar usuário"
                }
                value={buscaUsuario}
                onChange={(event) => setBuscaUsuario(event.target.value)}
                />
            </div>

            <div className="nova-conversa__titulo-lista">
                {usuario?.tipo === "user"
                ? "SETORES"
                : usuario?.tipo === "admin"
                    ? "CONTATOS"
                    : "USUÁRIOS"}
            </div>

            <div className="nova-conversa__usuarios">
                {carregandoUsuarios && (
                <p className="nova-conversa__mensagem">Carregando...</p>
                )}

                {!carregandoUsuarios &&
                usuario?.tipo === "user" &&
                setoresFiltrados.map((setor) => (
                    <button
                    key={setor.id}
                    type="button"
                    className="nova-conversa__usuario"
                    onClick={() => void selecionarSetor(setor)}
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

                {!carregandoUsuarios &&
                usuario?.tipo !== "user" &&
                usuariosFiltrados.map((usuario) => (
                    <button
                    key={usuario.id}
                    type="button"
                    className="nova-conversa__usuario"
                    onClick={() => void selecionarUsuario(usuario)}
                    >
                    <div className="nova-conversa__avatar">
                        {usuario.nome.charAt(0).toUpperCase()}
                    </div>

                    <div className="nova-conversa__dados">
                        <strong>{usuario.nome}</strong>
                        <span>
                        {usuario.tipoUsuario === "funcionario"
                            ? (usuario.setor?.nome ?? "Funcionário")
                            : usuario.tipoUsuario === "admin"
                            ? "Administrador"
                            : "Usuário Fala Pommer"}
                        </span>
                    </div>
                    </button>
                ))}

                {!carregandoUsuarios &&
                usuario?.tipo === "user" &&
                setoresFiltrados.length === 0 && (
                    <p className="nova-conversa__mensagem">
                    Nenhum setor encontrado.
                    </p>
                )}

                {!carregandoUsuarios &&
                usuario?.tipo !== "user" &&
                usuariosFiltrados.length === 0 && (
                    <p className="nova-conversa__mensagem">
                    Nenhum contato encontrado.
                    </p>
                )}
            </div>
            </div>
        </aside>

        <section className="chat">
            {conversaSelecionada ? (
            <>
                <header className="chat-header">
                <div className="chat-header__usuario">
                    <div className="chat-header__avatar">
                    {nomeDaConversa(conversaSelecionada).charAt(0).toUpperCase()}
                    </div>

                    <div className="chat-header__dados">
                    <strong>{nomeDaConversa(conversaSelecionada)}</strong>

                    <span>{subtituloDaConversa(conversaSelecionada)}</span>
                    </div>
                </div>
                </header>

                <div className="mensagens" data-lenis-prevent>
                    {carregandoMensagens && (
                        <p className="mensagens__status">Carregando mensagens...</p>
                    )}

                    {!carregandoMensagens && mensagensChat.length === 0 && (
                        <p className="mensagens__status">Nenhuma mensagem enviada.</p>
                    )}

                    {!carregandoMensagens &&
                        mensagensChat.map((item) => {
                        const enviadaPorMim = mensagemFoiEnviadaPorMim(item);

                        return (
                            <div
                            key={item.id}
                            className={`mensagem-linha ${
                                enviadaPorMim
                                ? "mensagem-linha--enviada"
                                : "mensagem-linha--recebida"
                            }`}
                            >
                            <article
                                className="mensagem-balao"
                                ref={(el) => {
                                if (el) balõesRef.current.set(item.id, el);
                                else balõesRef.current.delete(item.id);
                                }}
                                style={{
                                transformOrigin: enviadaPorMim
                                    ? "bottom right"
                                    : "bottom left",
                                }}
                            >
                                <strong>{item.remetente.nome}</strong>

                                {item.arquivo?.tipo === "imagem" && (
                                    <a
                                        className="mensagem-anexo mensagem-anexo--imagem"
                                        href={obterUrlArquivo(item.arquivo.url)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <img
                                            src={obterUrlArquivo(item.arquivo.url)}
                                            alt={item.arquivo.nome}
                                        />
                                    </a>
                                )}

                                {item.arquivo?.tipo === "video" && (
                                    <video
                                        className="mensagem-anexo mensagem-anexo--video"
                                        controls
                                        preload="metadata"
                                    >
                                        <source
                                            src={obterUrlArquivo(item.arquivo.url)}
                                            type={item.arquivo.mime}
                                        />
                                    </video>
                                )}

                                {item.arquivo?.tipo === "audio" && (
                                    <audio
                                        className="mensagem-anexo mensagem-anexo--audio"
                                        controls
                                        preload="metadata"
                                        src={obterUrlArquivo(item.arquivo.url)}
                                    />
                                )}

                                {item.arquivo?.tipo === "documento" && (
                                    <a
                                        className="mensagem-anexo mensagem-anexo--documento"
                                        href={obterUrlArquivo(item.arquivo.url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={item.arquivo.nome}
                                    >
                                        <span aria-hidden="true">📄</span>
                                        <span>
                                            <strong>{item.arquivo.nome}</strong>
                                            <small>{formatarTamanhoArquivo(item.arquivo.tamanho)}</small>
                                        </span>
                                    </a>
                                )}

                                {item.conteudo && <p>{item.conteudo}</p>}

                                <time dateTime={item.enviadaEm}>
                                {new Intl.DateTimeFormat("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }).format(new Date(item.enviadaEm))}
                                </time>
                            </article>
                            </div>
                        );
                        })}

                    <div ref={fimMensagensRef} />
                </div>

                {podeEnviarMensagem && (
                <footer className="chat-input">
                    {arquivoSelecionado && (
                    <div className="chat-input__arquivo">
                        <div className="chat-input__arquivo-icone">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                        </svg>
                        </div>

                        <div className="chat-input__arquivo-dados">
                        <strong>{arquivoSelecionado.name}</strong>

                        <span>
                            {formatarTamanhoArquivo(arquivoSelecionado.size)}
                        </span>
                        </div>

                        <button
                        className="chat-input__arquivo-remover"
                        type="button"
                        aria-label="Remover arquivo"
                        onClick={() => setArquivoSelecionado(null)}
                        >
                        ×
                        </button>
                    </div>
                    )}

                    <div className="chat-input__conteudo">
                    <div className="chat-input__acao">
                        <button
                        type="button"
                        aria-label="Anexar arquivo"
                        onClick={() => setMenuAbertoArquivo((aberto) => !aberto)}
                        >
                        <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-paperclip"
                            viewBox="0 0 16 16"
                        >
                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                        </svg>
                        </button>

                        {menuAbertoArquivos && (
                        <div className="menu-arquivos">
                            <nav className="menu-arquivos__lista">
                            <button
                                type="button"
                                className="menu-arquivos__item documentos"
                                onClick={() =>
                                abrirSeletorArquivo(inputDocumentosRef)
                                }
                            >
                                <div className="menu-arquivos__icone">
                                <svg
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-file-earmark-text"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                                </svg>
                                </div>
                                <span className="menu-arquivos__texto">
                                Documentos
                                </span>
                            </button>

                            <button
                                type="button"
                                className="menu-arquivos__item fotos-videos"
                                onClick={() => abrirSeletorArquivo(inputMidiasRef)}
                            >
                                <div className="menu-arquivos__icone">
                                <svg
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-images"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                    <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                                </svg>
                                </div>
                                <span className="menu-arquivos__texto">
                                Fotos e Videos
                                </span>
                            </button>

                            <button
                                type="button"
                                className="menu-arquivos__item audio"
                                onClick={() => abrirSeletorArquivo(inputAudiosRef)}
                            >
                                <div className="menu-arquivos__icone">
                                <svg
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-headphones"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5" />
                                </svg>
                                </div>
                                <span className="menu-arquivos__texto">Áudio</span>
                            </button>
                            </nav>
                        </div>
                        )}

                        <input
                        ref={inputDocumentosRef}
                        className="chat-input__arquivo-oculto"
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
                        onChange={selecionarArquivo}
                        />

                        <input
                        ref={inputMidiasRef}
                        className="chat-input__arquivo-oculto"
                        type="file"
                        accept="image/*,video/*"
                        onChange={selecionarArquivo}
                        />

                        <input
                        ref={inputAudiosRef}
                        className="chat-input__arquivo-oculto"
                        type="file"
                        accept="audio/*"
                        onChange={selecionarArquivo}
                        />
                    </div>

                    <div className="chat-input__acao">
                        <button
                        type="button"
                        aria-label="Adicionar emoji"
                        aria-expanded={seletorEmojiAberto}
                        onClick={() => setSeletorEmojiAberto((aberto) => !aberto)}
                        >
                        <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-emoji-smile"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                            <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5" />
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
                        onChange={(event) => setMensagem(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                            event.preventDefault();
                            void enviarMensagem();
                            }
                        }}
                        />
                    </div>

                    <div className="chat-input__audio">
                        <button
                        type="button"
                        className={gravandoAudio ? "gravando" : undefined}
                        aria-label={gravandoAudio ? "Parar gravação" : "Gravar áudio"}
                        title={gravandoAudio ? "Parar gravação" : "Gravar áudio"}
                        onClick={() => void alternarGravacaoAudio()}
                        disabled={enviandoMensagem}
                        >
                        <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-mic"
                            viewBox="0 0 16 16"
                        >
                            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
                            <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3" />
                        </svg>
                        </button>
                    </div>

                    <div className="chat-input__enviar">
                        <button
                        type="button"
                        aria-label="Enviar mensagem"
                        onClick={() => void enviarMensagem()}
                        disabled={
                            (!mensagem.trim() && !arquivoSelecionado) ||
                            enviandoMensagem
                        }
                        >
                        <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-send-fill"
                            viewBox="0 0 16 16"
                        >
                            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                        </svg>
                        </button>
                    </div>
                    </div>
                </footer>
                )}
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

                <p>Selecione um contato ao lado para iniciar uma conversa.</p>
            </div>
            )}
        </section>

        {menuAberto && (
            <div className="menu-modal">
            {usuario?.tipo === "admin" && (
                <div className="menu-modal-item menu-modal-administracao">
                <a
                    href="/administracao"
                    target="_blank"
                    className="menu-modal-button"
                >
                    <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-cup-hot icones-modal"
                    viewBox="0 0 16 16"
                    >
                    <path
                        className="menu-modal-icone-path"
                        fillRule="evenodd"
                        d="M.5 6a.5.5 0 0 0-.488.608l1.652 7.434A2.5 2.5 0 0 0 4.104 16h5.792a2.5 2.5 0 0 0 2.44-1.958l.131-.59a3 3 0 0 0 1.3-5.854l.221-.99A.5.5 0 0 0 13.5 6zM13 12.5a2 2 0 0 1-.316-.025l.867-3.898A2.001 2.001 0 0 1 13 12.5M2.64 13.825 1.123 7h11.754l-1.517 6.825A1.5 1.5 0 0 1 9.896 15H4.104a1.5 1.5 0 0 1-1.464-1.175"
                    />
                    <path
                        className="menu-modal-icone-path"
                        d="m4.4.8-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 3.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 3.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 3 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 4.4.8m3 0-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.253.382l-.018.025-.005.008-.002.002A.5.5 0 0 1 6.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 6.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 6 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 7.4.8m3 0-.003.004-.014.019a4 4 0 0 0-.204.31 2 2 0 0 0-.141.267c-.026.06-.034.092-.037.103v.004a.6.6 0 0 0 .091.248c.075.133.178.272.308.445l.01.012c.118.158.26.347.37.543.112.2.22.455.22.745 0 .188-.065.368-.119.494a3 3 0 0 1-.202.388 5 5 0 0 1-.252.382l-.019.025-.005.008-.002.002A.5.5 0 0 1 9.6 4.2l.003-.004.014-.019a4 4 0 0 0 .204-.31 2 2 0 0 0 .141-.267c.026-.06.034-.092.037-.103a.6.6 0 0 0-.09-.252A4 4 0 0 0 9.6 2.8l-.01-.012a5 5 0 0 1-.37-.543A1.53 1.53 0 0 1 9 1.5c0-.188.065-.368.119-.494.059-.138.134-.274.202-.388a6 6 0 0 1 .253-.382l.025-.035A.5.5 0 0 1 10.4.8"
                    />
                    </svg>
                    <span className="menu-modal-texto">Administração</span>
                </a>
                </div>
            )}

            <div className="menu-modal-item menu-modal-configuracoes">
                <a href="#" target="_blank" className="menu-modal-button">
                <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-gear icones-modal"
                    viewBox="0 0 16 16"
                >
                    <path
                    className="menu-modal-icone-path"
                    d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
                    />
                    <path
                    className="menu-modal-icone-path"
                    d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"
                    />
                </svg>
                <span className="menu-modal-texto">Configurações</span>
                </a>
            </div>

            <div className="menu-modal-item menu-modal-sair">
                <a onClick={sair} className="menu-modal-button sair">
                <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-box-arrow-left"
                    viewBox="0 0 16 16"
                >
                    <path
                    fillRule="evenodd"
                    d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"
                    />
                    <path
                    fillRule="evenodd"
                    d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"
                    />
                </svg>
                <span className="menu-modal-texto">Sair</span>
                </a>
            </div>
            </div>
        )}
        </main>
    );
}

export default Home;
