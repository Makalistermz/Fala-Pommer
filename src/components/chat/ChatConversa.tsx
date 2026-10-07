// Uma única interface de chat para conversas privadas, grupos, atendimentos e comunidades.
import type { ChangeEvent, Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import EmojiPicker from "../../assets/emojiPicker";
import EntradaComunidade from "../home/EntradaComunidade";
import type { Comunidade } from "../home/Comunidades";
import type { Conversa, MensagemChat, UsuarioAutenticado, UsuarioDigitando, ArquivoMensagem } from "../../types/chat";

// O Home fornece o estado e as ações; este componente concentra toda a apresentação do chat.
interface ChatConversaProps {
    // Seleção e cabeçalho: dados da conversa e ações de navegação/administração.
    comunidadeSelecionada: Comunidade | null;
    conversaSelecionada: Conversa | null;
    abrirComunidade: (comunidade: Comunidade) => Promise<void>;
    aoVoltar: () => void;
    modalDadosGrupoAberto: boolean;
    setModalDadosGrupoAberto: Dispatch<SetStateAction<boolean>>;
    renderizarAvatar: (nome: string, fotoUrl?: string | null) => ReactNode;
    nomeDaConversa: (conversa: Conversa) => string;
    fotoDaConversa: (conversa: Conversa) => string | null;
    subtituloDaConversa: (conversa: Conversa) => string;
    menuGrupoRef: RefObject<HTMLDetailsElement | null>;
    contatosModalAdicionarPessoas: () => Promise<void>;
    setModalSairGrupoAberto: Dispatch<SetStateAction<boolean>>;
    usuario: UsuarioAutenticado | null;
    menuSetorRef: RefObject<HTMLDetailsElement | null>;
    transferirConversa: () => Promise<void>;
    finalizarConversaSelecionada: () => Promise<void>;
    finalizandoConversa: boolean;
    // Histórico: paginação, identificação do remetente, respostas e visualização de anexos.
    mensagensContainerRef: RefObject<HTMLDivElement | null>;
    carregandoMensagens: boolean;
    mensagensChat: MensagemChat[];
    temMensagensAnteriores: boolean;
    carregarMensagensAnteriores: () => Promise<void>;
    carregandoMensagensAnteriores: boolean;
    usuariosDigitando: UsuarioDigitando[];
    mensagemFoiEnviadaPeloUsuario: (item: MensagemChat, usuario: UsuarioAutenticado | null, conversa: Conversa | null) => boolean;
    ultimaMensagemVisualizadaId: number | null;
    opcoesMensagens: number | null;
    balõesRef: RefObject<Map<number, HTMLElement>>;
    setOpcoesMensagens: Dispatch<SetStateAction<number | null>>;
    setResponderMensagem: Dispatch<SetStateAction<MensagemChat | null>>;
    irParaMensagem: (mensagemId: number) => void;
    setArquivoEmVisualizacao: Dispatch<SetStateAction<ArquivoMensagem | null>>;
    obterUrlArquivo: (url: string) => string;
    formatarTamanhoArquivo: (tamanho: number) => string;
    indicadorDigitandoRef: RefObject<HTMLDivElement | null>;
    // Compositor: campos, seletores de arquivo/emoji e controles de gravação e envio.
    podeEnviarMensagem: boolean;
    arquivoSelecionado: File | null;
    setArquivoSelecionado: Dispatch<SetStateAction<File | null>>;
    responderMensagem: MensagemChat | null;
    respostaFoiEnviadaPorMim: boolean;
    irParaMensagemRespondida: () => void;
    acaoArquivosRef: RefObject<HTMLDivElement | null>;
    botaoArquivosRef: RefObject<HTMLButtonElement | null>;
    menuAbertoArquivos: boolean;
    setMenuAbertoArquivo: Dispatch<SetStateAction<boolean>>;
    abrirSeletorArquivo: (referencia: RefObject<HTMLInputElement | null>) => void;
    inputDocumentosRef: RefObject<HTMLInputElement | null>;
    inputMidiasRef: RefObject<HTMLInputElement | null>;
    inputAudiosRef: RefObject<HTMLInputElement | null>;
    selecionarArquivo: (event: ChangeEvent<HTMLInputElement>) => void;
    acaoEmojiRef: RefObject<HTMLDivElement | null>;
    botaoEmojiRef: RefObject<HTMLButtonElement | null>;
    seletorEmojiAberto: boolean;
    setSeletorEmojiAberto: Dispatch<SetStateAction<boolean>>;
    adicionarEmoji: (emoji: string) => void;
    mensagem: string;
    setMensagem: Dispatch<SetStateAction<string>>;
    informarDigitacao: (conteudo: string) => void;
    pararDeInformarDigitacao: () => void;
    enviarMensagem: () => Promise<void>;
    gravandoAudio: boolean;
    processandoGravacaoAudio: boolean;
    alternarGravacaoAudio: () => Promise<void>;
    enviandoMensagem: boolean;
}

export default function ChatConversa({
    comunidadeSelecionada,
    conversaSelecionada,
    abrirComunidade,
    aoVoltar,
    modalDadosGrupoAberto,
    setModalDadosGrupoAberto,
    renderizarAvatar,
    nomeDaConversa,
    fotoDaConversa,
    subtituloDaConversa,
    menuGrupoRef,
    contatosModalAdicionarPessoas,
    setModalSairGrupoAberto,
    usuario,
    menuSetorRef,
    transferirConversa,
    finalizarConversaSelecionada,
    finalizandoConversa,
    mensagensContainerRef,
    carregandoMensagens,
    mensagensChat,
    temMensagensAnteriores,
    carregarMensagensAnteriores,
    carregandoMensagensAnteriores,
    usuariosDigitando,
    mensagemFoiEnviadaPeloUsuario,
    ultimaMensagemVisualizadaId,
    opcoesMensagens,
    balõesRef,
    setOpcoesMensagens,
    setResponderMensagem,
    irParaMensagem,
    setArquivoEmVisualizacao,
    obterUrlArquivo,
    formatarTamanhoArquivo,
    indicadorDigitandoRef,
    podeEnviarMensagem,
    arquivoSelecionado,
    setArquivoSelecionado,
    responderMensagem,
    respostaFoiEnviadaPorMim,
    irParaMensagemRespondida,
    acaoArquivosRef,
    botaoArquivosRef,
    menuAbertoArquivos,
    setMenuAbertoArquivo,
    abrirSeletorArquivo,
    inputDocumentosRef,
    inputMidiasRef,
    inputAudiosRef,
    selecionarArquivo,
    acaoEmojiRef,
    botaoEmojiRef,
    seletorEmojiAberto,
    setSeletorEmojiAberto,
    adicionarEmoji,
    mensagem,
    setMensagem,
    informarDigitacao,
    pararDeInformarDigitacao,
    enviarMensagem,
    gravandoAudio,
    processandoGravacaoAudio,
    alternarGravacaoAudio,
    enviandoMensagem,
}: ChatConversaProps) {
    // Preserva as classes originais: tema, papel de parede e compositor são os mesmos em todos os chats.
    return (
        <section className={`chat ${comunidadeSelecionada && !conversaSelecionada ? 'chat--comunidade' : ''}`}>
            {comunidadeSelecionada && !conversaSelecionada ? (
                <EntradaComunidade
                    key={comunidadeSelecionada.id}
                    comunidade={comunidadeSelecionada}
                    aoAtualizar={(comunidade) => void abrirComunidade(comunidade)}
                    aoVoltar={aoVoltar}
                />
            ) : conversaSelecionada ? (
            <>
                {/* Cabeçalho comum: avatar, nome e ações disponíveis para o tipo de conversa. */}
                <header className="chat-header">
                <div className="chat-header__usuario">
                    <button
                    type="button"
                    className="chat-header__voltar"
                    aria-label={conversaSelecionada.tipo === 'comunidade' ? 'Voltar para as comunidades' : 'Voltar para as conversas'}
                    onClick={aoVoltar}
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

                    <div
                        className={`header__avatar__dados ${
                            conversaSelecionada.tipo === "grupo"
                                ? "header__avatar__dados--clicavel"
                                : ""
                        }`}
                        role={
                            conversaSelecionada.tipo === "grupo"
                                ? "button"
                                : undefined
                        }
                        tabIndex={
                            conversaSelecionada.tipo === "grupo"
                                ? 0
                                : undefined
                        }
                        aria-haspopup={
                            conversaSelecionada.tipo === "grupo"
                                ? "dialog"
                                : undefined
                        }
                        aria-expanded={
                            conversaSelecionada.tipo === "grupo"
                                ? modalDadosGrupoAberto
                                : undefined
                        }
                        onClick={() => {
                            if (conversaSelecionada.tipo === "grupo") {
                                setModalDadosGrupoAberto(true);
                            }
                        }}
                        onKeyDown={(evento) => {
                            if (
                                conversaSelecionada.tipo === "grupo" &&
                                (evento.key === "Enter" || evento.key === " ")
                            ) {
                                evento.preventDefault();
                                setModalDadosGrupoAberto(true);
                            }
                        }}
                    >
                        <div className={conversaSelecionada?.tipo === "grupo" 
                                ? "chat-header__avatar-grupo" 
                                : (conversaSelecionada?.tipo === "setor" 
                                    ? "chat-header__avatar-setor" 
                                    : "chat-header__avatar"
                                )
                            }
                        >
                            {conversaSelecionada?.tipo === "grupo" 
                                ? <svg width="16" height="16" fill="currentColor" className="bi bi-people-fill" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                                </svg>

                                : (conversaSelecionada?.tipo === "setor" 
                                    ? <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                        role="img"
                                        aria-label="Atendimento"
                                    >
                                        <g transform="scale(0.25)">
                                            <path d=" M45 20 C43.5 13.5 38.5 9 32 9 C25.5 9 20.5 13.5 19 20 C20 21 20.5 22.5 20 24 V27 C20 33 25.5 37 32 35.5 C30.5 34 31 31.5 32.5 30.5 C34 29.5 37.5 29.5 39 30.5 L43 29 C44 27 44 25 44 24 C43.5 22.5 44 21 45 20Z" />
                                            <path d=" M24 38H40 C48.5 38 55 44.5 55 53 C55 59 51.5 61 45 61 H19 C12.5 61 9 59 9 53 C9 44.5 15.5 38 24 38Z" />

                                            <path d="M15.5 22V21A16.5 16.5 0 0 1 48.5 21V22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />

                                            <path d=" M15.5 20 A3 3 0 0 1 18.5 23 V28.5 A3 3 0 0 1 12.5 28.5 V23 A3 3 0 0 1 15.5 20Z M48.5 20 A3 3 0 0 1 51.5 23 V28.5 A3 3 0 0 1 45.5 28.5 V23 A3 3 0 0 1 48.5 20Z" />
                                            <path d="M48 29C45 32 41 33.5 37 33.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                                            />
                                            <path d="M35 31.8H37 A1.7 1.7 0 0 1 37 35.2 H35 A1.7 1.7 0 0 1 35 31.8Z" />
                                        </g>
                                    </svg> 
                                    : renderizarAvatar(
                                        nomeDaConversa(conversaSelecionada),
                                        fotoDaConversa(conversaSelecionada)
                                    )
                                )
                            }
                        </div>
                        <div className="chat-header__dados">
                            <strong>{nomeDaConversa(conversaSelecionada)}</strong>
                            <span>{subtituloDaConversa(conversaSelecionada)}</span>
                        </div>
                    </div>
                </div>

                {conversaSelecionada.tipo === "grupo" &&
                    !conversaSelecionada.somenteLeitura && (
                    <div className="chat-header__acoes chat-header__acoes--grupo">
                        <details
                            ref={menuGrupoRef}
                            className="chat-header__menu-grupo"
                        >
                            <summary aria-label="Abrir ações do grupo">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M4 7h16M4 12h16M4 17h16"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </summary>

                            <div className="chat-header__menu-opcoes chat-header__menu-opcoes--grupo">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (menuGrupoRef.current) {
                                            menuGrupoRef.current.open = false;
                                        }
                                        void contatosModalAdicionarPessoas();
                                    }}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M14 19c0-2.21-2.46-4-5.5-4S3 16.79 3 19M8.5 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M19 8v6m3-3h-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span>Adicionar pessoa</span>
                                </button>

                                <div className="container-botao-sair-grupo">
                                    <button
                                        type="button"
                                        className="chat-header__menu-sair-grupo"
                                        onClick={() => {
                                            if (menuGrupoRef.current) {
                                                menuGrupoRef.current.open = false;
                                            }
                                            setModalSairGrupoAberto(true);
                                        }}
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M10 17l5-5-5-5m5 5H3m10-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span>Sair do grupo</span>
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>
                )}

                {conversaSelecionada.tipo === "setor" &&
                    (usuario?.tipo !== "user" ||
                        conversaSelecionada.podeFinalizar) && (
                    <div className="chat-header__acoes chat-header__acoes--setor">
                        <details
                            ref={menuSetorRef}
                            className="chat-header__menu-grupo chat-header__menu-setor"
                        >
                            <summary aria-label="Abrir ações do setor">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M4 7h16M4 12h16M4 17h16"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </summary>

                            <div className="chat-header__menu-opcoes chat-header__menu-opcoes--grupo">
                                {usuario?.tipo !== "user" && (
                                    <button
                                        type="button"
                                        className="chat-header__transferir"
                                        onClick={() => {
                                            if (menuSetorRef.current) {
                                                menuSetorRef.current.open = false;
                                            }
                                            void transferirConversa()
                                        }}
                                    >
                                        Transferir conversa
                                    </button>
                                )}

                                <div 
                                className={usuario?.tipo !== "user" ? "container-botao-finalizar" : ""}
                                >
                                    {conversaSelecionada.podeFinalizar && (
                                        <button
                                            type="button"
                                            className="chat-header__menu-finalizar"
                                            onClick={finalizarConversaSelecionada}
                                            disabled={finalizandoConversa}
                                        >
                                            {finalizandoConversa
                                                ? "Finalizando..."
                                                : "Finalizar"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </details>
                    </div>
                )}
                </header>

                {/* A classe mensagens aplica o papel de parede escolhido nas configurações. */}
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
                        if (item.sistema) {
                            return (
                                <div
                                    key={item.id}
                                    className="mensagem-sistema"
                                    role="status"
                                >
                                    {item.conteudo}
                                </div>
                            );
                        }

                        const enviadaPorMim = mensagemFoiEnviadaPeloUsuario(
                            item,
                            usuario,
                            conversaSelecionada,
                        );
                        const mensagemRespondida = item.respondendoA ?? null;
                        const mensagemRespondidaEnviadaPorMim =
                            mensagemRespondida?.remetente.id === usuario?.sub;
                        const exibirAvatarGrupo =
                            (conversaSelecionada.tipo === "grupo" || conversaSelecionada.tipo === "comunidade") &&
                            !enviadaPorMim;
                        const statusEntrega =
                            item.statusEntrega === "enviando"
                                ? "enviando"
                                : ultimaMensagemVisualizadaId !== null &&
                                    item.id <= ultimaMensagemVisualizadaId
                                  ? "visualizada"
                                  : "recebida";
                        const descricaoStatusEntrega =
                            statusEntrega === "enviando"
                                ? "Mensagem ainda não recebida"
                                : statusEntrega === "visualizada"
                                  ? "Mensagem visualizada"
                                  : "Mensagem recebida";

                        return (
                            <div
                            key={item.id}
                            className={`mensagem-linha ${
                                enviadaPorMim
                                ? "mensagem-linha--enviada"
                                : "mensagem-linha--recebida"
                            } ${
                                exibirAvatarGrupo
                                    ? "mensagem-linha--com-avatar"
                                    : ""
                            }`}
                            >
                            {exibirAvatarGrupo && (
                                <div
                                    className="mensagem-grupo__avatar"
                                    aria-label={`Foto de ${item.remetente.nome}`}
                                    title={item.remetente.nome}
                                >
                                    {renderizarAvatar(
                                        item.remetente.nome,
                                        item.remetente.fotoPerfilUrl,
                                    )}
                                </div>
                            )}
                            <article
                                className={`mensagem-balao ${
                                    opcoesMensagens === item.id
                                        ? "mensagem-balao--opcoes-abertas"
                                        : ""
                                }`}
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

                                    <span
                                        className={`config-mensagens ${
                                            opcoesMensagens === item.id
                                                ? "config-mensagens--aberto"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="config-mensagens__ativo"
                                            aria-expanded={opcoesMensagens === item.id}
                                            onClick={() =>
                                                setOpcoesMensagens((mensagemId) =>
                                                    mensagemId === item.id ? null : item.id,
                                                )
                                            }
                                        >
                                            <svg width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                            </svg>
                                        </button>

                                        {opcoesMensagens === item.id && (
                                            <div
                                                className={`opcoes-mensagens ${
                                                    enviadaPorMim
                                                        ? "opcoes-mensagens--mensagem-direita"
                                                        : "opcoes-mensagens--mensagem-esquerda"
                                                }`}
                                                role="menu"
                                                aria-label="Opções da mensagem"
                                            >
                                                <button
                                                    type="button"
                                                    className="opcoes-mensagens__item"
                                                    role="menuitem"
                                                    onClick={() => setResponderMensagem(item)}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M9 8l-5 4 5 4v-3h4.5c2.8 0 5 1.4 6.5 4-1-5-3.5-7-7.5-7H9V8Z"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <span>Responder</span>
                                                </button>
                                            </div>
                                        )}
                                    </span>
                                </header>

                                {mensagemRespondida && (
                                    <button
                                        type="button"
                                        className={`mensagem-balao__resposta ${
                                            mensagemRespondidaEnviadaPorMim
                                                ? "mensagem-balao__resposta--eu-mesmo"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            irParaMensagem(
                                                mensagemRespondida.id,
                                            )
                                        }
                                        aria-label="Ir para a mensagem respondida"
                                    >
                                        <span
                                            className="mensagem-balao__resposta-borda"
                                            aria-hidden="true"
                                        />
                                        <span className="mensagem-balao__resposta-dados">
                                            <strong>
                                                {mensagemRespondidaEnviadaPorMim
                                                    ? "Você"
                                                    : mensagemRespondida.remetente.nome}
                                            </strong>
                                            <span>
                                                {mensagemRespondida.conteudo ||
                                                    mensagemRespondida.arquivo?.nome}
                                            </span>
                                        </span>
                                    </button>
                                )}

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

                                <footer className="mensagem-balao__rodape">
                                    <time dateTime={item.enviadaEm}>
                                    {new Intl.DateTimeFormat("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }).format(new Date(item.enviadaEm))}
                                    </time>
                                    {enviadaPorMim && (
                                        <span
                                            className={`mensagem-status mensagem-status--${statusEntrega}`}
                                            aria-label={descricaoStatusEntrega}
                                            title={descricaoStatusEntrega}
                                        >
                                            {statusEntrega === "enviando"
                                                ? "✓"
                                                : "✓✓"}
                                        </span>
                                    )}
                                </footer>
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

                {/* Compositor compartilhado: anexos, respostas, emojis e gravação de áudio. */}
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

                    {responderMensagem && (
                        <div
                            className={`chat-input__responder ${
                                respostaFoiEnviadaPorMim
                                    ? "chat-input__responder-euMesmo"
                                    : ""
                            }`}
                            onClick={irParaMensagemRespondida}
                        >
                            <span
                                className="chat-input__responder-borda"
                                aria-hidden="true"
                            />

                            <div className="chat-input__responder-dados">
                                <strong>
                                    {respostaFoiEnviadaPorMim
                                        ? "Você"
                                        : responderMensagem.remetente.nome}
                                </strong>

                                <span>
                                    {responderMensagem.conteudo ||
                                        responderMensagem.arquivo?.nome}
                                </span>
                            </div>

                            <button
                            className="chat-input__responder-remover"
                            type="button"
                            aria-label="Remover mensagem"
                            onClick={(evento) => {
                                evento.stopPropagation();
                                setResponderMensagem(null);
                            }}
                            >
                            ×
                            </button>
                        </div>
                    )}

                    <div className="chat-input__conteudo">
                    <div ref={acaoArquivosRef} className="chat-input__acao">
                        <button
                        ref={botaoArquivosRef}
                        type="button"
                        aria-label="Anexar arquivo"
                        aria-expanded={menuAbertoArquivos}
                        aria-controls="menu-arquivos"
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
                        <div id="menu-arquivos" className="menu-arquivos">
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

                    <div ref={acaoEmojiRef} className="chat-input__acao">
                        <button
                        ref={botaoEmojiRef}
                        type="button"
                        aria-label="Adicionar emoji"
                        aria-expanded={seletorEmojiAberto}
                        aria-controls="seletor-emojis"
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
                        <div
                            id="seletor-emojis"
                            className="chat-input__emojis"
                            data-lenis-prevent
                        >
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
                <div className="chat-vazio__icone" aria-hidden="true">
                    <svg viewBox="0 0 260 190">
                        <defs>
                            <linearGradient id="chat-vazio-gradiente" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#2878df" />
                                <stop offset="1" stopColor="#1351b4" />
                            </linearGradient>
                        </defs>

                        <ellipse
                            className="chat-vazio__halo"
                            cx="130"
                            cy="104"
                            rx="104"
                            ry="68"
                        />
                        <path
                            className="chat-vazio__trilha"
                            d="M17 149c38 25 70 19 96-3 27-23 49-31 81-19 19 8 34 5 49-5"
                        />

                        <circle className="chat-vazio__forma chat-vazio__forma--rosa" cx="31" cy="58" r="8" />
                        <circle className="chat-vazio__forma chat-vazio__forma--verde" cx="226" cy="148" r="7" />
                        <path className="chat-vazio__forma chat-vazio__forma--amarela" d="m218 36 3.8 9.2L231 49l-9.2 3.8L218 62l-3.8-9.2L205 49l9.2-3.8Z" />

                        <g className="chat-vazio__balao chat-vazio__balao--traseiro">
                            <path d="M126 65h65c15 0 27 12 27 27v28c0 15-12 27-27 27h-13v18l-24-18h-28c-15 0-27-12-27-27V92c0-15 12-27 27-27Z" />
                            <circle cx="178" cy="105" r="7" />
                        </g>

                        <g className="chat-vazio__balao chat-vazio__balao--principal">
                            <path d="M54 39h101c17 0 30 13 30 30v34c0 17-13 30-30 30h-46l-29 23v-23H54c-17 0-30-13-30-30V69c0-17 13-30 30-30Z" />
                            <circle cx="78" cy="86" r="7" />
                            <circle cx="105" cy="86" r="7" />
                            <circle cx="132" cy="86" r="7" />
                        </g>
                    </svg>
                </div>

                <h2>Bem-vindo ao Fala Pommer</h2>

                <p>Selecione uma conversa ao lado para começar.</p>
            </div>
            )}
        </section>
    );
}
