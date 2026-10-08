'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Users,
  Activity,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { getDashboardStats, getDoctors } from '@/lib/api-client';
import PatientTimelineChart from '@/components/dashboard/PatientTimelineChart';
import SpecializationDoughnutChart from '@/components/dashboard/SpecializationDoughnutChart';
import DoctorCaseloadBarChart from '@/components/dashboard/DoctorCaseloadBarChart';
import AddDoctorModal from '@/components/doctors/AddDoctorModal';
import AddPatientModal from '@/components/patients/AddPatientModal';

const DashboardClientView = ({
  initialStats = {
    summary: { totalDoctors: 0, totalPatients: 0, averagePatientPerDoctor: 0 },
    patientsPerDoctor: [],
    dateBasedStats: [],
    specializationDistribution: [],
  },
  initialDoctors = [],
  initialError = null,
}) => {
  const [stats, setStats] = useState(initialStats);
  const [doctorsList, setDoctorsList] = useState(initialDoctors);
  const [error, setError] = useState(initialError);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const refreshData = useCallback(async () => {
    setError(null);

    try {
      const [statsRes, doctorsRes] = await Promise.all([
        getDashboardStats(),
        getDoctors(),
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        const payload = statsJson?.data;
        if (payload) {
          setStats({
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
          });
        }
      } else {
        const errJson = await statsRes.json().catch(() => ({}));
        setError(errJson.message || 'Unable to refresh dashboard statistics.');
      }

      if (doctorsRes.ok) {
        const docJson = await doctorsRes.json();
        const docs = docJson?.data?.data || docJson?.data || (Array.isArray(docJson) ? docJson : []);
        if (Array.isArray(docs)) {
          setDoctorsList(docs);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server.');
    }
  }, []);

  const handleDataUpdated = () => {
    refreshData();
  };

  const { summary, dateBasedStats, specializationDistribution, patientsPerDoctor } = stats;

  const doctorSpecializations = Array.from(
    new Set(doctorsList.map((d) => d.specialization).filter(Boolean))
  );
  const doctorHospitals = Array.from(
    new Set(doctorsList.map((d) => d.hospital).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Clinical Operations &bull; Real-time Overview
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hospital Operations Dashboard
            </h1>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm max-w-2xl">
              Monitor doctors, daily patient registration velocity, and departmental caseload distributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">

            <button
              type="button"
              onClick={() => setIsAddDoctorOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddPatientOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/doctors"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Doctors
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform dark:bg-blue-950/50 dark:text-blue-400">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.totalDoctors}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Active Staff
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Specialists &amp; Clinicians</span>
            <ArrowRight className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </Link>

        <Link
          href="/patients"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Patients
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform dark:bg-indigo-950/50 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.totalPatients}
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Registered
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Clinical Records Database</span>
            <ArrowRight className="h-3.5 w-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Patients / Doctor
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.averagePatientPerDoctor}
            </span>
            <span className="text-xs font-medium text-slate-500">
              pts / clinician
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Caseload distribution ratio
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Departments
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {specializationDistribution.length}
            </span>
            <span className="text-xs font-medium text-indigo-600">
              Specialties
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Clinical specialties covered
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 min-h-[340px] h-auto lg:h-[360px]">
          <PatientTimelineChart data={dateBasedStats} />
        </div>
        <div className="lg:col-span-5 min-h-[360px] h-auto lg:h-[360px]">
          <SpecializationDoughnutChart data={specializationDistribution} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 min-h-[340px] h-auto lg:h-[380px]">
          <DoctorCaseloadBarChart
            patientsPerDoctor={patientsPerDoctor}
            doctorsList={doctorsList}
          />
        </div>

        <div className="lg:col-span-5 min-h-[340px] flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Department Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">
                  Doctor representation by discipline
                </p>
              </div>
            </div>

            <Link
              href="/doctors"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              All Doctors <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-3">
            {specializationDistribution.length > 0 ? (
              specializationDistribution.map((item, idx) => {
                const count = Number(item.count) || 0;
                const total = summary.totalDoctors || 1;
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={item.specialization || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.specialization}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {count} doctor{count === 1 ? '' : 's'} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400">
                <Building2 className="h-6 w-6 mb-1 opacity-50" />
                <span>No department data available</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Quick Navigation:</span>
            <div className="flex items-center gap-3">
              <Link
                href="/doctors"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Doctors Directory
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <Link
                href="/patients"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Patients Registry
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AddDoctorModal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        onDoctorAdded={handleDataUpdated}
        specializations={doctorSpecializations}
        hospitals={doctorHospitals}
      />

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        doctorsList={doctorsList}
        onPatientAdded={handleDataUpdated}
      />
    </div>
  );
};

export default DashboardClientView;
