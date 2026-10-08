import { cookies } from 'next/headers';
import { Suspense } from 'react';
import DashboardClientView from '@/components/dashboard/DashboardClientView';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export const metadata = {
  title: 'Clinical Operations Dashboard',
  description: 'Hospital overview, patient enrollment timelines, and doctor caseload analytics',
};

const fetchDashboardData = async () => {
  const baseUrl = (
    process.env.API_URL 
  ).replace(/\/$/, '');

  let stats = {
    summary: { totalDoctors: 0, totalPatients: 0, averagePatientPerDoctor: 0 },
    patientsPerDoctor: [],
    dateBasedStats: [],
    specializationDistribution: [],
  };
  let doctors = [];
  let error = null;

  let token = null;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  } catch {
  }

  if (!token) {
    return { stats, doctors, error: null };
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const [statsRes, doctorsRes] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/stats`, {
        headers,
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/doctors`, {
        headers,
        cache: 'no-store',
      }),
    ]);

    if (statsRes.ok) {
      const statsJson = await statsRes.json();
      const payload = statsJson?.data?.data || statsJson?.data || statsJson;
      if (payload) {
        stats = {
          summary: {
            totalDoctors: payload.summary?.totalDoctors ?? 0,
            totalPatients: payload.summary?.totalPatients ?? 0,
            averagePatientPerDoctor: payload.summary?.averagePatientPerDoctor ?? 0,
          },
          patientsPerDoctor: Array.isArray(payload.patientsPerDoctor)
            ? payload.patientsPerDoctor
            : [],
          dateBasedStats: Array.isArray(payload.dateBasedStats)
            ? payload.dateBasedStats
            : [],
          specializationDistribution: Array.isArray(payload.specializationDistribution)
            ? payload.specializationDistribution
            : [],
        };
      }
    } else {
      const errJson = await statsRes.json().catch(() => ({}));
      error = errJson.message || 'Unable to load dashboard statistics from backend.';
    }

    if (doctorsRes.ok) {
      const docJson = await doctorsRes.json();
      const docs = docJson?.data?.data || docJson?.data || (Array.isArray(docJson) ? docJson : []);
      if (Array.isArray(docs)) {
        doctors = docs;
      }
    }
  } catch (err) {
    console.error('Error fetching dashboard data on server:', err);
    error = err.message || 'Failed to connect to backend server.';
  }

  return { stats, doctors, error };
};

const DashboardDataLoader = async () => {
  const { stats, doctors, error } = await fetchDashboardData();

  return (
    <DashboardClientView
      initialStats={stats}
      initialDoctors={doctors}
      initialError={error}
    />
  );
};

const DashboardPage = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataLoader />
    </Suspense>
  );
};

export default DashboardPage;
