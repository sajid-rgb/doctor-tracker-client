'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import '@/components/dashboard/chartConfig';
import { Calendar, TrendingUp } from 'lucide-react';

const PatientTimelineChart = ({ data = [] }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const labels = data.map((item) => {
      if (!item?.date) return 'Unknown';
      try {
        const parts = item.date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return item.date;
      } catch {
        return item.date;
      }
    });

    const values = data.map((item) => Number(item?.count) || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Patients Enrolled',
          data: values,
          borderColor: '#2563eb', 
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#1d4ed8',
          pointHoverBorderColor: '#ffffff',
        },
      ],
    };
  }, [data]);

  const totalEnrolled = useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((acc, curr) => acc + (Number(curr?.count) || 0), 0);
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: (context) => ` ${context.parsed.y} patient${context.parsed.y === 1 ? '' : 's'} registered`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            precision: 0,
            stepSize: 1,
          },
        },
      },
    }),
    []
  );

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Patient Registration Timeline
            </h3>
            <p className="text-[11px] text-slate-500">
              Daily patient registration frequency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>{totalEnrolled} Records (30d)</span>
        </div>
      </div>

      <div className="mt-4 flex-1 min-h-[260px] relative">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              No historical patient registrations found yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientTimelineChart;
