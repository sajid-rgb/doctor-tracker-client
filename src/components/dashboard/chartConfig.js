'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const CHART_COLORS = {
  primary: '#2563eb',
  primaryLight: 'rgba(37, 99, 235, 0.08)',
  secondary: '#0f766e', 
  secondaryLight: 'rgba(15, 118, 110, 0.08)',
  emerald: '#059669',
  emeraldLight: 'rgba(5, 150, 105, 0.08)',
  amber: '#d97706',
  amberLight: 'rgba(217, 119, 6, 0.08)',
  rose: '#e11d48',
  roseLight: 'rgba(225, 29, 72, 0.08)',
  indigo: '#4f46e5',
  indigoLight: 'rgba(79, 70, 229, 0.08)',
};

export const PALETTE = [
  '#2563eb', 
  '#0f766e', 
  '#4f46e5', 
  '#059669', 
  '#d97706', 
  '#7c3aed', 
  '#e11d48', 
  '#0284c7', 
  '#475569', 
  '#ca8a04', 
];

export default ChartJS;
