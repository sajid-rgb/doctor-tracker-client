'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import '@/components/dashboard/chartConfig';
import { PALETTE } from '@/components/dashboard/chartConfig';
import { Stethoscope } from 'lucide-react';

const SpecializationDoughnutChart = ({ data = [] }) => {
  const totalDoctors = useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((acc, curr) => acc + (Number(curr?.count) || 0), 0);
  }, [data]);

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const labels = data.map((item) => item?.specialization || 'General');
    const counts = data.map((item) => Number(item?.count) || 0);
    const backgroundColors = data.map((_, i) => PALETTE[i % PALETTE.length]);

    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
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
          callbacks: {
            label: (context) => {
              const val = context.parsed;
              const percent = totalDoctors > 0 ? ((val / totalDoctors) * 100).toFixed(0) : 0;
              return ` ${val} doctor${val === 1 ? '' : 's'} (${percent}%)`;
            },
          },
        },
      },
    }),
    [totalDoctors]
  );

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Specialization Distribution
            </h3>
            <p className="text-[11px] text-slate-500">
              Doctor ratio across medical fields
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {data.length} Department{data.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-4 flex-1 flex flex-col justify-center">
        {chartData ? (
          <div className="flex flex-col sm:flex-row items-center justify-around gap-5 sm:gap-6">
            <div className="relative h-44 w-44 sm:h-48 sm:w-48 shrink-0">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalDoctors}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Doctors
                </span>
              </div>
            </div>

            <div className="flex-1 w-full max-h-44 sm:max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {data.map((item, idx) => {
                const count = Number(item?.count) || 0;
                const percent = totalDoctors > 0 ? ((count / totalDoctors) * 100).toFixed(0) : 0;
                const color = PALETTE[idx % PALETTE.length];

                return (
                  <div
                    key={item?.specialization || idx}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                        {item?.specialization || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {count}
                      </span>
                      <span className="text-[10px] text-slate-400 w-8 text-right font-mono">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Stethoscope className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              No doctor specializations recorded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecializationDoughnutChart;
