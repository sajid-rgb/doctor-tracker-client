import { Suspense } from 'react';
import { cookies } from 'next/headers';
import DoctorsClientView from '@/components/doctors/DoctorsClientView';
import DoctorsSkeleton from '@/components/doctors/DoctorsSkeleton';

export const generateMetadata = async (props) => {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  const search = searchParams?.search?.trim();
  const specialization = searchParams?.specialization;
  const hospital = searchParams?.hospital;

  let title = 'Doctors Directory';
  if (specialization && specialization !== 'all') {
    title = `${specialization} Specialists | Doctors`;
  } else if (hospital && hospital !== 'all') {
    title = `Clinicians at ${hospital} | Doctors`;
  } else if (search) {
    title = `Search "${search}" | Doctors`;
  }

  return {
    title,
    description: 'Manage hospital clinicians, specialties, affiliations, and assigned patients',
  };
};

const getDoctors = async (token, searchParams = {}) => {
  const baseUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://doctor-tracker-server-self.vercel.app'
  ).replace(/\/$/, '');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const {
    search = '',
    specialization = '',
    hospital = '',
    fromDate = '',
    toDate = '',
    page = 1,
    limit = 6,
  } = searchParams;

  const query = new URLSearchParams();
  if (search && search.trim()) {
    query.set('search', search.trim());
  }
  if (specialization && specialization !== 'all') {
    query.set('specialization', specialization);
  }
  if (hospital && hospital !== 'all') {
    query.set('hospital', hospital);
  }
  if (fromDate) {
    query.set('fromDate', fromDate);
  }
  if (toDate) {
    query.set('toDate', toDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  query.set('skip', Math.max(0, skip).toString());
  query.set('limit', limit.toString());

  const queryString = query.toString();
  const url = `${baseUrl}/api/doctors${queryString ? `?${queryString}` : ''}`;

  console.log(`[Doctors API Fetch] Calling: ${url}`);

  try {
    const res = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      console.log(`[Doctors API Response] Status: ${res.status}`);

      const rawList =
        json?.data?.data ||
        json?.data ||
        json?.doctors ||
        (Array.isArray(json) ? json : null);

      const total =
        json?.data?.pagination?.total ??
        json?.data?.total ??
        json?.pagination?.total ??
        json?.total ??
        json?.meta?.total ??
        (Array.isArray(rawList) ? rawList.length : 0);

      if (Array.isArray(rawList)) {
        return {
          doctors: rawList.map((item, idx) => ({
            _id: item._id || item.id || `doc-${idx}`,
            name: item.name || '',
            email: item.email || '',
            hospital: item.hospital || '',
            specialization: item.specialization || '',
            phone: item.phone || '',
            patients: Array.isArray(item.patients) ? item.patients : [],
            createdAt: item.createdAt || null,
          })),
          total,
          error: null,
        };
      }
    }
  } catch (err) {
    console.error('[Doctors API Error]:', err.message);
  }

  return { doctors: [], total: 0, error: null };
}

const getSpecializations = async (token) => {
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
    const res = await fetch(`${baseUrl}/api/doctors/specializations`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      const list = json?.data?.data || json?.data || (Array.isArray(json) ? json : null);
      if (Array.isArray(list)) {
        return list.filter(Boolean);
      }
    }
  } catch {
  }

  return [];
}

const getHospitals = async (token) => {
  const baseUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://doctor-tracker-server-self.vercel.app/'
  ).replace(/\/$/, '');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${baseUrl}/api/doctors/hospitals`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      const list = json?.data?.data || json?.data || (Array.isArray(json) ? json : null);
      if (Array.isArray(list)) {
        return list.filter(Boolean);
      }
    }
  } catch {
  }

  return [];
};

const DoctorsDataFetcher = async ({ searchParams }) => {
  let token = null;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  } catch {
  }

  const [{ doctors, total, error }, specializations, hospitals] = await Promise.all([
    getDoctors(token, searchParams),
    getSpecializations(token),
    getHospitals(token),
  ]);

  return (
    <DoctorsClientView
      initialDoctors={doctors}
      initialTotal={total}
      initialError={error}
      apiSpecializations={specializations}
      apiHospitals={hospitals}
      currentSearch={searchParams?.search || ''}
      currentSpecialization={searchParams?.specialization || 'all'}
      currentHospital={searchParams?.hospital || 'all'}
      currentFromDate={searchParams?.fromDate || ''}
      currentToDate={searchParams?.toDate || ''}
      currentPage={Number(searchParams?.page) || 1}
      pageSize={Number(searchParams?.limit) || 6}
    />
  );
};

const DoctorsPage = async (props) => {
  const searchParams = props?.searchParams ? await props.searchParams : {};

  return (
    <Suspense
      key={JSON.stringify(searchParams)}
      fallback={<DoctorsSkeleton />}
    >
      <DoctorsDataFetcher searchParams={searchParams} />
    </Suspense>
  );
};

export default DoctorsPage;
