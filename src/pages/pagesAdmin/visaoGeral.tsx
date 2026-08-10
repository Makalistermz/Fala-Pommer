import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
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
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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

const opcoes: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
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
            position: "top",
        },
        tooltip: {
            enabled: true,
            callbacks: {
                label: (contexto) => `${contexto.parsed.y} login${contexto.parsed.y === 1 ? "" : "s"}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
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

    const dados = useMemo<ChartData<"line">>(() => ({
        labels: resultado?.meses.map((mes) => mes.nome) ?? [],
        datasets: [
            {
                label: `Logins em ${resultado?.ano ?? anoAtual}`,
                data: resultado?.meses.map((mes) => mes.quantidade) ?? [],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.18)",
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    }), [anoAtual, resultado]);

    return (
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
                    <Line data={dados} options={opcoes} />
                </div>
            )}
        </div>
    );
}

export default VisaoGeral;
