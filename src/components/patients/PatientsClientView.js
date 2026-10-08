'use client';

import {
  useState,
  useTransition,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  MapPin,
  Mail,
  Phone,
  Droplet,
  Pencil,
  Activity,
} from 'lucide-react';
import AddPatientModal from '@/components/patients/AddPatientModal';
import EditPatientModal from '@/components/patients/EditPatientModal';
import PatientFilters from '@/components/patients/PatientFilters';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import DataTable from '@/components/ui/DataTable';
import {
  getDoctors,
  deletePatient,
  deletePatientFromDoctor,
  getPatientCondition,
} from '@/lib/api-client';

const PatientsClientView = ({
  initialPatients = [],
  initialTotal = 0,
  initialDoctors = [],
  initialConditions = [],
  initialError = null,
  currentSearch = '',
  currentGender = 'all',
  currentBloodGroup = 'all',
  currentCondition = 'all',
  currentDoctorId = 'all',
  currentFromDate = '',
  currentToDate = '',
  currentPage = 1,
  pageSize = 10,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [searchInput, setSearchInput] = useState(currentSearch);
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }
  const [doctorsList, setDoctorsList] = useState(initialDoctors);
  const [conditionsList, setConditionsList] = useState(initialConditions);
  const [error, setError] = useState(initialError);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const debounceRef = useRef(null);
  const hasFetchedCondsRef = useRef(initialConditions.length > 0);
  const hasFetchedDocsRef = useRef(initialDoctors.length > 0);

  useEffect(() => {
    if (hasFetchedCondsRef.current || conditionsList.length > 0) return;
    hasFetchedCondsRef.current = true;

    let ignore = false;
    getPatientCondition()
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json) {
          const list =
            json?.data?.data ||
            json?.data?.conditions ||
            json?.data ||
            json?.conditions ||
            (Array.isArray(json) ? json : []);
          if (Array.isArray(list) && list.length > 0) {
            setConditionsList(list.filter(Boolean));
          }
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [conditionsList.length]);

  useEffect(() => {
    if (hasFetchedDocsRef.current || doctorsList.length > 0) return;
    hasFetchedDocsRef.current = true;

    let ignore = false;
    getDoctors()
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json) {
          const list =
            json?.data?.data ||
            json?.data ||
            json?.doctors ||
            (Array.isArray(json) ? json : []);
          if (Array.isArray(list)) setDoctorsList(list);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [doctorsList.length]);

  const updateQueryParams = useCallback(
    (newParams) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          value === 'all' ||
          (key === 'page' && Number(value) <= 1)
        ) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      startTransition(() => {
        const queryString = current.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const revalidateData = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateQueryParams({ search: val.trim(), page: 1 });
    }, 350);
  };

  const handleGenderChange = (val) => {
    updateQueryParams({ gender: val, page: 1 });
  };

  const handleBloodGroupChange = (val) => {
    updateQueryParams({ blood_group: val, page: 1 });
  };

  const handleConditionChange = (val) => {
    updateQueryParams({ patientCondition: val, page: 1 });
  };

  const handleDoctorChange = (val) => {
    updateQueryParams({ doctorId: val, page: 1 });
  };

  const handleFromDateChange = (val) => {
    updateQueryParams({ fromDate: val, page: 1 });
  };

  const handleToDateChange = (val) => {
    updateQueryParams({ toDate: val, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  const handleDeletePatient = useCallback(
    async (pat) => {
      const patientId = typeof pat === 'object' ? pat?._id : pat;
      if (!patientId) return;
      if (!confirm('Are you sure you want to remove this patient?')) return;

      try {
        setDeletingId(patientId);
        const hasDoctor = typeof pat === 'object' && Boolean(pat?.doctorId);
        const res = hasDoctor
          ? await deletePatientFromDoctor(patientId)
          : await deletePatient(patientId);

        if (res.ok) {
          setSuccessMsg('Patient removed successfully.');
          setTimeout(() => setSuccessMsg(null), 4000);
          revalidateData();
        } else {
          const json = await res.json().catch(() => ({}));
          setError(json.message || 'Failed to delete patient.');
        }
      } catch (err) {
        setError(err.message || 'Error occurred while deleting patient.');
      } finally {
        setDeletingId(null);
      }
    },
    [revalidateData]
  );

  const handlePatientAdded = () => {
    setSuccessMsg('Patient registered successfully!');
    setTimeout(() => setSuccessMsg(null), 4000);
    revalidateData();
  };

  const handlePatientUpdated = () => {
    setSuccessMsg('Patient details updated successfully!');
    setTimeout(() => setSuccessMsg(null), 4000);
    revalidateData();
  };

  const hasAnyFilter = Boolean(
    currentSearch ||
      currentGender !== 'all' ||
      currentBloodGroup !== 'all' ||
      (currentCondition && currentCondition !== 'all') ||
      currentDoctorId !== 'all' ||
      currentFromDate ||
      currentToDate
  );

  const totalPages = Math.max(1, Math.ceil(initialTotal / pageSize));

  const patientColumns = [
    {
      key: 'name',
      header: 'Patient Name',
      render: (pat) => (
        <div className="font-semibold text-slate-900 dark:text-white">
          {pat.name || 'Unnamed Patient'}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (pat) => (
        <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
          {pat.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              <a href={`mailto:${pat.email}`} className="hover:underline">
                {pat.email}
              </a>
            </div>
          )}
          {pat.phone && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
              <a href={`tel:${pat.phone}`} className="hover:underline font-mono">
                {pat.phone}
              </a>
            </div>
          )}
          {!pat.email && !pat.phone && <span className="text-slate-400">—</span>}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (pat) => (
        <div className="text-slate-600 dark:text-slate-300">
          {pat.city && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span>{pat.city}</span>
            </div>
          )}
          {pat.address && (
            <div className="text-[11px] text-slate-400 truncate max-w-xs">
              {pat.address}
            </div>
          )}
          {!pat.city && !pat.address && <span className="text-slate-400">—</span>}
        </div>
      ),
    },
    {
      key: 'demographics',
      header: 'Age / Gender',
      render: (pat) => (
        <div className="text-slate-600 dark:text-slate-300">
          {pat.age ? <span className="font-medium">{pat.age} yrs</span> : <span>—</span>}
          {pat.gender && <span> &bull; {pat.gender}</span>}
        </div>
      ),
    },
    {
      key: 'blood_group',
      header: 'Blood Group',
      render: (pat) =>
        pat.blood_group ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-0.5 font-bold text-red-600 dark:text-red-400 text-[11px]">
            <Droplet className="h-3 w-3" />
            {pat.blood_group}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'patientCondition',
      header: 'Condition',
      render: (pat) => {
        const condition = pat.patientCondition || pat.condition;
        if (!condition) {
          return <span className="text-slate-400">—</span>;
        }

        const lower = condition.toLowerCase();
        let badgeColor =
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
        let dotColor = 'bg-blue-500';

        if (lower.includes('critical') || lower.includes('emergency')) {
          badgeColor =
            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
          dotColor = 'bg-rose-500';
        } else if (lower.includes('serious') || lower.includes('severe') || lower.includes('acute')) {
          badgeColor =
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
          dotColor = 'bg-amber-500';
        } else if (lower.includes('stable') || lower.includes('normal') || lower.includes('good')) {
          badgeColor =
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
          dotColor = 'bg-emerald-500';
        } else if (lower.includes('recovering') || lower.includes('improving')) {
          badgeColor =
            'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60';
          dotColor = 'bg-cyan-500';
        }

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            <span>{condition}</span>
          </span>
        );
      },
    },
    {
      key: 'doctor',
      header: 'Assigned Doctor',
      render: (pat) => {
        const doctorName =
          typeof pat.doctorId === 'object' && pat.doctorId?.name
            ? pat.doctorId.name
            : typeof pat.doctorId === 'string'
            ? pat.doctorId
            : 'Unassigned';
        const docHospital =
          typeof pat.doctorId === 'object' && pat.doctorId?.hospital
            ? pat.doctorId.hospital
            : null;
        const doctorId =
          typeof pat.doctorId === 'object' && pat.doctorId?._id
            ? pat.doctorId._id
            : null;

        return (
          <div>
            <div className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
              <Stethoscope className="h-3.5 w-3.5 shrink-0" />
              {doctorId ? (
                <Link href={`/doctors/${doctorId}`} className="hover:underline">
                  {doctorName}
                </Link>
              ) : (
                <span>{doctorName}</span>
              )}
            </div>
            {docHospital && (
              <div className="text-[11px] text-slate-400 truncate">
                {docHospital}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (pat) =>
        pat.createdAt ? (
          <div className="text-xs text-slate-500 font-mono">
            {new Date(pat.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (pat) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setPatientToEdit(pat)}
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            title="Edit patient"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePatient(pat)}
            disabled={deletingId === pat._id}
            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 cursor-pointer"
            title="Delete patient"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Patients Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {initialTotal} patient{initialTotal === 1 ? '' : 's'} registered in the hospital network.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      <PatientFilters
        search={searchInput}
        onSearchChange={handleSearchChange}
        gender={currentGender}
        onGenderChange={handleGenderChange}
        bloodGroup={currentBloodGroup}
        onBloodGroupChange={handleBloodGroupChange}
        patientCondition={currentCondition}
        onConditionChange={handleConditionChange}
        conditionsList={conditionsList}
        doctorId={currentDoctorId}
        onDoctorChange={handleDoctorChange}
        doctorsList={doctorsList}
        fromDate={currentFromDate}
        onFromDateChange={handleFromDateChange}
        toDate={currentToDate}
        onToDateChange={handleToDateChange}
        onResetFilters={handleResetFilters}
      />

      {initialPatients.length === 0 ? (
        <EmptyState
          title={hasAnyFilter ? 'No patients match your filters' : 'No patients found'}
          description={
            hasAnyFilter
              ? 'No patients matched your current search or filter criteria. Try adjusting your parameters.'
              : 'There are currently no patients registered under any doctor.'
          }
          actionText={hasAnyFilter ? 'Clear Filters' : 'Add Patient'}
          onAction={hasAnyFilter ? handleResetFilters : () => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={patientColumns}
            data={initialPatients}
            isLoading={isPending}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={handlePatientAdded}
        doctorsList={doctorsList}
      />

      <EditPatientModal
        isOpen={Boolean(patientToEdit)}
        patient={patientToEdit}
        onClose={() => setPatientToEdit(null)}
        doctorsList={doctorsList}
        conditionsList={conditionsList}
        onPatientUpdated={handlePatientUpdated}
      />
    </div>
  );
};

export default PatientsClientView;
