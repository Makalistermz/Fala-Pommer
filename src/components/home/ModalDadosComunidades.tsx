import { useState, useRef, type ReactNode, type RefObject } from "react";
import type { Comunidade } from "./Comunidades";
import type { ConversaComunidade } from "../../pages/home";
import { apiFetch } from "../../services/api";
import { ModalFeedback } from "../ModalFeedback";
import { useLayoutEffect } from "react";

interface ModalDadosComunidadeProps {
    aberto: boolean;
    comunidade: Comunidade | null;
    conversaSelecionada: ConversaComunidade | null;
    usuario: { sub: number } | null;
    aoFechar: () => void;
    botaoFecharRef: RefObject<HTMLButtonElement | null>;
    renderizarAvatar: (
        nome: string,
        imagem: string | null,
        comunidade?: boolean,
    ) => ReactNode;
}

function ModalDadosComunidades({
    aberto,
    comunidade,
    conversaSelecionada,
    usuario,
    aoFechar,
    botaoFecharRef,
    renderizarAvatar,
}: ModalDadosComunidadeProps) {
    {/*retorna um elemento html*/}
    const [iconChangeMessage, setIconChangeMessage] = useState<React.JSX.Element | null>(null);
    const [feedback, setFeedback] = useState({
        aberto: false,
        tipo: "erro" as "erro" | "sucesso",
        mensagem: "",
    });
    const [alterarDescricaoComunidade, setAlterarDescricaoComunidade] = useState(comunidade?.descricao_comunidade ?? "");
    const [alterarNomeComunidade, setAlterarNomeComunidade] = useState(comunidade?.nome_comunidade ?? "");
    const descricaoRef = useRef<HTMLTextAreaElement>(null);
    const nomeRef = useRef<HTMLInputElement>(null);
    const [isDisabledDescription, setIsDisabledDescription] = useState<boolean>(true);
    const [isDisabledName, setIsDisabledName] = useState<boolean>(true);
    const [detectarHandlerCliqueNome, setDetectarHandlerCliqueNome] = useState(false)
    const [detectarHandlerCliqueDescricao, setDetectarHandlerCliqueDescricao] = useState(false)
    const [adicionarNovaClass, setAdicionarNovaClass] = useState(false);
    const [abrirModalAdicionarMembro, setAbrirModalAdicionarMembro] = useState(false);
    const botaoFecharModalAdicionarMembroRef =
            useRef<HTMLButtonElement>(null);
    const [buscarUsuariosComunidade, setBuscarUsuariosComunidade] = useState("");
    const buscaRef = useRef<HTMLInputElement>(null);

    function alternarPesquisa() {
        if (adicionarNovaClass) {
            setBuscarUsuariosComunidade("");
        } else {
            // o input está com display:none; espera o React renderizar antes de focar
            setTimeout(() => buscaRef.current?.focus(), 0);
        }
        setAdicionarNovaClass((adicionar) => !adicionar);
    }

    //função de ativação do textarea para alteração da descrição
    const handleCliqueDescricao = () => {
        // Ativa o input mudando o estado
        setIsDisabledDescription(false);
        setDetectarHandlerCliqueDescricao(true);

        // Coloca o cursor no input. Usa o setTimeout para garantir
        // que o React já renderizou o input como habilitado antes do foco.
        setTimeout(() => {
        descricaoRef.current?.focus();
        }, 0);
    };

    const handlerCliqueNome = () => {
        setIsDisabledName(false);
        setDetectarHandlerCliqueNome(true)

        setTimeout(() => {
            nomeRef.current?.focus();
        }, 0);
    };

    useLayoutEffect(() => {
        const campoDescricao = descricaoRef.current;

        if (!campoDescricao) return;

        campoDescricao.style.height = "auto";
        campoDescricao.style.height = `${campoDescricao.scrollHeight}px`;
    }, [alterarDescricaoComunidade]);

    useLayoutEffect(() => {
        if (aberto && comunidade) {
            setAlterarDescricaoComunidade(comunidade.descricao_comunidade ?? "");
            setAlterarNomeComunidade(comunidade?.nome_comunidade ?? "");
            setBuscarUsuariosComunidade("");
            setAdicionarNovaClass(false);
        }
    }, [aberto, comunidade]);

    if (!aberto || !comunidade || !conversaSelecionada) {
        return null;
    }

    const svgPen = <svg width="16" height="16" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
    </svg>

    const svgImage = <svg width="16" height="16" fill="currentColor" className="bi bi-card-image" viewBox="0 0 16 16">
        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
        <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
    </svg>

    const svgCheck = <svg width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
    </svg>

    const dataFormatada = new Date(comunidade.comunidade_criada_em).toLocaleDateString('pt-br');

    function IconChangeMessage() {
        return (
            <div>
                <span>Alterar a foto da comunidade</span>
                {svgImage}
            </div>
        )
    };

    function normalizarTexto(texto: string) {
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    const termoBusca = normalizarTexto(buscarUsuariosComunidade);

    const participantesOrdenados = [...conversaSelecionada.participantes].sort(
        (primeiro, segundo) => {
            if (primeiro.id === usuario?.sub) return -1;
            if (segundo.id === usuario?.sub) return 1;
            return primeiro.nome.localeCompare(segundo.nome, "pt-BR");
        },
    );

    const participantesFiltrados = termoBusca
        ? participantesOrdenados.filter((participante) =>
            normalizarTexto(participante.nome).includes(termoBusca),
        )
        : participantesOrdenados;

    async function gerarConvite(comunidadeId: number) {
        try {
            const resposta = await apiFetch(
                `/comunidades/${comunidadeId}/convite`,
                {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                },
            );

            if (!resposta.ok) {
            throw new Error('Erro ao gerar convite');
            }

            const dados = await resposta.json();

            await navigator.clipboard.writeText(dados.link);

            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: "Convite copiado para a área de transferência.",
            });
        } catch (erro) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: `Erro: ${erro}`
            });
        }
    }

    //atualização dos dados das comunidades
    async function enviarNomeAlteradoComunidade() {
        if (!comunidade) return;

        try {
            const resposta = await apiFetch(`/comunidades/${comunidade.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome_comunidade: nomeRef.current?.value.trim() ?? "",
                    descricao_comunidade: alterarDescricaoComunidade,
                }),
            });

            if (!resposta.ok) {
                throw new Error("Não foi possivel atualizar a comunidade.")
            }

            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: `Alteração feita com sucesso!`
            });

            setDetectarHandlerCliqueDescricao(false);
            setDetectarHandlerCliqueNome(false);
            setIsDisabledDescription(true);
            setIsDisabledName(true);

        } catch (erro) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: `Erro: ${erro}`
            })
        }
    }

    return (
        <>
            <div className="modal-dados__fundo" onClick={aoFechar} data-lenis-prevent>
                <section
                    className="modal-dados modal-dados-comunidade"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-dados-comunidade-titulo"
                    onClick={(evento) => evento.stopPropagation()}
                >
                    <header className="modal-dados__cabecalho">
                        <h2 id="modal-dados-comunidade-titulo">Dados da comunidade</h2>
                        <button
                            ref={botaoFecharRef}
                            type="button"
                            aria-label="Fechar"
                            onClick={aoFechar}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m6 6 12 12M18 6 6 18" />
                            </svg>
                        </button>
                    </header>

                    <div className="modal-dados__conteudo">
                        <section className="dados-comunidade__informacoes">
                            <div className="dados-comunidade__avatar">
                                <div 
                                    className="dados-comunidade__avatar-comunidade"
                                    title="Alterar imagem"
                                    onMouseEnter={() => setIconChangeMessage(IconChangeMessage())}
                                    onMouseLeave={() => setIconChangeMessage(null)}
                                >
                                    {renderizarAvatar(comunidade.nome_comunidade, comunidade.imagem_comunidade, true)}
                                    
                                    {iconChangeMessage && (
                                        <div className="dados-comunidade_avatar-messagem">
                                            {iconChangeMessage}
                                        </div>
                                    )}

                                </div>
                            </div>

                            <div className="dados-comunidade__identificacao">
                                <input 
                                    type="text" 
                                    name="nome_comunidade" 
                                    id="nome_comunidade" 
                                    className="dados-comunidade__nome"
                                    ref={nomeRef}
                                    value={alterarNomeComunidade}
                                    onChange={(evento) => setAlterarNomeComunidade(evento.target.value)}
                                    disabled={isDisabledName}
                                    placeholder="Adicione um novo nome para a comunidade"
                                    maxLength={150}
                                    required
                                    autoComplete="off"
                                />
                                {detectarHandlerCliqueNome === true 
                                    ? <button
                                        className="dados-comunidade_alter-nome"
                                        type="button"
                                        title="Confirmar alteração"
                                        onClick={enviarNomeAlteradoComunidade}
                                    >
                                        {svgCheck}
                                    </button>

                                    : <button
                                        className="dados-comunidade_alter-nome"
                                        type="button"
                                        title="Editar nome da comunidade"
                                        onClick={handlerCliqueNome}
                                    >
                                        {svgPen}
                                    </button>
                                }
                            </div>

                            <div className="dados-comunidade__resumo">
                                <p className="dados-comunidade__participantes">
                                    Comunidade <span className="dados-comunidade__separador">·</span>{" "}
                                    {comunidade.totalParticipantes}{" "}
                                    {comunidade.totalParticipantes === 1 ? "membro" : "membros"}
                                </p>
                            </div>

                            <div className="dados-comunidade__acoes">
                                <div className="dados-comunidade__acao">
                                    <button 
                                        className="dados-comunidade__acao-botao"
                                        id="convidar"
                                        type="button"
                                        title="Convidar usando link"
                                        onClick={() => gerarConvite(comunidade.id)}
                                    >
                                        <svg width="16" height="16" fill="currentColor" className="dados-comunidade__acao-icone bi bi-link" viewBox="0 0 16 16">
                                            <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
                                            <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
                                        </svg>
                                    </button>
                                    <label 
                                        htmlFor="convidar"
                                        className="dados-comunidade__acao-texto"
                                    >
                                        Convidar
                                    </label>
                                </div>

                                <div className="dados-comunidade__acao">
                                    <button 
                                        className="dados-comunidade__acao-botao"
                                        id="adicionar_membro"
                                        type="button"
                                        title="Adicionar membro"
                                        onClick={() => setAbrirModalAdicionarMembro(true)}
                                    >
                                        <svg width="16" height="16" fill="currentColor" className="dados-comunidade__acao-icone bi bi-person-add" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                            <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                        </svg>
                                    </button>
                                    <label 
                                        htmlFor="adicionar_membro" 
                                        className="dados-comunidade__acao-texto"
                                    >
                                        Adicionar membro
                                    </label>
                                </div>
                            </div>

                        </section>

                        <section className="dados-comunidade__descricao">
                            <div className="dados-comunidade__descricao-conteudo">
                                <div className="dados-comunidade__descricao-cabecalho">
                                    <strong className="dados-comunidade__descricao-titulo">Comunidade</strong>
                                </div>

                                <div className="dados-comunidade__descricao-texto">
                                    <textarea 
                                        name="descricao_comunidade" 
                                        id="descricao_comunidade" 
                                        ref={descricaoRef}
                                        className="dados-comunidade__descricao-mensagem"
                                        value={alterarDescricaoComunidade}
                                        onChange={(evento) => setAlterarDescricaoComunidade(evento.target.value)}
                                        disabled={isDisabledDescription}
                                        placeholder="Adicione uma nova descrição para a comunidade"
                                        rows={3}
                                        maxLength={400}
                                        required
                                    ></textarea>
                                    {detectarHandlerCliqueDescricao === true
                                        ? <button
                                            className="dados-comunidade__descricao-editar"
                                            type="button"
                                            title="Confirmar alteração"
                                            onClick={enviarNomeAlteradoComunidade}
                                        >
                                            {svgCheck}
                                        </button>

                                        : <button
                                            className="dados-comunidade__descricao-editar"
                                            type="button"
                                            title="Editar descrição da comunidade"
                                            onClick={handleCliqueDescricao}
                                        >
                                            {svgPen}
                                        </button>
                                    }
                                </div>
                            </div>
                        </section>

                        <div className="dados-comunidade__membros">
                            <div className="dados-comunidade__membros-conteudo">
                                <div className="dados-comunidade__membros-cabecalho">
                                    <span className="dados-comunidade__membros-total">
                                        {comunidade.totalParticipantes}{" "}
                                        {comunidade.totalParticipantes === 1 ? "membro da comunidade" : "membros da comunidade"}
                                    </span>
                                    <div className={`dados-comunidade__membros-pesquisar
                                        ${adicionarNovaClass 
                                            ? " dados-comunidade__membros-pesquisar--ativo" : ""
                                        }`}
                                    >
                                        <input 
                                            type="search"
                                            className={!adicionarNovaClass  
                                                ?`dados-comunidade__membros-pesquisar-input`
                                                :`dados-comunidade__membros-pesquisar-input dados-comunidade__membros-pesquisar-input-ativo`
                                            } 
                                            ref={buscaRef}
                                            aria-label="Pesquisar usuários"
                                            autoComplete="off"
                                            placeholder="Pesquisar usuários"
                                            value={buscarUsuariosComunidade}
                                            onChange={(evento) => setBuscarUsuariosComunidade(evento.target.value)}
                                        />
                                        <button
                                            className={!adicionarNovaClass 
                                                ?`dados-comunidade__membros-pesquisar-botao` 
                                                :`dados-comunidade__membros-pesquisar-botao dados-comunidade__membros-pesquisar-botao--input-ativo`
                                            }
                                            onClick={alternarPesquisa}
                                            type="button"
                                            aria-label="Abrir pesquisa"
                                            aria-expanded={adicionarNovaClass}
                                        >
                                            <svg width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    className="dados-comunidade__membros-adicionar"
                                    type="button"
                                >
                                    <div className="dados-comunidade__membros-adicionar-icone">
                                        <svg width="16" height="16" fill="currentColor" className="bi bi-person-add" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                                            <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                                        </svg>
                                    </div>
                                    <div className="dados-comunidade__membros-adicionar-texto">
                                        <span>Adicionar membro</span>
                                    </div>
                                </button>

                                {participantesFiltrados.length > 0 ? (
                                    <ul className="dados-comunidade__membros-lista" data-lenis-prevent>
                                        {participantesFiltrados.map((participante) => (
                                            <li 
                                                key={participante.id} 
                                                className="dados-comunidade__membro"
                                            >
                                                <div className="dados-comunidade__membro-avatar">
                                                    {renderizarAvatar(
                                                        participante.nome,
                                                        participante.foto_perfil_url,
                                                    )}
                                                </div>
                                                <div className="dados-comunidade__membro-dados">
                                                    <div className="dados-comunidade__membro-cabecalho">
                                                        <strong>{participante.nome}</strong>
                                                        {participante.id === usuario?.sub && (
                                                            <span className="dados-comunidade__membro-voce">
                                                                Você
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="dados-comunidade__membros-vazio">
                                        {termoBusca
                                            ? "Nenhum usuário encontrado."
                                            : "Esta comunidade não possui participantes."
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="dados-comunidade__sair-container">
                            <button className="dados-comunidade__sair" type="button">
                                <div className="dados-comunidade__sair-icone">
                                    <svg width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                                    </svg>
                                </div>
                                <div className="dados-comunidade__sair-texto">
                                    <span className="dados-comunidade__sair-rotulo">
                                        Sair da comunidade
                                    </span>
                                </div>
                            </button>
                        </div>

                        <footer className="dados-comunidade__rodape">
                            <span className="dados-comunidade__criacao">
                                Essa comunidade foi criada por {comunidade.criador_nome} no dia {dataFormatada}
                            </span>
                        </footer>
                    </div>

                </section>

                {abrirModalAdicionarMembro && (
                    <div
                        className="modal-adicionar-comunidade"
                        role="presentation"
                        onMouseDown={(evento) => {
                            if (evento.target === evento.currentTarget) {
                                setAbrirModalAdicionarMembro(false);
                            }
                        }}
                    >
                        <section
                            className="modal-comunidade__janela modal-comunidade__janela--adicionar-pessoa"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-adicionar-pessoa-titulo"
                            aria-describedby="modal-adicionar-pessoa-descricao"
                        >
                            <header className="modal-grupo__cabecalho">
                                <div className="modal-grupo__titulo">
                                    <span className="modal-grupo__icone" aria-hidden="true">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M15 19c0-2.21-2.69-4-6-4s-6 1.79-6 4" />
                                            <circle cx="9" cy="8" r="4" />
                                            <path d="M18 8v6M15 11h6" />
                                        </svg>
                                    </span>

                                    <div>
                                        <span className="modal-grupo__etapa">
                                            NOVO PARTICIPANTE
                                        </span>
                                        <h2 id="modal-adicionar-pessoa-titulo">
                                            Adicionar pessoa
                                        </h2>
                                        <p id="modal-adicionar-pessoa-descricao">
                                            Escolha quem você deseja adicionar ao grupo.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    ref={botaoFecharModalAdicionarMembroRef}
                                    type="button"
                                    className="modal-grupo__fechar"
                                    onClick={() => setAbrirModalAdicionarMembro(false)}
                                    aria-label="Fechar adição de pessoa"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M6 6l12 12M18 6 6 18" />
                                    </svg>
                                </button>
                            </header>

                            <div className="modal-grupo__pesquisa">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m16 16 4 4" />
                                </svg>
                                <input
                                    type="search"
                                    placeholder="Pesquisar pessoa"
                                    aria-label="Pesquisar pessoa para adicionar ao grupo"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="modal-grupo__rotulo-lista" data-lenis-prevent>
                                <span>PESSOAS DISPONÍVEIS</span>
                                    {/*Numero ficticio, alterar após pegar a quantidade total de usuarios fora da comunidade*/}
                                    <span>8</span>
                            </div>

                            <div className="modal-grupo__contatos">
                                <button>
                                    <span className="modal-grupo__avatar"></span>

                                    <span className="modal-grupo__dados">
                                        <strong></strong>
                                        <span className="modal-grupo__perfil">

                                        </span>
                                    </span>

                                    <span className="modal-grupo__selecao"></span>
                                </button>
                            </div>

                        </section>
                    </div>
                )}

            </div>

            <ModalFeedback
                aberto={feedback.aberto}
                tipo={feedback.tipo}
                mensagem={feedback.mensagem}
                aoFechar={() =>
                    setFeedback((estadoAtual) => ({
                        ...estadoAtual,
                        aberto: false,
                    }))
                }
            />
        </>
    );
}

export default ModalDadosComunidades;
