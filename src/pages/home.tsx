// Exibe a área principal de conversas do sistema.
import brasao from "../assets/img/brasao.webp";
import somNovaMensagem from "../assets/audio/notificacao.mp3";
import "./css/home.css";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ChangeEvent,
    type RefObject,
} from "react";
import { useNavigate } from "react-router";
import EmojiPicker from "../assets/emojiPicker";
import gsap from "gsap";
import {
    iniciarGravacaoAudio,
    obterMensagemErroGravacaoAudio,
    type GravadorAudioAtivo,
} from "../library/gravadorAudio";

type TipoUsuario = "user" | "admin" | "funcionario" | "superAdmin";
type FiltroConversa = "todos" | "nao-lidas" | "grupos";

const INTERVALO_CONVERSAS_MS = 5_000;
const INTERVALO_MENSAGENS_MS = 3_000;
const INTERVALO_CONSULTA_DIGITACAO_MS = 1_500;
const INTERVALO_RENOVACAO_DIGITACAO_MS = 2_000;
const TEMPO_PARAR_DIGITACAO_MS = 2_500;
const LIMITE_HISTORICO_MENSAGENS = 50;
const LIMITE_NOVAS_MENSAGENS = 100;

interface UsuarioBasico {
    id: number;
    nome: string;
    foto_perfil_url: string | null;
}

interface UsuarioConversa extends UsuarioBasico {
    tipoUsuario: TipoUsuario;
    setor: {
        id: number;
        nome: string;
        sigla: string;
    } | null;
}

interface UsuarioAutenticado {
    sub: number;
    email: string;
    tipo: TipoUsuario;
}

interface UsuarioDigitando {
    id: number;
    nome: string;
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
    mensagensNaoLidas: number;
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
        foto_perfil_url: string | null;
    };
    somenteLeitura: boolean;
    mensagensNaoLidas: number;
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
        tipo: "usuario" | "setor" | "admin" | "superAdmin";
        id: number;
        nome: string;
        tipoUsuario?: TipoUsuario;
        sigla_setor?: string;
    };

    autorReal?: {
        id: number;
        nome: string;
    };

    arquivo?: ArquivoMensagem | null;
}

interface ArquivoMensagem {
    nome: string;
    url: string;
    tipo: "documento" | "imagem" | "video" | "audio";
    mime: string;
    tamanho: number;
}

function mensagemFoiEnviadaPeloUsuario(
    item: MensagemChat,
    usuario: UsuarioAutenticado | null,
    conversa: Conversa | null,
) {
    if (!usuario || !conversa) {
        return false;
    }

    if (conversa.tipo === "privada") {
        const remetenteRealId = item.autorReal?.id ?? item.remetente.id;
        return remetenteRealId === usuario.sub;
    }

    if (usuario.tipo === "admin") {
        const remetenteRealId = item.autorReal?.id ?? item.remetente.id;
        return remetenteRealId === usuario.sub;
    }

    if (usuario.tipo === "superAdmin") {
        const remetenteRealId = item.autorReal?.id ?? item.remetente.id;
        return remetenteRealId === usuario.sub;
    }

    if (usuario.tipo === "user") {
        return item.origem === "usuario" && item.remetente.id === usuario.sub;
    }

    if (usuario.tipo === "funcionario") {
        const remetenteRealId = item.autorReal?.id ?? item.remetente.id;
        return item.origem === "setor" && remetenteRealId === usuario.sub;
    }

    return false;
}

function Home() {
    const [novaConversaAberta, setNovaConversaAberta] = useState(false);

    const [usuarios, setUsuarios] = useState<UsuarioConversa[]>([]);

    const [setores, setSetores] = useState<Setor[]>([]);

    const [conversaSelecionada, setConversaSelecionada] =
        useState<Conversa | null>(null);

    const [chatMobileAberto, setChatMobileAberto] = useState(false);

    const [mensagensChat, setMensagensChat] = useState<MensagemChat[]>([]);
    const [usuariosDigitando, setUsuariosDigitando] =
        useState<UsuarioDigitando[]>([]);

    const [carregandoMensagens, setCarregandoMensagens] = useState(false);
    const [carregandoMensagensAnteriores, setCarregandoMensagensAnteriores] =
        useState(false);
    const [temMensagensAnteriores, setTemMensagensAnteriores] =
        useState(false);

    const [enviandoMensagem, setEnviandoMensagem] = useState(false);

    const mensagensContainerRef = useRef<HTMLDivElement>(null);
    const rolagemInicialPendenteRef = useRef(false);
    const alturaAntesDoHistoricoRef = useRef<number | null>(null);
    const balõesRef = useRef<Map<number, HTMLElement>>(new Map());
    const idsAnimadosRef = useRef<Set<number>>(new Set());
    const conversaAbertaIdRef = useRef<number | null>(null);
    const ultimaMensagemChatIdRef = useRef(0);
    const historicoChatCarregadoRef = useRef(false);
    const somNotificacaoRef = useRef<HTMLAudioElement | null>(null);
    const audioNotificacaoLiberadoRef = useRef(false);
    const conversasSincronizadasRef = useRef(false);
    const estadoConversasRef = useRef(
        new Map<number, {
            ultimaMensagemId: number | null;
            mensagensNaoLidas: number;
        }>(),
    );
    const indicadorDigitandoRef = useRef<HTMLDivElement>(null);
    const conversaDigitandoIdRef = useRef<number | null>(null);
    const digitacaoAtivaRef = useRef(false);
    const intervaloDigitacaoRef = useRef<number | null>(null);
    const timeoutDigitacaoRef = useRef<number | null>(null);

    const [buscaUsuario, setBuscaUsuario] = useState("");

    const [buscaConversa, setBuscaConversa] = useState("");

    const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);

    const [filtroAtivo, setFiltroAtivo] =
        useState<FiltroConversa>("todos");

    const [menuAberto, setMenuAberto] = useState(false);

    const [menuAbertoArquivos, setMenuAbertoArquivo] = useState(false);

    const [conversas, setConversas] = useState<Conversa[]>([]);

    const [mensagem, setMensagem] = useState("");

    const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
        null,
    );

    const [arquivoEmVisualizacao, setArquivoEmVisualizacao] =
        useState<ArquivoMensagem | null>(null);
    const botaoFecharVisualizadorRef = useRef<HTMLButtonElement>(null);

    const [seletorEmojiAberto, setSeletorEmojiAberto] = useState(false);

    const inputDocumentosRef = useRef<HTMLInputElement>(null);

    const inputMidiasRef = useRef<HTMLInputElement>(null);

    const inputAudiosRef = useRef<HTMLInputElement>(null);
    const gravadorAudioRef = useRef<GravadorAudioAtivo | null>(null);
    const processandoGravacaoAudioRef = useRef(false);
    const cicloGravacaoAudioRef = useRef(0);
    const [gravandoAudio, setGravandoAudio] = useState(false);
    const [processandoGravacaoAudio, setProcessandoGravacaoAudio] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!arquivoEmVisualizacao) {
            return;
        }

        const overflowAnterior = document.body.style.overflow;
        const elementoComFocoAnterior = document.activeElement;
        document.body.style.overflow = "hidden";
        botaoFecharVisualizadorRef.current?.focus();

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                setArquivoEmVisualizacao(null);
            }
        }

        window.addEventListener("keydown", fecharComEscape);

        return () => {
            document.body.style.overflow = overflowAnterior;
            window.removeEventListener("keydown", fecharComEscape);

            if (elementoComFocoAnterior instanceof HTMLElement) {
                elementoComFocoAnterior.focus();
            }
        };
    }, [arquivoEmVisualizacao]);

    useEffect(() => {
        const audio = new Audio(somNovaMensagem);
        let liberando = false;

        audio.preload = "auto";
        audio.volume = 0.7;
        somNotificacaoRef.current = audio;

        function removerEventosDeLiberacao() {
            window.removeEventListener("pointerdown", liberarAudio);
            window.removeEventListener("keydown", liberarAudio);
        }

        async function liberarAudio() {
            if (audioNotificacaoLiberadoRef.current || liberando) {
                return;
            }

            liberando = true;

            try {
                audio.muted = true;
                await audio.play();
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
                audioNotificacaoLiberadoRef.current = true;
                removerEventosDeLiberacao();
            } catch {
                audio.muted = false;
            } finally {
                liberando = false;
            }
        }

        window.addEventListener("pointerdown", liberarAudio);
        window.addEventListener("keydown", liberarAudio);

        return () => {
            removerEventosDeLiberacao();
            audio.pause();
            somNotificacaoRef.current = null;
            audioNotificacaoLiberadoRef.current = false;
        };
    }, []);

    useEffect(() => {
        function encerrarDigitacaoAoOcultar() {
            if (document.visibilityState !== "hidden") {
                return;
            }

            const conversaId = conversaDigitandoIdRef.current;
            const estavaDigitando = digitacaoAtivaRef.current;

            if (intervaloDigitacaoRef.current !== null) {
                window.clearInterval(intervaloDigitacaoRef.current);
                intervaloDigitacaoRef.current = null;
            }

            if (timeoutDigitacaoRef.current !== null) {
                window.clearTimeout(timeoutDigitacaoRef.current);
                timeoutDigitacaoRef.current = null;
            }

            conversaDigitandoIdRef.current = null;
            digitacaoAtivaRef.current = false;

            if (conversaId !== null && estavaDigitando) {
                const token = localStorage.getItem("access_token");

                if (token) {
                    void fetch(
                        `${import.meta.env.VITE_API_URL}/conversas/${conversaId}/digitando`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ digitando: false }),
                            keepalive: true,
                        },
                    ).catch(() => undefined);
                }
            }
        }

        document.addEventListener(
            "visibilitychange",
            encerrarDigitacaoAoOcultar,
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                encerrarDigitacaoAoOcultar,
            );

            if (intervaloDigitacaoRef.current !== null) {
                window.clearInterval(intervaloDigitacaoRef.current);
            }

            if (timeoutDigitacaoRef.current !== null) {
                window.clearTimeout(timeoutDigitacaoRef.current);
            }
        };
    }, []);

    function tocarSomDeNovaMensagem() {
        const audio = somNotificacaoRef.current;

        if (!audio) {
            return;
        }

        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;

        void audio.play()
            .then(() => {
                audioNotificacaoLiberadoRef.current = true;
            })
            .catch(() => {
                // O navegador ou WebView ainda aguarda interação do usuário.
            });
    }

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

    const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

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
        if (!usuario) {
            return;
        }

        const usuarioAtual = usuario;

        let ativo = true;
        let buscando = false;

        async function buscarConversas() {
            if (buscando || document.visibilityState === "hidden") {
                return;
            }

            const token = localStorage.getItem("access_token");

            if (!token) {
                return;
            }

            buscando = true;

            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [respostaPrivadas, respostaSetores] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/conversas`, { headers }),
                    usuarioAtual.tipo === "admin" || usuarioAtual.tipo === "superAdmin"
                        ? Promise.resolve(null)
                        : fetch(`${import.meta.env.VITE_API_URL}/conversas/setor`, { headers }),
                ]);

                if (!respostaPrivadas.ok || (respostaSetores && !respostaSetores.ok)) {
                    throw new Error("Não foi possível carregar as conversas.");
                }

                const [conversasPrivadas, conversasSetores] = await Promise.all([
                    respostaPrivadas.json() as Promise<ConversaPrivada[]>,
                    respostaSetores
                        ? respostaSetores.json() as Promise<ConversaSetor[]>
                        : Promise.resolve([] as ConversaSetor[]),
                ]);

                const conversaAbertaId = conversaAbertaIdRef.current;
                const todasConversas: Conversa[] = [
                    ...conversasPrivadas,
                    ...conversasSetores,
                ].map((conversa) =>
                    conversa.id === conversaAbertaId
                        ? { ...conversa, mensagensNaoLidas: 0 }
                        : conversa,
                ).sort((conversaA, conversaB) => {
                const dataA = new Date(
                    conversaA.ultimaMensagem?.enviadaEm ?? conversaA.criadaEm,
                ).getTime();

                const dataB = new Date(
                    conversaB.ultimaMensagem?.enviadaEm ?? conversaB.criadaEm,
                ).getTime();

                return dataB - dataA;
                });

                if (ativo) {
                    const deveTocarNotificacao =
                        conversasSincronizadasRef.current &&
                        todasConversas.some((conversa) => {
                            if (conversa.id === conversaAbertaId) {
                                return false;
                            }

                            const estadoAnterior =
                                estadoConversasRef.current.get(conversa.id);

                            if (!estadoAnterior) {
                                return conversa.mensagensNaoLidas > 0;
                            }

                            return (
                                conversa.mensagensNaoLidas >
                                    estadoAnterior.mensagensNaoLidas &&
                                conversa.ultimaMensagem?.id !==
                                    estadoAnterior.ultimaMensagemId
                            );
                        });

                    estadoConversasRef.current = new Map(
                        todasConversas.map((conversa) => [
                            conversa.id,
                            {
                                ultimaMensagemId:
                                    conversa.ultimaMensagem?.id ?? null,
                                mensagensNaoLidas:
                                    conversa.mensagensNaoLidas,
                            },
                        ]),
                    );
                    conversasSincronizadasRef.current = true;
                    setConversas(todasConversas);

                    if (deveTocarNotificacao) {
                        tocarSomDeNovaMensagem();
                    }
                }
            } catch (erro) {
                console.error("Erro ao carregar conversas:", erro);
            } finally {
                buscando = false;
            }
        }

        function atualizarAoVoltarParaPagina() {
            if (document.visibilityState === "visible") {
                void buscarConversas();
            }
        }

        void buscarConversas();

        const intervalo = window.setInterval(
            () => void buscarConversas(),
            INTERVALO_CONVERSAS_MS,
        );

        document.addEventListener(
            "visibilitychange",
            atualizarAoVoltarParaPagina,
        );

        return () => {
            ativo = false;
            window.clearInterval(intervalo);
            document.removeEventListener(
                "visibilitychange",
                atualizarAoVoltarParaPagina,
            );
        };
    }, [usuario]);

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
            const rota =
                usuario.tipo === "user"
                    ? "/setores/com-funcionarios"
                    : "/usuarios/conversas";

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
                ["admin", "superAdmin"].includes(usuario.tipo) ? "/conversas" : "/conversas/setor/usuario";

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

    async function enviarStatusDigitacao(
        conversaId: number,
        digitando: boolean,
    ) {
        const token = localStorage.getItem("access_token");

        if (!token) {
            return;
        }

        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/${conversaId}/digitando`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ digitando }),
                },
            );
        } catch (erro) {
            console.error("Erro ao atualizar status de digitação:", erro);
        }
    }

    function limparTemporizadoresDigitacao() {
        if (intervaloDigitacaoRef.current !== null) {
            window.clearInterval(intervaloDigitacaoRef.current);
            intervaloDigitacaoRef.current = null;
        }

        if (timeoutDigitacaoRef.current !== null) {
            window.clearTimeout(timeoutDigitacaoRef.current);
            timeoutDigitacaoRef.current = null;
        }
    }

    function pararDeInformarDigitacao() {
        const conversaId = conversaDigitandoIdRef.current;
        const estavaDigitando = digitacaoAtivaRef.current;

        limparTemporizadoresDigitacao();
        conversaDigitandoIdRef.current = null;
        digitacaoAtivaRef.current = false;

        if (conversaId !== null && estavaDigitando) {
            void enviarStatusDigitacao(conversaId, false);
        }
    }

    function informarDigitacao(conteudo: string) {
        const conversaId = conversaSelecionada?.id;

        if (!conversaId || !conteudo) {
            pararDeInformarDigitacao();
            return;
        }

        if (
            conversaDigitandoIdRef.current !== null &&
            conversaDigitandoIdRef.current !== conversaId
        ) {
            pararDeInformarDigitacao();
        }

        conversaDigitandoIdRef.current = conversaId;

        if (!digitacaoAtivaRef.current) {
            digitacaoAtivaRef.current = true;
            void enviarStatusDigitacao(conversaId, true);

            intervaloDigitacaoRef.current = window.setInterval(
                () => void enviarStatusDigitacao(conversaId, true),
                INTERVALO_RENOVACAO_DIGITACAO_MS,
            );
        }

        if (timeoutDigitacaoRef.current !== null) {
            window.clearTimeout(timeoutDigitacaoRef.current);
        }

        timeoutDigitacaoRef.current = window.setTimeout(
            pararDeInformarDigitacao,
            TEMPO_PARAR_DIGITACAO_MS,
        );
    }

    function atualizarConversaComMensagem(novaMensagem: MensagemChat) {
        setConversas((conversasAtuais) =>
            conversasAtuais.reduce<Conversa[]>((resultado, conversa) => {
                if (conversa.id !== novaMensagem.conversaId) {
                    resultado.push(conversa);
                    return resultado;
                }

                const conversaAtualizada: Conversa = {
                    ...conversa,
                    mensagensNaoLidas: 0,
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

        pararDeInformarDigitacao();

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

            ultimaMensagemChatIdRef.current = Math.max(
                ultimaMensagemChatIdRef.current,
                novaMensagem.id,
            );
            setMensagensChat((mensagensAtuais) =>
                mensagensAtuais.some((item) => item.id === novaMensagem.id)
                    ? mensagensAtuais
                    : [...mensagensAtuais, novaMensagem],
            );
            atualizarConversaComMensagem(novaMensagem);

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
        const conversaNormalizada: Conversa = {
            ...conversa,
            mensagensNaoLidas: conversa.mensagensNaoLidas ?? 0,
        };

        setConversas((conversasAtuais) => {
            const jaExiste = conversasAtuais.some(
                (item) => item.id === conversaNormalizada.id,
            );

            return jaExiste
                ? conversasAtuais.map((item) =>
                    item.id === conversaNormalizada.id
                        ? conversaNormalizada
                        : item,
                )
                : [conversaNormalizada, ...conversasAtuais];
        });

        setNovaConversaAberta(false);
        void abrirConversa(conversaNormalizada);
    }

    async function marcarConversaComoLida(
        conversaId: number,
        token: string,
    ) {
        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/${conversaId}/leitura`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível marcar a conversa como lida.");
            }

            const leitura = await resposta.json() as {
                ultimaMensagemLidaId: number | null;
            };

            estadoConversasRef.current.set(conversaId, {
                ultimaMensagemId: leitura.ultimaMensagemLidaId,
                mensagensNaoLidas: 0,
            });

            setConversas((conversasAtuais) =>
                conversasAtuais.map((item) =>
                    item.id === conversaId
                        ? { ...item, mensagensNaoLidas: 0 }
                        : item,
                ),
            );

            setConversaSelecionada((conversaAtual) =>
                conversaAtual?.id === conversaId &&
                conversaAtual.mensagensNaoLidas !== 0
                    ? { ...conversaAtual, mensagensNaoLidas: 0 }
                    : conversaAtual,
            );
        } catch (erro) {
            console.error("Erro ao marcar conversa como lida:", erro);
        }
    }

    async function abrirConversa(conversa: Conversa) {
        pararDeInformarDigitacao();
        cancelarGravacaoAudio();
        conversaAbertaIdRef.current = conversa.id;
        ultimaMensagemChatIdRef.current = 0;
        historicoChatCarregadoRef.current = false;
        rolagemInicialPendenteRef.current = true;
        alturaAntesDoHistoricoRef.current = null;
        setConversaSelecionada(conversa);
        setUsuariosDigitando([]);
        setChatMobileAberto(true);
        setMensagensChat([]);
        setCarregandoMensagens(true);
        setCarregandoMensagensAnteriores(false);
        setTemMensagensAnteriores(false);

        const token = localStorage.getItem("access_token");

        if (!token) {
            setCarregandoMensagens(false);
            return;
        }

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/${conversa.id}/mensagens?limite=${LIMITE_HISTORICO_MENSAGENS}`,
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

            if (conversaAbertaIdRef.current !== conversa.id) {
                return;
            }

            ultimaMensagemChatIdRef.current = Math.max(
                0,
                ...dados.map((item) => item.id),
            );
            historicoChatCarregadoRef.current = true;
            setMensagensChat(dados);
            setTemMensagensAnteriores(
                dados.length === LIMITE_HISTORICO_MENSAGENS,
            );
            await marcarConversaComoLida(conversa.id, token);
        } catch (erro) {
            console.error(erro);

            if (conversaAbertaIdRef.current === conversa.id) {
                setMensagensChat([]);
                setTemMensagensAnteriores(false);
            }
        } finally {
            if (conversaAbertaIdRef.current === conversa.id) {
                setCarregandoMensagens(false);
            }
        }
    }

    async function carregarMensagensAnteriores() {
        const conversaId = conversaSelecionada?.id;
        const primeiraMensagemId = mensagensChat[0]?.id;
        const token = localStorage.getItem("access_token");

        if (
            !conversaId ||
            !primeiraMensagemId ||
            !token ||
            carregandoMensagensAnteriores
        ) {
            return;
        }

        setCarregandoMensagensAnteriores(true);

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/conversas/${conversaId}/mensagens?antesDe=${primeiraMensagemId}&limite=${LIMITE_HISTORICO_MENSAGENS}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar as mensagens anteriores.");
            }

            const dados = await resposta.json() as MensagemChat[];

            if (conversaAbertaIdRef.current !== conversaId) {
                return;
            }

            dados.forEach((item) => idsAnimadosRef.current.add(item.id));
            alturaAntesDoHistoricoRef.current =
                mensagensContainerRef.current?.scrollHeight ?? null;

            setMensagensChat((mensagensAtuais) => {
                const idsAtuais = new Set(
                    mensagensAtuais.map((item) => item.id),
                );
                const mensagensAnteriores = dados.filter(
                    (item) => !idsAtuais.has(item.id),
                );

                return [...mensagensAnteriores, ...mensagensAtuais];
            });
            setTemMensagensAnteriores(
                dados.length === LIMITE_HISTORICO_MENSAGENS,
            );
        } catch (erro) {
            console.error(erro);
        } finally {
            if (conversaAbertaIdRef.current === conversaId) {
                setCarregandoMensagensAnteriores(false);
            }
        }
    }

    function fecharChatMobile() {
        pararDeInformarDigitacao();
        conversaAbertaIdRef.current = null;
        ultimaMensagemChatIdRef.current = 0;
        historicoChatCarregadoRef.current = false;
        alturaAntesDoHistoricoRef.current = null;
        setChatMobileAberto(false);
        setUsuariosDigitando([]);
        setCarregandoMensagensAnteriores(false);
        setTemMensagensAnteriores(false);
    }

    function nomeDaConversa(conversa: Conversa) {
        if (conversa.tipo === "privada") {
            return conversa.contato.nome;
        }

        return usuario?.tipo === "user"
        ? conversa.setor.nome
        : conversa.usuario.nome;
    }

    function fotoDaConversa(conversa: Conversa) {
        if (conversa.tipo === "privada") {
            return conversa.contato.foto_perfil_url;
        }

        return usuario?.tipo === "user"
            ? null
            : conversa.usuario.foto_perfil_url;
    }

    function subtituloDaConversa(conversa: Conversa) {
        if (conversa.tipo === "setor") {
            return usuario?.tipo === "user"
                ? conversa.setor.sigla
                : conversa.setor.nome;
        }

        if (conversa.somenteLeitura) {
            return "Visualização de segurança • somente leitura";
        }

        if (conversa.contato.tipo_usuario === "funcionario") {
            return "Conversa privada com funcionário";
        }

        if (conversa.contato.tipo_usuario === "admin") {
            return "Conversa privada com administrador";
        }

        if (conversa.contato.tipo_usuario === "superAdmin") {
            return "Conversa privada com super administrador";
        }

        return "Conversa privada";
    }

    const conversasFiltradas = conversas.filter((conversa) => {
        const correspondeAoFiltro =
            filtroAtivo === "nao-lidas"
                ? conversa.mensagensNaoLidas > 0
                : filtroAtivo !== "grupos";

        if (!correspondeAoFiltro) {
            return false;
        }

        const texto =
        conversa.tipo === "privada"
            ? `${conversa.contato.nome} ${conversa.contato.tipo_usuario}`
            : `${conversa.setor.nome} ${conversa.setor.sigla} ${conversa.usuario.nome}`;

        return texto.toLowerCase().includes(buscaConversa.trim().toLowerCase());
    });

    const podeEnviarMensagem =
        conversaSelecionada !== null &&
        !(
            conversaSelecionada.tipo === "privada" &&
            conversaSelecionada.somenteLeitura
        );

    const setoresFiltrados = setores.filter((setor) => {
        const busca = buscaUsuario.trim().toLowerCase();

        return (
            setor.setor.toLowerCase().includes(busca) ||
            setor.sigla_setor.toLowerCase().includes(busca)
        );
    });

    useEffect(() => {
        const conversaId = conversaSelecionada?.id;

        if (!conversaId || !chatMobileAberto) {
            setUsuariosDigitando([]);
            return;
        }

        let ativo = true;
        let buscando = false;

        async function buscarUsuariosDigitando() {
            if (buscando || document.visibilityState === "hidden") {
                return;
            }

            const token = localStorage.getItem("access_token");

            if (!token) {
                return;
            }

            buscando = true;

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/conversas/${conversaId}/digitando`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!resposta.ok) {
                    return;
                }

                const dados = await resposta.json() as {
                    usuarios: UsuarioDigitando[];
                };

                if (ativo) {
                    setUsuariosDigitando((usuariosAtuais) => {
                        const naoMudou =
                            usuariosAtuais.length === dados.usuarios.length &&
                            usuariosAtuais.every((item, indice) =>
                                item.id === dados.usuarios[indice]?.id &&
                                item.nome === dados.usuarios[indice]?.nome,
                            );

                        return naoMudou
                            ? usuariosAtuais
                            : dados.usuarios;
                    });
                }
            } catch (erro) {
                console.error("Erro ao consultar digitação:", erro);
            } finally {
                buscando = false;
            }
        }

        void buscarUsuariosDigitando();

        const intervalo = window.setInterval(
            () => void buscarUsuariosDigitando(),
            INTERVALO_CONSULTA_DIGITACAO_MS,
        );

        return () => {
            ativo = false;
            window.clearInterval(intervalo);
        };
    }, [chatMobileAberto, conversaSelecionada?.id]);

    useLayoutEffect(() => {
        const indicador = indicadorDigitandoRef.current;

        if (!indicador || usuariosDigitando.length === 0) {
            return;
        }

        const pontos = indicador.querySelectorAll(".digitando-ponto");

        // ANIMAÇÃO GSAP DO BALÃO "DIGITANDO"
        // Altere scale, y, duration, stagger e ease aqui para personalizar.
        const contextoGsap = gsap.context(() => {
            gsap.fromTo(
                indicador,
                { opacity: 0, scale: 0.85, y: 6 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.28,
                    ease: "back.out(1.8)",
                },
            );

            gsap.fromTo(
                pontos,
                { y: 0, opacity: 0.35 },
                {
                    y: -3,
                    opacity: 1,
                    duration: 0.45,
                    stagger: 0.14,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                },
            );
        }, indicador);

        return () => contextoGsap.revert();
    }, [usuariosDigitando]);

    useEffect(() => {
        const conversaId = conversaSelecionada?.id;

        if (!conversaId || !chatMobileAberto) {
            return;
        }

        let ativo = true;
        let buscando = false;

        async function buscarNovasMensagens() {
            if (
                buscando ||
                document.visibilityState === "hidden" ||
                !historicoChatCarregadoRef.current
            ) {
                return;
            }

            const token = localStorage.getItem("access_token");

            if (!token) {
                return;
            }

            buscando = true;

            try {
                const ultimaMensagemId =
                    ultimaMensagemChatIdRef.current;
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/conversas/${conversaId}/mensagens?depoisDe=${ultimaMensagemId}&limite=${LIMITE_NOVAS_MENSAGENS}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível atualizar as mensagens.");
                }

                const dados = await resposta.json() as MensagemChat[];

                if (
                    !ativo ||
                    conversaAbertaIdRef.current !== conversaId
                ) {
                    return;
                }

                const mensagensNovas = dados.filter(
                    (item) => item.id > ultimaMensagemChatIdRef.current,
                );

                if (mensagensNovas.length === 0) {
                    return;
                }

                const recebeuMensagemDeOutraPessoa =
                    mensagensNovas.some(
                        (item) => !mensagemFoiEnviadaPeloUsuario(
                            item,
                            usuario,
                            conversaSelecionada,
                        ),
                    );

                ultimaMensagemChatIdRef.current = Math.max(
                    ultimaMensagemChatIdRef.current,
                    ...mensagensNovas.map((item) => item.id),
                );

                setMensagensChat((mensagensAtuais) => {
                    const idsAtuais = new Set(
                        mensagensAtuais.map((item) => item.id),
                    );

                    return [
                        ...mensagensAtuais,
                        ...mensagensNovas.filter(
                            (item) => !idsAtuais.has(item.id),
                        ),
                    ];
                });

                const ultimaMensagem = mensagensNovas.at(-1);

                if (ultimaMensagem) {
                    atualizarConversaComMensagem(ultimaMensagem);
                }

                if (recebeuMensagemDeOutraPessoa) {
                    tocarSomDeNovaMensagem();
                }

                await marcarConversaComoLida(conversaId, token);
            } catch (erro) {
                console.error("Erro ao atualizar mensagens:", erro);
            } finally {
                buscando = false;
            }
        }

        function atualizarAoVoltarParaPagina() {
            if (document.visibilityState === "visible") {
                void buscarNovasMensagens();
            }
        }

        const intervalo = window.setInterval(
            () => void buscarNovasMensagens(),
            INTERVALO_MENSAGENS_MS,
        );

        document.addEventListener(
            "visibilitychange",
            atualizarAoVoltarParaPagina,
        );

        return () => {
            ativo = false;
            window.clearInterval(intervalo);
            document.removeEventListener(
                "visibilitychange",
                atualizarAoVoltarParaPagina,
            );
        };
    }, [chatMobileAberto, conversaSelecionada, usuario]);

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
                    stagger: {
                        each: 0.08,
                        from: "end",
                    },
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

    useLayoutEffect(() => {
        const container = mensagensContainerRef.current;

        if (!container || carregandoMensagens) {
            return;
        }

        if (alturaAntesDoHistoricoRef.current !== null) {
            const alturaAnterior = alturaAntesDoHistoricoRef.current;
            alturaAntesDoHistoricoRef.current = null;
            container.scrollTop +=
                container.scrollHeight - alturaAnterior;
            return;
        }

        if (rolagemInicialPendenteRef.current) {
            rolagemInicialPendenteRef.current = false;

            const rolarParaOFim = () => {
                container.scrollTop = container.scrollHeight;
            };

            rolarParaOFim();
            const quadro = window.requestAnimationFrame(rolarParaOFim);
            const esperaMidia = window.setTimeout(rolarParaOFim, 150);

            return () => {
                window.cancelAnimationFrame(quadro);
                window.clearTimeout(esperaMidia);
            };
        }

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
        });
    }, [mensagensChat, carregandoMensagens, usuariosDigitando.length]);

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
        const gravadorAtivo = gravadorAudioRef.current;

        if (gravadorAtivo) {
            const cicloAtual = cicloGravacaoAudioRef.current;
            gravadorAudioRef.current = null;
            processandoGravacaoAudioRef.current = true;
            setProcessandoGravacaoAudio(true);

            try {
                const arquivo = await gravadorAtivo.parar();

                if (cicloAtual !== cicloGravacaoAudioRef.current) {
                    return;
                }

                if (arquivo.size > 25 * 1024 * 1024) {
                    window.alert("A gravação deve ter no máximo 25 MB.");
                    return;
                }

                setArquivoSelecionado(arquivo);
            } catch (erro) {
                if (cicloAtual === cicloGravacaoAudioRef.current) {
                    console.error("Erro ao finalizar a gravação:", erro);
                    window.alert(obterMensagemErroGravacaoAudio(erro));
                }
            } finally {
                if (cicloAtual === cicloGravacaoAudioRef.current) {
                    processandoGravacaoAudioRef.current = false;
                    setProcessandoGravacaoAudio(false);
                    setGravandoAudio(false);
                }
            }

            return;
        }

        if (processandoGravacaoAudioRef.current) {
            return;
        }

        const cicloAtual = ++cicloGravacaoAudioRef.current;
        processandoGravacaoAudioRef.current = true;
        setProcessandoGravacaoAudio(true);

        try {
            const gravador = await iniciarGravacaoAudio();

            if (cicloAtual !== cicloGravacaoAudioRef.current) {
                gravador.cancelar();
                return;
            }

            gravadorAudioRef.current = gravador;
            setGravandoAudio(true);
        } catch (erro) {
            if (cicloAtual === cicloGravacaoAudioRef.current) {
                console.error("Erro ao acessar o microfone:", erro);
                window.alert(obterMensagemErroGravacaoAudio(erro));
            }
        } finally {
            if (cicloAtual === cicloGravacaoAudioRef.current) {
                processandoGravacaoAudioRef.current = false;
                setProcessandoGravacaoAudio(false);
            }
        }
    }

    function cancelarGravacaoAudio() {
        cicloGravacaoAudioRef.current += 1;
        gravadorAudioRef.current?.cancelar();
        gravadorAudioRef.current = null;
        processandoGravacaoAudioRef.current = false;
        setProcessandoGravacaoAudio(false);
        setGravandoAudio(false);
    }

    useEffect(() => () => {
        cicloGravacaoAudioRef.current += 1;
        gravadorAudioRef.current?.cancelar();
        gravadorAudioRef.current = null;
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

    function renderizarAvatar(
        nome: string,
        fotoUrl?: string | null
    ) {
        return (
            <>
                <span aria-hidden="true">
                    {nome.charAt(0).toUpperCase()}
                </span>
                {fotoUrl && (
                    <img
                        src={obterUrlArquivo(fotoUrl)}
                        alt=""
                        onError={(evento) => evento.currentTarget.remove()}
                    />
                )}
            </>
        );
    }

    return (
        <main className={`home ${chatMobileAberto ? "home--chat-mobile-aberto" : ""}`}>
        <aside className="conversas" data-lenis-prevent>
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
                <button
                type="button"
                className={`filtro-item filtro-todos ${
                    filtroAtivo === "todos" ? "ativo" : ""
                }`}
                onClick={() => setFiltroAtivo("todos")}
                aria-pressed={filtroAtivo === "todos"}
                >
                <div className="filtro-conteudo">
                    <span className="filtro-texto">Todos</span>
                </div>
                </button>

                <button
                type="button"
                className={`filtro-item filtro-nao-lidas ${
                    filtroAtivo === "nao-lidas" ? "ativo" : ""
                }`}
                onClick={() => setFiltroAtivo("nao-lidas")}
                aria-pressed={filtroAtivo === "nao-lidas"}
                >
                <div className="filtro-conteudo">
                    <span className="filtro-texto">Não lidas</span>
                </div>
                </button>

                <button
                type="button"
                className={`filtro-item filtro-grupos ${
                    filtroAtivo === "grupos" ? "ativo" : ""
                }`}
                onClick={() => setFiltroAtivo("grupos")}
                aria-pressed={filtroAtivo === "grupos"}
                >
                <div className="filtro-conteudo">
                    <span className="filtro-texto">Grupos</span>
                </div>
                </button>
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
                } ${
                    conversa.mensagensNaoLidas > 0
                        ? "conversa-item--nao-lida"
                        : ""
                }`}
                >
                <div className="conversa-avatar">
                    {renderizarAvatar(
                        nomeDaConversa(conversa),
                        fotoDaConversa(conversa)
                    )}
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

                {conversa.mensagensNaoLidas > 0 && (
                    <span
                    className="conversa-nao-lidas"
                    aria-label={`${conversa.mensagensNaoLidas} ${
                        conversa.mensagensNaoLidas === 1
                            ? "mensagem não lida"
                            : "mensagens não lidas"
                    }`}
                    >
                    {conversa.mensagensNaoLidas > 99
                        ? "99+"
                        : conversa.mensagensNaoLidas}
                    </span>
                )}
                </button>
            ))}

            {conversasFiltradas.length === 0 && (
                <p className="lista-conversas__vazia">
                {filtroAtivo === "nao-lidas"
                    ? "Nenhuma conversa não lida."
                    : filtroAtivo === "grupos"
                        ? "Nenhum grupo disponível."
                        : buscaConversa.trim()
                            ? "Nenhuma conversa encontrada."
                            : "Nenhuma conversa disponível."}
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
                    : (usuario?.tipo === "admin" || usuario?.tipo === "superAdmin")
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
                : (usuario?.tipo === "admin" || usuario?.tipo === "superAdmin")
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
                        {renderizarAvatar(
                            usuario.nome,
                            usuario.foto_perfil_url
                        )}
                    </div>

                    <div className="nova-conversa__dados">
                        <strong>{usuario.nome}</strong>
                        <span>
                        {usuario.tipoUsuario === "funcionario"
                            ? (usuario.setor?.nome ?? "Funcionário")
                            : usuario.tipoUsuario === "admin"
                            ? "Administrador"
                            : usuario.tipoUsuario === "superAdmin"
                            ? "Super Administrador" 
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
                    <button
                    type="button"
                    className="chat-header__voltar"
                    aria-label="Voltar para as conversas"
                    onClick={fecharChatMobile}
                    >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                    </button>

                    <div className="chat-header__avatar">
                    {renderizarAvatar(
                        nomeDaConversa(conversaSelecionada),
                        fotoDaConversa(conversaSelecionada)
                    )}
                    </div>

                    <div className="chat-header__dados">
                    <strong>{nomeDaConversa(conversaSelecionada)}</strong>

                    <span>{subtituloDaConversa(conversaSelecionada)}</span>
                    </div>
                </div>
                </header>

                <div
                    ref={mensagensContainerRef}
                    className="mensagens"
                    data-lenis-prevent
                >
                    {carregandoMensagens && (
                        <p className="mensagens__status">Carregando mensagens...</p>
                    )}

                    {!carregandoMensagens &&
                        mensagensChat.length > 0 &&
                        temMensagensAnteriores && (
                            <button
                                type="button"
                                className="mensagens__carregar-anteriores"
                                onClick={carregarMensagensAnteriores}
                                disabled={carregandoMensagensAnteriores}
                            >
                                {carregandoMensagensAnteriores
                                    ? "Carregando..."
                                    : "Carregar mensagens anteriores"}
                            </button>
                        )}

                    {!carregandoMensagens &&
                    mensagensChat.length === 0 &&
                    usuariosDigitando.length === 0 && (
                        <p className="mensagens__status">Nenhuma mensagem enviada.</p>
                    )}

                    {!carregandoMensagens &&
                        mensagensChat.map((item) => {
                        const enviadaPorMim = mensagemFoiEnviadaPeloUsuario(
                            item,
                            usuario,
                            conversaSelecionada,
                        );

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
                                <header className="mensagem-balao__cabecalho">
                                    <strong>{item.remetente.nome}</strong>

                                    {item.remetente.tipo === "setor" && (
                                        <span className="mensagem-balao__perfil">
                                            {item.remetente.sigla_setor}
                                        </span>
                                    )}

                                    {item.remetente.tipo === "admin" && (
                                        <span className="mensagem-balao__perfil">
                                            Administrador
                                        </span>
                                    )}

                                    {item.remetente.tipo === "superAdmin" && (
                                        <span className="mensagem-balao__perfil">
                                            Super admin
                                        </span>
                                    )}
                                </header>

                                {item.arquivo?.tipo === "imagem" && (
                                    <button
                                        type="button"
                                        className="mensagem-anexo mensagem-anexo--imagem"
                                        onClick={() => setArquivoEmVisualizacao(item.arquivo!)}
                                        aria-label={`Visualizar ${item.arquivo.nome}`}
                                    >
                                        <img
                                            src={obterUrlArquivo(item.arquivo.url)}
                                            alt={item.arquivo.nome}
                                        />
                                        <span className="mensagem-anexo__indicacao">Ampliar</span>
                                    </button>
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
                                    <button
                                        type="button"
                                        className="mensagem-anexo mensagem-anexo--arquivo mensagem-anexo--documento"
                                        onClick={() => setArquivoEmVisualizacao(item.arquivo!)}
                                    >
                                        <span className="mensagem-anexo__icone" aria-hidden="true">📄</span>
                                        <span className="mensagem-anexo__dados">
                                            <strong>{item.arquivo.nome}</strong>
                                            <small>{formatarTamanhoArquivo(item.arquivo.tamanho)}</small>
                                        </span>
                                        <span className="mensagem-anexo__abrir" aria-hidden="true">›</span>
                                    </button>
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

                    {!carregandoMensagens && usuariosDigitando.length > 0 && (
                        <div className="mensagem-linha mensagem-linha--recebida">
                            <div
                            ref={indicadorDigitandoRef}
                            className="mensagem-balao mensagem-balao--digitando"
                            role="status"
                            aria-label={
                                usuariosDigitando.length === 1
                                    ? `${usuariosDigitando[0].nome} está digitando`
                                    : `${usuariosDigitando.length} pessoas estão digitando`
                            }
                            >
                            <span className="digitando-pontos" aria-hidden="true">
                                {[0, 1, 2].map((ponto) => (
                                    <span
                                    key={ponto}
                                    className="digitando-ponto"
                                    />
                                ))}
                            </span>
                            </div>
                        </div>
                    )}

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
                        <div className="chat-input__emojis" data-lenis-prevent>
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
                        onChange={(event) => {
                            const novoConteudo = event.target.value;

                            setMensagem(novoConteudo);
                            informarDigitacao(novoConteudo.trim());
                        }}
                        onBlur={pararDeInformarDigitacao}
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
                        aria-label={
                            processandoGravacaoAudio
                                ? "Processando áudio"
                                : gravandoAudio
                                    ? "Parar gravação"
                                    : "Gravar áudio"
                        }
                        title={
                            processandoGravacaoAudio
                                ? "Processando áudio"
                                : gravandoAudio
                                    ? "Parar gravação"
                                    : "Gravar áudio"
                        }
                        onClick={() => void alternarGravacaoAudio()}
                        disabled={enviandoMensagem || processandoGravacaoAudio}
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
                            enviandoMensagem ||
                            gravandoAudio ||
                            processandoGravacaoAudio
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

                {(usuario?.tipo === "admin" || usuario?.tipo === "funcionario" || usuario?.tipo === "superAdmin") && (
                    <div className="menu-modal-item menu-modal-criar-grupo">
                        <a
                            href="#"
                            target="_blank"
                            className="menu-modal-button"
                        >
                            <svg width="16" height="16" fill="currentColor" className="bi bi-person-plus icones-modal" viewBox="0 0 16 16">
                                <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                                <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                            </svg>
                            <span className="menu-modal-texto">Novo grupo</span>
                        </a>
                    </div>
                )}

                {usuario?.tipo === "superAdmin" && (
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
                    <a href="/configuracao" target="_blank" className="menu-modal-button">
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

        {arquivoEmVisualizacao && (
            <div
                className="visualizador-arquivo"
                role="presentation"
                onMouseDown={(evento) => {
                    if (evento.target === evento.currentTarget) {
                        setArquivoEmVisualizacao(null);
                    }
                }}
            >
                <section
                    className="visualizador-arquivo__janela"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="visualizador-arquivo-titulo"
                >
                    <header className="visualizador-arquivo__cabecalho">
                        <div className="visualizador-arquivo__dados">
                            <strong id="visualizador-arquivo-titulo">
                                {arquivoEmVisualizacao.nome}
                            </strong>
                            <span>
                                {formatarTamanhoArquivo(arquivoEmVisualizacao.tamanho)}
                            </span>
                        </div>

                        <div className="visualizador-arquivo__acoes">
                            <a
                                href={obterUrlArquivo(arquivoEmVisualizacao.url)}
                                download={arquivoEmVisualizacao.nome}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Baixar ${arquivoEmVisualizacao.nome}`}
                                title="Baixar arquivo"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
                                </svg>
                            </a>
                            <button
                                ref={botaoFecharVisualizadorRef}
                                type="button"
                                onClick={() => setArquivoEmVisualizacao(null)}
                                aria-label="Fechar visualização"
                                title="Fechar"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="m6 6 12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    <div
                        className={`visualizador-arquivo__conteudo ${
                            arquivoEmVisualizacao.tipo === "imagem"
                                ? "visualizador-arquivo__conteudo--imagem"
                                : ""
                        }`}
                    >
                        {arquivoEmVisualizacao.tipo === "imagem" && (
                            <img
                                src={obterUrlArquivo(arquivoEmVisualizacao.url)}
                                alt={arquivoEmVisualizacao.nome}
                            />
                        )}

                        {arquivoEmVisualizacao.tipo === "documento" &&
                            (arquivoEmVisualizacao.mime === "application/pdf" ||
                            arquivoEmVisualizacao.mime.startsWith("text/") ? (
                                <iframe
                                    src={obterUrlArquivo(arquivoEmVisualizacao.url)}
                                    title={`Visualização de ${arquivoEmVisualizacao.nome}`}
                                />
                            ) : (
                                <div className="visualizador-arquivo__indisponivel">
                                    <span aria-hidden="true">📄</span>
                                    <strong>Pré-visualização não disponível</strong>
                                    <p>
                                        Este formato precisa ser aberto em um aplicativo compatível.
                                    </p>
                                    <a
                                        href={obterUrlArquivo(arquivoEmVisualizacao.url)}
                                        download={arquivoEmVisualizacao.nome}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Baixar arquivo
                                    </a>
                                </div>
                            ))}
                    </div>
                </section>
            </div>
        )}
        </main>
    );
}

export default Home;
