'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import '@/components/dashboard/chartConfig';
import { Users, BarChart3 } from 'lucide-react';

const DoctorCaseloadBarChart = ({
  patientsPerDoctor = [],
  doctorsList = [],
}) => {
  const doctorMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(doctorsList)) {
      doctorsList.forEach((doc) => {
        if (doc?._id) map.set(doc._id, doc);
      });
    }
    return map;
  }, [doctorsList]);

  const { chartData, maxCaseload } = useMemo(() => {
    if (!Array.isArray(patientsPerDoctor) || patientsPerDoctor.length === 0) {
      return { chartData: null, maxCaseload: 0 };
    }

    const topDoctors = patientsPerDoctor.slice(0, 8);

    const labels = topDoctors.map((item) => {
      if (item?.doctorName) return item.doctorName;
      if (!item?.doctorId) return 'Unassigned';
      const doc = doctorMap.get(item.doctorId);
      return doc?.name || `Doctor #${String(item.doctorId).slice(-4)}`;
    });

    const counts = topDoctors.map((item) => Number(item?.count) || 0);
    const maxVal = Math.max(...counts, 0);

    const data = {
      labels,
      datasets: [
        {
          label: 'Assigned Patients',
          data: counts,
          backgroundColor: '#2563eb',
          hoverBackgroundColor: '#1d4ed8',
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 16,
        },
      ],
    };

    return { chartData: data, maxCaseload: maxVal };
  }, [patientsPerDoctor, doctorMap]);

  const chartOptions = useMemo(
    () => ({
      indexAxis: 'y', 
      responsive: true,
      maintainAspectRatio: false,
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
            label: (context) => ` ${context.parsed.x} patient${context.parsed.x === 1 ? '' : 's'} assigned`,
          },
        },
      },
      scales: {
        x: {
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
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#64748b',
            font: { size: 11, weight: '500' },
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Patient Caseload by Clinician
            </h3>
            <p className="text-[11px] text-slate-500">
              Active patient load distribution among doctors
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Peak Load: {maxCaseload} pts
        </span>
      </div>

      <div className="mt-4 flex-1 min-h-[260px] relative">
        {chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              No patients assigned to doctors yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCaseloadBarChart;
