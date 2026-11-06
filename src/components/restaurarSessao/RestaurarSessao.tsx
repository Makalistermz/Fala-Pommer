
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import "./restaurarSessao.css"
import brasao from "../../assets/img/brasao.webp"
import { obterTemaAparencia } from '../../library/temaAparencia';

/*
  Tela de restauração de sessão do Fala Pommer.

  Props
  - pronto:     true quando a restauração terminou (ex.: !carregando do seu contexto de login)
  - onConcluir: chamada quando a animação de saída termina; use para desmontar o componente
  - minMs:      tempo mínimo na tela (padrão 3200 ms)

  Uso
    const { carregando } = useAuth();
    const [splash, setSplash] = useState(true);

    {!carregando && <Rotas />}
    {splash && <RestaurarSessao pronto={!carregando} onConcluir={() => setSplash(false)} />}

  A tela real do app monta por baixo assim que `pronto` vira true, então a cortina de saída revela o app.
*/

const ITENS = ['conversas', 'grupos', 'não lidas', 'contatos', 'anexos', 'rascunhos', 'notificações', 'quem está online'];
const CORES = ['#CFE0FF', '#DDD8FF', '#BDF2DE', '#FFD2E1', '#A9D4FF'];
const CORESDARKMODE = ['#A9C2EC', '#B9B3E6', '#94D6BC', '#E5A9BE', '#85B6E6'];
const NTIRAS = 6;

interface TituloProps {
    linhas: string[];
    parado: boolean;
}

interface RestaurarSessaoProps {
    pronto?: boolean;
    onConcluir?: () => void;
    minMs?: number;
}

interface Balao {
    el: HTMLElement;
    at: number;
    colocado: boolean;
    fx: number;
    fy: number;
    rot: number;
}

function Titulo({ linhas, parado }: TituloProps) {
    let n = 0;

    return (
        <h1 className={`rs-h1${parado ? ' rs-still' : ''}`} aria-label={linhas.join(' ')}>
        {linhas.map((linha, li) => (
            <span key={li} className={`rs-l rs-l${li + 1}`} aria-hidden="true">
            {linha.split(' ').map((palavra, wi, arr) => (
                <span key={wi}>
                <span className="rs-word">
                    {Array.from(palavra).map((c, ci) => (
                    <span key={ci} className="rs-ch" style={{ '--i': String(n++) } as React.CSSProperties}>{c}</span>
                    ))}
                </span>
                {wi < arr.length - 1 ? ' ' : null}
                </span>
            ))}
            </span>
        ))}
        </h1>
    );
}

function RestaurarSessao({
    return (
        <section
            ref={raiz}
            className={`rs-root${reduzir ? ' rs-rm' : ''}`}
            aria-label="Restaurando sessão"
            aria-busy={!concluida}
        >
            <div className="rs-strips rs-y" aria-hidden="true">
                {Array.from({ length: NTIRAS }, (_, i) => (
                    <i key={i} />
                ))}
            </div>

            <div className="rs-strips rs-b" aria-hidden="true">
                {Array.from({ length: NTIRAS }, (_, i) => (
                    <i key={i} />
                ))}
            </div>

            <div className="rs-content" ref={conteudo}>
                <div className="rs-hud rs-pad">
                    <span className="rs-brand">
                        <span className="rs-brand-mark" aria-hidden="true">
                            <img src={brasao} alt="" />
                        </span>
                        Fala Pommer
                    </span>

                    <span className="rs-hud-right">
                        <span className="rs-status">
                            <span className={`rs-typing${concluida ? ' rs-done' : ''}`} aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </span>
                            <span>{concluida ? 'Pronto' : 'Restaurando'}</span>
                        </span>

                        <span className="rs-timer">
                            <span>tempo</span>
                            <b ref={tempo} />
                        </span>
                    </span>
                </div>

                <div className="rs-head rs-pad">
                    <Titulo
                        linhas={concluida ? ['Sessão', 'restaurada!'] : ['Restaurando', 'sua sessão']}
                        parado={concluida}
                    />
                </div>

                <div className="rs-band" aria-hidden="true">
                    <div className="rs-band-track">
                        <span>
                            Acordando o servidor com um cafézinho • Procurando suas conversas • Chamando o pessoal do grupo • Tirando o digitando… do vácuo • Conferindo quem está online • Sacudindo as mensagens não lidas • Avisando que você voltou •
                        </span>
                        <span>
                            Acordando o servidor com um cafézinho • Procurando suas conversas • Chamando o pessoal do grupo • Tirando o digitando… do vácuo • Conferindo quem está online • Sacudindo as mensagens não lidas • Avisando que você voltou •
                        </span>
                    </div>
                </div>

                <div className="rs-foot rs-pad">
                    <div className="rs-tray-wrap">
                        <p className="rs-tray-label">
                            recolocando tudo no lugar · <span ref={contagem} />
                        </p>

                        <div className="rs-tray">
                            {ITENS.map((t, i) => (
                                <span
                                key={t}
                                className="rs-chip"
                                style={{ background: obterTemaAparencia() === 'escuro' ? CORESDARKMODE[i % CORESDARKMODE.length] : CORES[i % CORES.length] }}
                                >
                                    <span className="rs-ck" aria-hidden="true">
                                        <svg viewBox="0 0 18 14">
                                        <path className="rs-t1" d="M1.5 7.5 L5 11 L11.5 3.5" />
                                        <path className="rs-t2" d="M6 7.5 L9.5 11 L16 3.5" />
                                        </svg>
                                    </span>
                                    <span>{t}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        ref={barra}
                        className="rs-counter"
                        role="progressbar"
                        aria-label="Progresso da restauração"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={0}
                    >
                        <span className="rs-num" ref={numero} />
                        <span className="rs-pc" aria-hidden="true">
                        %
                        </span>
                    </div>
                </div>
            </div>

            <p className="rs-sr" role="status">
                {concluida ? 'Sessão restaurada.' : 'Restaurando sua sessão.'}
            </p>
        </section>
    );
}

export default RestaurarSessao;