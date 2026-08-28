// Exibe um resumo geral das informações administrativas.
import { useEffect, useMemo, useState, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
import gsap from 'gsap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartData,
    type ChartOptions,
    BarElement,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

type MesLogin = {
    mes: number;
    nome: string;
    quantidade: number;
};

type RespostaLoginsMensais = {
    ano: number;
    meses: MesLogin[];
};

type QuantUsuarioCategoria = {
    tipo_usuario: "admin" | "user" | "funcionario" | "superAdmin";
    _count: {
        id: number;
    };
};

interface CounterProps {
    endValue: number;
    duration?: number;
}

export const NumberCounter: React.FC<CounterProps> = ({ endValue, duration = 2 }) => {
    const numberRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = numberRef.current;
        if (!element) return;

        // Objeto proxy para o GSAP animar o valor numérico
        const proxy = { val: 0 };

        const tween = gsap.to(proxy, {
        val: endValue,
        duration: duration,
        ease: 'power1.out',
        onUpdate: () => {
            // Atualiza o textContent diretamente no DOM a cada frame
            element.textContent = Math.round(proxy.val).toLocaleString('pt-BR');
        },
        });

        return () => {
        tween.kill(); // Limpa a animação ao desmontar o componente
        };
    }, [endValue, duration]);

    return <strong ref={numberRef}>0</strong>;
}

const opcoesLogin: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // Permite que o gráfico use toda a altura do container pai
    animations: {
        tension: {
            duration: 1000,
            easing: "easeOutQuart",
            from: .6,
            to: 0,
            loop: true         
        },
    },
    plugins: {
        legend: {
            position: "top", // Posição da legenda ('top', 'bottom', 'left', 'right')
        },
        tooltip: {
            enabled: true, // Ativa os balões com informações ao passar o mouse
            callbacks: {
                label: (contexto) => `${contexto.parsed.y} login${contexto.parsed.y === 1 ? "" : "s"}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true, // Garante que o eixo vertical comece sempre no número 0
            ticks: {
                precision: 0,
            },
            title: {
                display: true,
                text: "Quantidade de logins",
            },
        },
    },
};

const opcoesUsuarios: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: {
            position: "top"
        },

        tooltip: {
            enabled: true
        }
    },

    scales: {
        y: {
            beginAtZero: true,

            ticks: {
                precision: 0
            },

            title: {
                display: true,
                text: "Quantidade de usuários"
            }
        }
    }
};

function VisaoGeral() {
    const [resultado, setResultado] = useState<RespostaLoginsMensais | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [quantUsuarios, setQuantUsuarios] = useState(0);
    const [quantSetores, setQuantSetores] = useState(0);
    const [quantSecretarias, setQuantSecretarias] = useState(0);
    const [quantUsuariosCategoria, setQuantUsuariosCategoria] = useState<QuantUsuarioCategoria[]>([]);
    const [erro, setErro] = useState("");
    const anoAtual = Number(
        new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
        }).format(new Date()),
    );

    useEffect(() => {
        const controlador = new AbortController();

        async function carregarLoginsMensais() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                setErro("Sessão expirada. Entre novamente para consultar os dados.");
                setCarregando(false);
                return;
            }

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/logins-por-mes?ano=${anoAtual}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controlador.signal,
                    },
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível consultar os logins mensais.");
                }

                const dados = await resposta.json() as RespostaLoginsMensais;
                setResultado(dados);
                setErro("");
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                setErro("Não foi possível carregar a quantidade de logins.");
            } finally {
                if (!controlador.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        void carregarLoginsMensais();

        return () => controlador.abort();
    }, [anoAtual]);

    useEffect(() => {
        async function carregarQuantUsuarios() {
            const token = localStorage.getItem("access_token");

            if (!token) return;

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/quantidade-usuarios`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível buscar os usuários.");
                }

                const total: number = await resposta.json();
                setQuantUsuarios(total);
            } catch (erro) {
                console.error("Erro ao buscar quantidade de usuários:", erro);
            }
        }

        void carregarQuantUsuarios();
    }, []);

    useEffect(() => {
        async function carregarQuantSecretarias() {
            try {
                const token = localStorage.getItem("access_token");
                const resposta = await fetch(`${import.meta.env.VITE_API_URL}/secretaria`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (!resposta.ok) {
                    throw new Error("Não foi possível buscar as secretarias.");
                }

                const secretaria = await resposta.json() as unknown[];
                setQuantSecretarias(secretaria.length);
            } catch (erro) {
                console.error("Erro ao buscar quantidade de secretarias:", erro);
            }
        }

        void carregarQuantSecretarias();
    }, []);

    useEffect(() => {
        async function carregarQuantSetores() {
            try {
                const token = localStorage.getItem("access_token");
                const resposta = await fetch(`${import.meta.env.VITE_API_URL}/setores`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (!resposta.ok) {
                    throw new Error("Não foi possível buscar os setores.");
                }

                const setores = await resposta.json() as unknown[];
                setQuantSetores(setores.length);
            } catch (erro) {
                console.error("Erro ao buscar quantidade de setores:", erro);
            }
        }

        void carregarQuantSetores();
    }, []);

    useEffect(() => {
        async function carregarQuantUsuariosCategoria() {
            const token = localStorage.getItem("access_token");

            if (!token) return;

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/quantidade-usuarios-categoria`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    },
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível buscar os usuários.");
                }

                const dados = await resposta.json() as QuantUsuarioCategoria[];
                setQuantUsuariosCategoria(dados);
            } catch (erro) {
                console.log("Erro ao buscar quantidade de usuarios po categoria:", erro);
            }
        }

        void carregarQuantUsuariosCategoria();
    }, []);

    function obterQuantidadeCategoria(
        tipo: QuantUsuarioCategoria["tipo_usuario"],
    ) {
        return quantUsuariosCategoria.find(
            (categoria) => categoria.tipo_usuario === tipo,
        )?._count.id ?? 0;
    }

    const dadosLogin = useMemo<ChartData<"line">>(() => ({
        labels: resultado?.meses.map((mes) => mes.nome) ?? [],
        datasets: [
            {
                label: `Logins em ${resultado?.ano ?? anoAtual}`, //Título da legenda
                data: resultado?.meses.map((mes) => mes.quantidade) ?? [], //Eixo Y (valores numéricos)
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.18)",
                fill: true, //Define se a área sob a linha deve ser preenchida
                tension: 0.3, //Curvatura da linha (0 = linhas retas, valores maiores = mais curvas)
                pointRadius: 5, //Tamanho dos pontos nos nós dos dados
                pointHoverRadius: 7, //Tamanho do ponto quando o mouse passa por cima
            },
        ],
    }), [anoAtual, resultado]);

    const dadosUsuarios: ChartData<"bar"> = {
        labels: [
            "Super Administrador",
            "Administrador",
            "Usuário",
            "Funcionário"
        ],

        datasets: [
            {
                label: "Super administradores",

                data: [
                    obterQuantidadeCategoria("superAdmin"), //super admin
                    null,     // Admin
                    null,  // Usuário
                    null   // Funcionário
                ],

                backgroundColor: "rgba(52, 99, 175, 0.25)",
                borderColor: "rgb(52, 99, 175)",
                borderWidth: 1,
                borderRadius: 6,
                skipNull: true
            },
            {
                label: "Administradores",

                data: [
                    null,  // super admin
                    obterQuantidadeCategoria("admin"),     // Admin
                    null,  // Usuário
                    null   // Funcionário
                ],

                backgroundColor: "rgba(175, 122, 52, 0.25)",
                borderColor: "rgb(175, 111, 52)",
                borderWidth: 1,
                borderRadius: 6,
                skipNull: true
            },
            {
                label: "Usuários",

                data: [
                    null,  //super admin
                    null,  // Admin
                    obterQuantidadeCategoria("user"),     // Usuário
                    null   // Funcionário
                ],

                backgroundColor: "rgba(187, 17, 17, 0.25)",
                borderColor: "rgb(187, 17, 17)",
                borderWidth: 1,
                borderRadius: 6,
                skipNull: true
            },
            {
                label: "Funcionários",

                data: [
                    null,  //super admin
                    null,  // Admin
                    null,  // Usuário
                    obterQuantidadeCategoria("funcionario")   // Funcionário
                ],

                backgroundColor: "rgba(26, 151, 10, 0.25)",
                borderColor: "rgb(26, 151, 10)",
                borderWidth: 1,
                borderRadius: 6,
                skipNull: true
            }
        ]
    };

    return (
        <>
            <div className="container-cards">
                <div className="cards card-usuarios">
                    <div className="icone-card">
                        <svg width="24" height="24" fill="currentColor" className="icone bi bi-people" viewBox="0 0 16 16">
                            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                        </svg>
                    </div>
                    <div className="info-cards">
                        <small>USUÁRIOS</small>
                        <NumberCounter endValue={quantUsuarios} />
                    </div>
                </div>

                <div className="cards card-setores">
                    <div className="icone-card">
                        <svg width="24" height="24" fill="white" className="bi bi-building" viewBox="0 0 16 16">
                            <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
                            <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z"/>
                        </svg>
                    </div>
                    <div className="info-cards">
                        <small>SECRETARIAS</small>
                        <NumberCounter endValue={quantSecretarias} />
                    </div>
                </div>

                <div className="cards card-setores">
                    <div className="icone-card">
                        <svg width="24" height="24" fill="currentColor" className="icone bi bi-buildings" viewBox="0 0 16 16">
                            <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
                            <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z"/>
                        </svg>
                    </div>
                    <div className="info-cards">
                        <small>SETORES</small>
                        <NumberCounter endValue={quantSetores} />
                    </div>
                </div>
            </div>

            <div className="grafico-card">
                <div className="grafico-card-header">
                    <div>
                        <span className="grafico-card-legenda">ACESSOS AO SISTEMA</span>
                        <h2>Logins mensais</h2>
                    </div>
                    <strong>{resultado?.ano ?? anoAtual}</strong>
                </div>

                {carregando && <p className="grafico-status">Carregando dados do gráfico...</p>}
                {erro && <p className="grafico-status grafico-status-erro" role="alert">{erro}</p>}

                {!carregando && !erro && (
                    <div className="grafico-container">
                        <Line data={dadosLogin} options={opcoesLogin} />
                    </div>
                )}
            </div>

            <div className="grafico-card grafico-card--usuarios">
                <div className="grafico-card-header">
                    <div>
                        <span className="grafico-card-legenda">
                            TOTAL DE USUÁRIOS
                        </span>

                        <h2>Categorias de usuários</h2>
                    </div>

                    <NumberCounter endValue={quantUsuarios}/>
                </div>

                <div className="grafico-container grafico-container--barras">
                    <Bar
                        data={dadosUsuarios}
                        options={opcoesUsuarios}
                    />
                </div>
            </div>
        </>
    );
}

export default VisaoGeral;
