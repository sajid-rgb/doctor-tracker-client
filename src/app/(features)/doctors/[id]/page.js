import { cache } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import DoctorDetailView from '@/components/doctors/DoctorDetailView';

const getDoctorDetails = cache(async (id, token) => {
  const baseUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://doctor-tracker-server-self.vercel.app'
  ).replace(/\/$/, '');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${baseUrl}/api/doctors/${id}`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      const doctor = json?.data?.data || json?.data || json?.doctor || null;
      return doctor;
    }
  } catch (err) {
    console.error(`[Doctor Detail API Error] for doctor ${id}:`, err.message);
  }

  return null;
});

const getDoctorPatients = cache(async (id, token) => {
  const baseUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://doctor-tracker-server-self.vercel.app'
  ).replace(/\/$/, '');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${baseUrl}/api/patients/getPatientsByDoctor/${id}`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      const list =
        json?.data?.patients ||
        json?.data ||
        (Array.isArray(json) ? json : []);
      return Array.isArray(list) ? list : [];
    }
  } catch (err) {
    console.error(`[Doctor Patients API Error] for doctor ${id}:`, err.message);
  }

  return [];
});

export const generateMetadata = async (props) => {
  const params = await props.params;
  const id = params?.id;

  let token = null;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  } catch {
  }

  if (id) {
    const doctor = await getDoctorDetails(id, token);
    if (doctor?.name) {
      return {
        title: `${doctor.name} - ${doctor.specialization || 'Clinician'}`,
        description: `View clinical profile and assigned patients for Dr. ${doctor.name}`,
      };
    }
  }

  return {
    title: 'Doctor Details',
    description: 'View doctor clinical profile and assigned patient roster',
  };
};

const DoctorDetailPage = async (props) => {
  const params = await props.params;
  const id = params?.id;

  if (!id) {
    notFound();
  }

  let token = null;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  } catch {
  }

  const [doctor, patients] = await Promise.all([
    getDoctorDetails(id, token),
    getDoctorPatients(id, token),
  ]);

  if (!doctor) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Doctor Profile Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested clinician profile could not be retrieved from the database. It may have been removed.
        </p>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Doctors Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <DoctorDetailView
      doctor={doctor}
      patients={patients.length > 0 ? patients : doctor.patients || []}
    />
  );
};

export default DoctorDetailPage;
