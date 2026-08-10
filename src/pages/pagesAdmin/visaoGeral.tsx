import { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
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
            "Admin",
            "Usuário",
            "Funcionário"
        ],

        datasets: [
            {
                label: "Administradores",

                data: [
                    2,     // Admin
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
                label: "Usuários",

                data: [
                    null,  // Admin
                    4,     // Usuário
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
                    null,  // Admin
                    null,  // Usuário
                    10     // Funcionário
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

                    <strong>16</strong> {/*alterar após pegar a quantidade certa de usuarios*/}
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
