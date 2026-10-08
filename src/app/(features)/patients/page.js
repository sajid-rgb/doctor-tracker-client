import { Suspense } from 'react';
import { cookies } from 'next/headers';
import PatientsClientView from '@/components/patients/PatientsClientView';
import PatientsSkeleton from '@/components/patients/PatientsSkeleton';

export const generateMetadata = async (props) => {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  const search = searchParams?.search?.trim();
  const gender = searchParams?.gender;
  const bloodGroup = searchParams?.blood_group || searchParams?.bloodGroup;
  const condition = searchParams?.patientCondition || searchParams?.condition;

  let title = 'Patients Registry';
  if (condition && condition !== 'all') {
    title = `${condition} Condition Patients | Patients`;
  } else if (search) {
    title = `Search "${search}" | Patients`;
  } else if (bloodGroup && bloodGroup !== 'all') {
    title = `${bloodGroup} Blood Group | Patients`;
  } else if (gender && gender !== 'all') {
    title = `${gender} Patients | Patients`;
  }

  return {
    title,
    description: 'Manage hospital patient records, demographics, doctor assignments, and admissions',
  };
};

const fetchPatientsData = async (token, searchParams = {}) => {
  const baseUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://doctor-tracker-server-self.vercel.app'
  ).replace(/\/$/, '');

  let patients = [];
  let total = 0;
  let doctorsList = [];
  let conditionsList = [];
  let error = null;

  if (!token) {
    return { patients, total, doctorsList, conditionsList, error: null };
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const {
    search = '',
    gender = 'all',
    blood_group = '',
    bloodGroup = '',
    patientCondition = '',
    condition = '',
    doctorId = 'all',
    fromDate = '',
    toDate = '',
    page = 1,
    limit = 10,
  } = searchParams;

  const activeBloodGroup = blood_group || bloodGroup || 'all';
  const activeCondition = patientCondition || condition || 'all';

  const query = new URLSearchParams();
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  query.set('skip', Math.max(0, skip).toString());
  query.set('limit', limit.toString());

  if (search && search.trim()) query.set('search', search.trim());
  if (gender && gender !== 'all') query.set('gender', gender);
  if (activeBloodGroup && activeBloodGroup !== 'all') query.set('blood_group', activeBloodGroup);
  if (activeCondition && activeCondition !== 'all') query.set('patientCondition', activeCondition);
  if (doctorId && doctorId !== 'all') query.set('doctorId', doctorId);
  if (fromDate) query.set('fromDate', fromDate);
  if (toDate) query.set('toDate', toDate);

  const queryString = query.toString();
  const patientsUrl = `${baseUrl}/api/patients${queryString ? `?${queryString}` : ''}`;
  const doctorsUrl = `${baseUrl}/api/doctors`;
  const conditionsUrl = `${baseUrl}/api/patients/getPatientCondition`;

  try {
    const [patientsRes, doctorsRes, conditionsRes] = await Promise.all([
      fetch(patientsUrl, { headers, cache: 'no-store' }),
      fetch(doctorsUrl, { headers, cache: 'no-store' }),
      fetch(conditionsUrl, { headers, cache: 'no-store' }),
    ]);

    if (patientsRes.ok) {
      const pJson = await patientsRes.json().catch(() => null);
      const rawList =
        pJson?.data?.patients ||
        pJson?.data ||
        (Array.isArray(pJson) ? pJson : []);
      patients = Array.isArray(rawList) ? rawList : [];
      total =
        pJson?.data?.pagination?.total ??
        pJson?.data?.total ??
        pJson?.pagination?.total ??
        pJson?.total ??
        pJson?.meta?.total ??
        patients.length;
    } else {
      const errJson = await patientsRes.json().catch(() => ({}));
      error = errJson.message || 'Unable to load patients.';
    }

    if (doctorsRes.ok) {
      const dJson = await doctorsRes.json().catch(() => null);
      const docs =
        dJson?.data?.data ||
        dJson?.data ||
        dJson?.doctors ||
        (Array.isArray(dJson) ? dJson : []);
      if (Array.isArray(docs)) doctorsList = docs;
    }

    if (conditionsRes.ok) {
      const cJson = await conditionsRes.json().catch(() => null);
      const conds =
        cJson?.data?.data ||
        cJson?.data?.conditions ||
        cJson?.data ||
        cJson?.conditions ||
        (Array.isArray(cJson) ? cJson : []);
      if (Array.isArray(conds)) conditionsList = conds.filter(Boolean);
    }
  } catch (err) {
    console.error('[Patients Server API Error]:', err.message);
    error = err.message || 'Unable to connect to backend server.';
  }

  return { patients, total, doctorsList, conditionsList, error };
};

const PatientsDataLoader = async ({ searchParams }) => {
  let token = null;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  } catch {
  }

  const { patients, total, doctorsList, conditionsList, error } =
    await fetchPatientsData(token, searchParams);

  const activeBloodGroup = searchParams?.blood_group || searchParams?.bloodGroup || 'all';
  const activeCondition = searchParams?.patientCondition || searchParams?.condition || 'all';

  return (
    <PatientsClientView
      initialPatients={patients}
      initialTotal={total}
      initialDoctors={doctorsList}
      initialConditions={conditionsList}
      initialError={error}
      currentSearch={searchParams?.search || ''}
      currentGender={searchParams?.gender || 'all'}
      currentBloodGroup={activeBloodGroup}
      currentCondition={activeCondition}
      currentDoctorId={searchParams?.doctorId || 'all'}
      currentFromDate={searchParams?.fromDate || ''}
      currentToDate={searchParams?.toDate || ''}
      currentPage={Math.max(1, parseInt(searchParams?.page || '1', 10))}
      pageSize={10}
    />
  );
};

const PatientsPage = async (props) => {
  const searchParams = props?.searchParams ? await props.searchParams : {};

  return (
    <Suspense
      key={JSON.stringify(searchParams)}
      fallback={<PatientsSkeleton />}
    >
      <PatientsDataLoader searchParams={searchParams} />
    </Suspense>
  );
};

export default PatientsPage;
