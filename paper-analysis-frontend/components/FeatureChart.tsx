import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { VisualizationData } from "@/types/paper";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Word Frequency Analysis",
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"bar">) => {
          const label = context.dataset.label || "";
          const percentage = context.raw || 0;
          return `${label}: ${percentage}%`;
        },
      },
    },
  },
  scales: {
    y: {
      type: "linear" as const,
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: "Percentage (%)",
      },
      ticks: {
        callback: function (tickValue: number | string) {
          return `${tickValue}%`;
        },
      },
    },
    x: {
      title: {
        display: true,
        text: "Words",
      },
    },
  },
};

interface FeatureChartProps {
  data: VisualizationData;
}

export default function FeatureChart({ data }: FeatureChartProps) {
  // Only show top 15 words for better visualization
  const topWords = data.labels.slice(0, 15);
  const topPercentages = data.percentages.slice(0, 15);

  const chartData = {
    labels: topWords,
    datasets: [
      {
        label: "Word Frequency",
        data: topPercentages,
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full h-[400px]">
      <Bar options={options} data={chartData} />
    </div>
  );
}
