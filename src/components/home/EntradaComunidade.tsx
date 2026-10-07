import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../services/api';
import type { Comunidade } from './Comunidades';
import './EntradaComunidade.css';

interface EntradaComunidadeProps {
    comunidade: Comunidade;
    aoAtualizar: (comunidade: Comunidade) => void;
    aoVoltar: () => void;
}

// Esta tela cuida apenas da entrada; o histórico e o envio pertencem ao ChatConversa.
export default function EntradaComunidade({ comunidade, aoAtualizar, aoVoltar }: EntradaComunidadeProps) {
    const [entrando, setEntrando] = useState(false);
    const [erro, setErro] = useState('');
    const ativoRef = useRef(true);

    useEffect(() => {
        ativoRef.current = true;
        return () => { ativoRef.current = false; };
    }, []);

    async function entrar() {
        if (entrando) return;
        setEntrando(true);
        setErro('');

        try {
            // Registra a participação antes de abrir a conversa com os recursos completos.
            const resposta = await apiFetch(`/comunidades/${comunidade.id}/entrar`, { method: 'POST' });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(Array.isArray(dados.message) ? dados.message.join(' ') : dados.message ?? 'Não foi possível entrar na comunidade.');
            }

            if (ativoRef.current) aoAtualizar(dados as Comunidade);

        } catch (falha) {

            if (ativoRef.current) setErro(falha instanceof Error ? falha.message : 'Erro ao entrar na comunidade.');

        } finally {
            if (ativoRef.current) setEntrando(false);
        }
    }

    const imagem = comunidade.imagem_comunidade;
    const urlImagem = imagem && (/^https?:\/\//i.test(imagem) ? imagem : `${import.meta.env.VITE_API_URL}${imagem}`);

    return (
        <div className="comunidade-entrada">
            <header className="chat-header">
                <div className="chat-header__usuario">
                    <button type="button" className="chat-header__voltar" onClick={aoVoltar} aria-label="Voltar para as comunidades">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="chat-header__avatar" aria-hidden="true">
                        {urlImagem ? <img src={urlImagem} alt="" /> : '👥'}
                    </div>
                    <div className="chat-header__dados">
                        <strong>{comunidade.nome_comunidade}</strong>
                        <span>{comunidade.totalParticipantes} participantes</span>
                    </div>
                </div>
            </header>
            
            <div className="mensagens comunidade-entrada__conteudo">
                <div className="comunidade-entrada__cartao">
                    <h2>{comunidade.nome_comunidade}</h2>
                    <p>{comunidade.descricao_comunidade}</p>
                    {comunidade.participa ? (
                        <>
                            <p role="status">Abrindo o chat da comunidade…</p>
                            <button type="button" onClick={() => aoAtualizar(comunidade)}>Tentar abrir novamente</button>
                        </>
                    ) : (
                        <button type="button" onClick={() => void entrar()} disabled={entrando}>
                            {entrando ? 'Entrando…' : 'Entrar na comunidade'}
                        </button>
                    )}
                    {erro && <p role="alert">{erro}</p>}
                </div>
            </div>
        </div>
    );
}
