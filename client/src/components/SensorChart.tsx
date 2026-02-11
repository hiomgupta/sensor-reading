import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataPoint } from "@/hooks/use-bluetooth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorChartProps {
  dataPoints: DataPoint[];
  parameterId: string;
  parameterName: string;
  unit: string;
}

export function SensorChart({ dataPoints, parameterId, parameterName, unit }: SensorChartProps) {
  // 4J. Visualization Performance: Filter points for this parameter
  // In real systems with 50Hz data, we'd downsample here.
  const filteredPoints = dataPoints
    .filter(p => p.parameter === parameterId)
    .slice(-50); // Show last 50 points for visualization stability

  const data = {
    labels: filteredPoints.map(p => new Date(p.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${parameterName} (${unit})`,
        data: filteredPoints.map(p => p.value),
        borderColor: parameterId === 'temp' ? 'rgb(239, 68, 68)' : parameterId === 'hum' ? 'rgb(59, 130, 246)' : 'rgb(139, 92, 246)',
        backgroundColor: parameterId === 'temp' ? 'rgba(239, 68, 68, 0.5)' : parameterId === 'hum' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(139, 92, 246, 0.5)',
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // 1B. Performance: Disable animations for high-frequency updates
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: unit
        }
      },
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  };

  return (
    <Card className="w-full h-[300px] border-border/50 shadow-sm overflow-visible">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{parameterName} History</CardTitle>
        <span className="text-[10px] text-muted-foreground">Last 50 samples</span>
      </CardHeader>
      <CardContent className="h-[220px] pb-6">
        <Line options={options} data={data} />
      </CardContent>
    </Card>
  );
}
