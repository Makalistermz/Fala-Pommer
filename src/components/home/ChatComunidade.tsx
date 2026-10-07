import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { apiFetch } from '../../services/api';
import { type Comunidade } from './Comunidades';
import './ChatComunidade.css';

interface MensagemComunidade {
    id: number;
    conteudo: string;
    enviadaEm: string;
    remetente: { id: number; nome: string; foto_perfil_url: string | null };
}

interface ChatComunidadeProps {
    comunidade: Comunidade;
    usuarioId?: number;
    aoAtualizar: (comunidade: Comunidade) => void;
    aoVoltar: () => void;
}

async function lerResposta<T>(resposta: Response): Promise<T> {
    const dados = await resposta.json();
    if (!resposta.ok) {
        const mensagem = dados.message;
        throw new Error(Array.isArray(mensagem) ? mensagem.join(' ') : mensagem ?? 'Não foi possível concluir a ação.');
    }
    return dados as T;
}

function mesclarMensagens(atuais: MensagemComunidade[], novas: MensagemComunidade[]) {
    return [...new Map([...atuais, ...novas].map((mensagem) => [mensagem.id, mensagem])).values()]
        .sort((a, b) => a.id - b.id);
}

export default function ChatComunidade({ comunidade, usuarioId, aoAtualizar, aoVoltar }: ChatComunidadeProps) {
    const [mensagens, setMensagens] = useState<MensagemComunidade[]>([]);
    const [texto, setTexto] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(comunidade.participa);
    const [historicoCarregado, setHistoricoCarregado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [entrando, setEntrando] = useState(false);
    const [carregandoAnteriores, setCarregandoAnteriores] = useState(false);
    const [temAnteriores, setTemAnteriores] = useState(false);
    const historicoRef = useRef<HTMLDivElement>(null);
    const manterFimRef = useRef(true);
    const alturaAnteriorRef = useRef<number | null>(null);
    const envioRef = useRef(false);
    const ativoRef = useRef(true);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        ativoRef.current = true;
        return () => { ativoRef.current = false; };
    }, []);

    useEffect(() => {
        if (!comunidade.participa) return;
        const abortar = new AbortController();
        let ultimaMensagem = 0;
        let inicial = true;
        let consultando = false;

        async function buscarMensagens() {
            if (consultando || abortar.signal.aborted) return;
            consultando = true;
            try {
                const consulta = inicial ? 'limite=50' : `depoisDe=${ultimaMensagem}&limite=100`;
                const resposta = await apiFetch(`/comunidades/${comunidade.id}/mensagens?${consulta}`, {
                    signal: abortar.signal
                });
                const dados = await lerResposta<MensagemComunidade[]>(resposta);
                if (abortar.signal.aborted) return;
                if (inicial) setTemAnteriores(dados.length === 50);
                ultimaMensagem = Math.max(ultimaMensagem, ...dados.map((mensagem) => mensagem.id));
                setMensagens((atuais) => mesclarMensagens(atuais, dados));
                setHistoricoCarregado(true);
                inicial = false;
                setErro('');
            } catch (falha) {
                if (!abortar.signal.aborted) setErro(falha instanceof Error ? falha.message : 'Erro ao carregar mensagens.');
            } finally {
                consultando = false;
                if (!abortar.signal.aborted) setCarregando(false);
            }
        }

        setCarregando(true);
        setHistoricoCarregado(false);
        void buscarMensagens();
        const intervalo = window.setInterval(() => {
            if (!document.hidden) void buscarMensagens();
        }, 3000);
        return () => {
            abortar.abort();
            window.clearInterval(intervalo);
        };
    }, [comunidade.id, comunidade.participa]);

    useLayoutEffect(() => {
        const historico = historicoRef.current;
        if (!historico) return;
        if (alturaAnteriorRef.current !== null) {
            historico.scrollTop += historico.scrollHeight - alturaAnteriorRef.current;
            alturaAnteriorRef.current = null;
        } else if (manterFimRef.current) {
            historico.scrollTop = historico.scrollHeight;
        }
    }, [mensagens]);

    async function entrar() {
        if (entrando) return;
        setEntrando(true);
        setErro('');
        try {
            const resposta = await apiFetch(`/comunidades/${comunidade.id}/entrar`, { method: 'POST' });
            const atualizada = await lerResposta<Comunidade>(resposta);
            if (ativoRef.current) aoAtualizar(atualizada);
        } catch (falha) {
            if (ativoRef.current) setErro(falha instanceof Error ? falha.message : 'Erro ao entrar na comunidade.');
        } finally {
            if (ativoRef.current) setEntrando(false);
        }
    }

    async function carregarAnteriores() {
        if (carregandoAnteriores || !mensagens.length) return;
        setCarregandoAnteriores(true);
        try {
            const resposta = await apiFetch(`/comunidades/${comunidade.id}/mensagens?antesDe=${mensagens[0].id}&limite=50`);
            const anteriores = await lerResposta<MensagemComunidade[]>(resposta);
            if (!ativoRef.current) return;
            alturaAnteriorRef.current = historicoRef.current?.scrollHeight ?? null;
            setMensagens((atuais) => mesclarMensagens(atuais, anteriores));
            setTemAnteriores(anteriores.length === 50);
        } catch (falha) {
            if (ativoRef.current) setErro(falha instanceof Error ? falha.message : 'Erro ao carregar o histórico.');
        } finally {
            if (ativoRef.current) setCarregandoAnteriores(false);
        }
    }

    async function enviar() {
        const conteudo = texto.trim();
        if (!conteudo || envioRef.current || !historicoCarregado || !comunidade.participa) return;
        envioRef.current = true;
        setEnviando(true);
        setErro('');
        try {
            const resposta = await apiFetch(`/comunidades/${comunidade.id}/mensagens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudo })
            });
            const mensagem = await lerResposta<MensagemComunidade>(resposta);
            if (!ativoRef.current) return;
            manterFimRef.current = true;
            setMensagens((atuais) => mesclarMensagens(atuais, [mensagem]));
            setTexto('');
        } catch (falha) {
            if (ativoRef.current) setErro(falha instanceof Error ? falha.message : 'Erro ao enviar mensagem.');
        } finally {
            envioRef.current = false;
            if (ativoRef.current) {
                setEnviando(false);
                window.requestAnimationFrame(() => inputRef.current?.focus());
            }
        }
    }

    const urlImagem = comunidade.imagem_comunidade;
    const imagem = urlImagem?.startsWith('http') ? urlImagem : urlImagem ? `${import.meta.env.VITE_API_URL}${urlImagem}` : undefined;

    return (
        <div className="comunidade-chat">
            <header className="comunidade-chat__cabecalho">
                <button type="button" className="comunidade-chat__voltar" onClick={aoVoltar} aria-label="Voltar para comunidades">←</button>
                <div className="comunidade-chat__avatar" aria-hidden="true">
                    {imagem ? <img src={imagem} alt="" /> : '👥'}
                </div>
                <div className="comunidade-chat__titulo">
                    <strong>{comunidade.nome_comunidade}</strong>
                    <span>{comunidade.totalParticipantes} {comunidade.totalParticipantes === 1 ? 'participante' : 'participantes'}</span>
                </div>
            </header>

            {erro && <p className="comunidade-chat__erro" role="alert">{erro}</p>}

            {!comunidade.participa ? (
                <div className="comunidade-chat__entrada">
                    <h2>{comunidade.nome_comunidade}</h2>
                    <p>{comunidade.descricao_comunidade}</p>
                    <button type="button" onClick={() => void entrar()} disabled={entrando}>
                        {entrando ? 'Entrando…' : 'Entrar na comunidade'}
                    </button>
                </div>
            ) : (
                <>
                    <div className="comunidade-chat__historico" ref={historicoRef} role="log" aria-label="Mensagens da comunidade" aria-busy={carregando}
                        onScroll={() => {
                            const historico = historicoRef.current;
                            if (historico) manterFimRef.current = historico.scrollHeight - historico.scrollTop - historico.clientHeight < 80;
                        }}>
                        {temAnteriores && <button className="comunidade-chat__anteriores" type="button" disabled={carregandoAnteriores} onClick={() => void carregarAnteriores()}>
                            {carregandoAnteriores ? 'Carregando…' : 'Carregar mensagens anteriores'}
                        </button>}
                        {carregando && <p className="comunidade-chat__aviso" role="status">Carregando mensagens…</p>}
                        {historicoCarregado && !mensagens.length && <p className="comunidade-chat__aviso">Envie a primeira mensagem da comunidade.</p>}
                        {mensagens.map((mensagem) => (
                            <article key={mensagem.id} className={`comunidade-chat__mensagem ${mensagem.remetente.id === usuarioId ? 'comunidade-chat__mensagem--minha' : ''}`}>
                                <strong>{mensagem.remetente.nome}</strong>
                                <p>{mensagem.conteudo}</p>
                                <time dateTime={mensagem.enviadaEm} title={new Date(mensagem.enviadaEm).toLocaleString('pt-BR')}>
                                    {new Date(mensagem.enviadaEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </time>
                            </article>
                        ))}
                    </div>
                    <form className="comunidade-chat__compositor" onSubmit={(evento) => { evento.preventDefault(); void enviar(); }}>
                        <textarea ref={inputRef} aria-label="Mensagem para a comunidade" placeholder="Digite uma mensagem…" maxLength={4000} rows={2}
                            value={texto} disabled={enviando} onChange={(evento) => setTexto(evento.target.value)}
                            onKeyDown={(evento) => {
                                if (evento.key === 'Enter' && !evento.shiftKey && !evento.nativeEvent.isComposing) {
                                    evento.preventDefault();
                                    void enviar();
                                }
                            }} />
                        <button type="submit" disabled={enviando || !historicoCarregado || !texto.trim()}>{enviando ? 'Enviando…' : 'Enviar'}</button>
                    </form>
                </>
            )}
        </div>
    );
}
