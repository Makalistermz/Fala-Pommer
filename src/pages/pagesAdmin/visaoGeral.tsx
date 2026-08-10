import { Line } from 'react-chartjs-2';

// Importar os módulos necessários do núcleo do Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Opcional: Necessário apenas se quiser preencher a área sob a linha
} from 'chart.js';

// Registrar os módulos importados (Obrigatório no Chart.js moderno)
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function VisaoGeral() {
    // Estrutura de Dados do Gráfico
    const dados = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'], // Eixo X
        datasets: [
            {
                label: 'Quantidades de login no mês', // Título da legenda
                data:[4, 8, 6, 12, 10, 15], // Eixo Y (valores numéricos)
                borderColor: 'rgb(59, 130, 246)', // Cor da linha (Azul)
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Cor do preenchimento sob a linha
                fill: true, // Define se a área sob a linha deve ser preenchida
                tension: 0.3, // Curvatura da linha (0 = linhas retas, valores maiores = mais curvas)
                pointRadius: 5, // Tamanho dos pontos nos nós dos dados
                pointHoverRadius: 7, // Tamanho do ponto quando o mouse passa por cima
            },
        ],
    };

    //Configurações de Customização (Opcional, mas altamente recomendado)
    const opcoes = {
        responsive: true,
        maintainAspectRatio: false, // Permite que o gráfico use toda a altura do container pai
        plugins: {
            legend: {
                position: 'top', // Posição da legenda ('top', 'bottom', 'left', 'right')
            },
            tooltip: {
                enabled: true, // Ativa os balões com informações ao passar o mouse
            },
        },
        scales: {
            y: {
                beginAtZero: true, // Garante que o eixo vertical comece sempre no número 0
            },
        },
    };

    return (
        <>
            {/*Definimos a altura no elemento pai para controlar o tamanho do gráfico*/}
            <div className="grafico-card">
                <h2>Desempenho Comercial</h2>

                <div className="grafico-container">
                    <Line data={dados} options={opcoes} />
                </div>
            </div>
        </>
    )
}

export default VisaoGeral;