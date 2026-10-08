'use client';

import { useState, useTransition, useRef, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Users,
  Pencil,
  Trash2,
  UserPlus,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import DoctorCard from '@/components/doctors/DoctorCard';
import DoctorFilters from '@/components/doctors/DoctorFilters';
import Pagination from '@/components/ui/Pagination';
import AddDoctorModal from '@/components/doctors/AddDoctorModal';
import EditDoctorModal from '@/components/doctors/EditDoctorModal';
import AddPatientModal from '@/components/patients/AddPatientModal';
import DoctorPatientsModal from '@/components/doctors/DoctorPatientsModal';
import DeleteConfirmModal from '@/components/doctors/DeleteConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { getSpecializations, getHospitals, deleteDoctor } from '@/lib/api-client';

const DoctorsClientView = ({
  initialDoctors = [],
  initialTotal = 0,
  initialError = null,
  apiSpecializations = [],
  apiHospitals = [],
  currentSearch = '',
  currentSpecialization = 'all',
  currentHospital = 'all',
  currentFromDate = '',
  currentToDate = '',
  currentPage = 1,
  pageSize = 6,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [searchInput, setSearchInput] = useState(currentSearch);
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const [prevSpec, setPrevSpec] = useState(currentSpecialization);
  const [selectedSpec, setSelectedSpec] = useState(currentSpecialization);
  if (currentSpecialization !== prevSpec) {
    setPrevSpec(currentSpecialization);
    setSelectedSpec(currentSpecialization);
  }

  const [prevHospital, setPrevHospital] = useState(currentHospital);
  const [selectedHospital, setSelectedHospital] = useState(currentHospital);
  if (currentHospital !== prevHospital) {
    setPrevHospital(currentHospital);
    setSelectedHospital(currentHospital);
  }

  const [prevFromDate, setPrevFromDate] = useState(currentFromDate);
  const [fromDateInput, setFromDateInput] = useState(currentFromDate);
  if (currentFromDate !== prevFromDate) {
    setPrevFromDate(currentFromDate);
    setFromDateInput(currentFromDate);
  }

  const [prevToDate, setPrevToDate] = useState(currentToDate);
  const [toDateInput, setToDateInput] = useState(currentToDate);
  if (currentToDate !== prevToDate) {
    setPrevToDate(currentToDate);
    setToDateInput(currentToDate);
  }

  const [viewMode, setViewMode] = useState('table'); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState(null);
  const [patientModalDoctor, setPatientModalDoctor] = useState(null);
  const [patientsModalDoctor, setPatientsModalDoctor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [clientSpecializations, setClientSpecializations] = useState([]);
  const [clientHospitals, setClientHospitals] = useState([]);

  useEffect(() => {
    let ignore = false;

    if (apiSpecializations.length === 0) {
      getSpecializations()
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!ignore && json) {
            const list = json?.data?.data || json?.data || (Array.isArray(json) ? json : null);
            if (Array.isArray(list)) setClientSpecializations(list.filter(Boolean));
          }
        })
        .catch(() => {});
    }

    if (apiHospitals.length === 0) {
      getHospitals()
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!ignore && json) {
            const list = json?.data?.data || json?.data || (Array.isArray(json) ? json : null);
            if (Array.isArray(list)) setClientHospitals(list.filter(Boolean));
          }
        })
        .catch(() => {});
    }

    return () => {
      ignore = true;
    };
  }, [apiSpecializations.length, apiHospitals.length]);

  const navigateWithParams = (
    newSearch,
    newSpec,
    newHospital,
    newFromDate,
    newToDate,
    newPage
  ) => {
    const params = new URLSearchParams();

    const searchVal = newSearch !== undefined ? newSearch.trim() : searchInput.trim();
    const specVal = newSpec !== undefined ? newSpec : selectedSpec;
    const hospVal = newHospital !== undefined ? newHospital : selectedHospital;
    const fromVal = newFromDate !== undefined ? newFromDate : fromDateInput;
    const toVal = newToDate !== undefined ? newToDate : toDateInput;
    const pageVal = newPage !== undefined ? newPage : currentPage;

    if (searchVal) params.set('search', searchVal);
    if (specVal && specVal !== 'all') params.set('specialization', specVal);
    if (hospVal && hospVal !== 'all') params.set('hospital', hospVal);
    if (fromVal) params.set('fromDate', fromVal);
    if (toVal) params.set('toDate', toVal);
    if (pageVal && pageVal > 1) params.set('page', pageVal.toString());
    if (pageSize && pageSize !== 6) params.set('limit', pageSize.toString());

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const debounceTimerRef = useRef(null);
  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      navigateWithParams(
        value,
        selectedSpec,
        selectedHospital,
        fromDateInput,
        toDateInput,
        1
      );
    }, 350);
  };

  const handleSpecializationChange = (value) => {
    setSelectedSpec(value);
    navigateWithParams(
      searchInput,
      value,
      selectedHospital,
      fromDateInput,
      toDateInput,
      1
    );
  };

  const handleHospitalChange = (value) => {
    setSelectedHospital(value);
    navigateWithParams(
      searchInput,
      selectedSpec,
      value,
      fromDateInput,
      toDateInput,
      1
    );
  };

  const handleFromDateChange = (value) => {
    setFromDateInput(value);
    navigateWithParams(
      searchInput,
      selectedSpec,
      selectedHospital,
      value,
      toDateInput,
      1
    );
  };

  const handleToDateChange = (value) => {
    setToDateInput(value);
    navigateWithParams(
      searchInput,
      selectedSpec,
      selectedHospital,
      fromDateInput,
      value,
      1
    );
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedSpec('all');
    setSelectedHospital('all');
    setFromDateInput('');
    setToDateInput('');
    navigateWithParams('', 'all', 'all', '', '', 1);
  };

  const handlePageChange = (page) => {
    navigateWithParams(
      searchInput,
      selectedSpec,
      selectedHospital,
      fromDateInput,
      toDateInput,
      page
    );
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDoctorAdded = () => {
    handleRefresh();
  };

  const handleOpenAddPatient = (doctor) => {
    setActionError(null);
    setPatientModalDoctor(doctor);
  };

  const handleOpenEditDoctor = (doctor) => {
    setActionError(null);
    setDoctorToEdit(doctor);
  };

  const handleDoctorUpdated = (updatedDoctor) => {
    setActionSuccess(`Doctor "${updatedDoctor.name || 'Clinician'}" profile updated successfully!`);
    setTimeout(() => setActionSuccess(null), 4000);
    handleRefresh();
  };

  const handleOpenShowPatients = (doctor) => {
    setActionError(null);
    setPatientsModalDoctor(doctor);
  };

  const handlePatientAdded = (createdPatient) => {
    setActionSuccess(
      `Patient "${createdPatient.name || 'New Patient'}" successfully registered under Dr. ${
        patientModalDoctor?.name || 'Doctor'
      }!`
    );
    setTimeout(() => setActionSuccess(null), 5000);
    handleRefresh();
  };

  const handleRequestDelete = (doctor) => {
    setActionError(null);
    setDoctorToDelete(doctor);
  };

  const handleConfirmDelete = async (doctor) => {
    if (!doctor?._id) return;

    try {
      setIsDeleting(true);
      setActionError(null);

      const res = await deleteDoctor(doctor._id);

      if (res.ok) {
        setDoctorToDelete(null);
        handleRefresh();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setActionError(errJson.message || 'Failed to delete doctor.');
      }
    } catch (err) {
      setActionError(err.message || 'Error occurred while deleting doctor.');
    } finally {
      setIsDeleting(false);
    }
  };

  const specializationsList = useMemo(() => {
    const list = apiSpecializations.length > 0 ? apiSpecializations : clientSpecializations;
    const set = new Set(list);
    initialDoctors.forEach((d) => {
      if (d.specialization) set.add(d.specialization.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [apiSpecializations, clientSpecializations, initialDoctors]);

  const hospitalsList = useMemo(() => {
    const list = apiHospitals.length > 0 ? apiHospitals : clientHospitals;
    const set = new Set(list);
    initialDoctors.forEach((d) => {
      if (d.hospital) set.add(d.hospital.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [apiHospitals, clientHospitals, initialDoctors]);

  const totalPages = Math.max(1, Math.ceil(initialTotal / pageSize));

  const hasAnyFilter = Boolean(
    searchInput ||
      selectedSpec !== 'all' ||
      selectedHospital !== 'all' ||
      fromDateInput ||
      toDateInput
  );

  const doctorColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Doctor Name',
        render: (doc) => (
          <div>
            <Link
              href={`/doctors/${doc._id}`}
              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline block"
            >
              {doc.name || 'Unnamed Doctor'}
            </Link>
            {doc._id && (
              <span className="text-[10px] text-slate-400 font-mono">
                ID: {doc._id.slice(-6)}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'specialization',
        header: 'Specialization',
        render: (doc) => (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Stethoscope className="h-3 w-3 shrink-0" />
            <span>{doc.specialization || 'General'}</span>
          </span>
        ),
      },
      {
        key: 'hospital',
        header: 'Hospital',
        render: (doc) => (
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[170px]">{doc.hospital || 'Not specified'}</span>
          </div>
        ),
      },
      {
        key: 'contact',
        header: 'Contact Info',
        render: (doc) => (
          <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
            {doc.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                <a href={`mailto:${doc.email}`} className="hover:underline truncate max-w-[160px]">
                  {doc.email}
                </a>
              </div>
            )}
            {doc.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                <a href={`tel:${doc.phone}`} className="hover:underline font-mono text-[11px]">
                  {doc.phone}
                </a>
              </div>
            )}
            {!doc.email && !doc.phone && <span className="text-slate-400">—</span>}
          </div>
        ),
      },
      {
        key: 'patients',
        header: 'Patients',
        render: (doc) => {
          const count = Array.isArray(doc.patients) ? doc.patients.length : 0;
          return (
            <button
              type="button"
              onClick={() => handleOpenShowPatients(doc)}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-blue-400 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              title="Click to view assigned patients"
            >
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span>{count}</span>
            </button>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (doc) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenAddPatient(doc)}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
              title="Add patient under this doctor"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Patient</span>
            </button>

            <Link
              href={`/doctors/${doc._id}`}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              View
            </Link>

            <button
              type="button"
              onClick={() => handleOpenEditDoctor(doc)}
              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
              title="Edit doctor"
              aria-label="Edit doctor"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleRequestDelete(doc)}
              disabled={isDeleting && doctorToDelete?._id === doc._id}
              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 cursor-pointer"
              title="Delete doctor"
              aria-label="Delete doctor"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [isDeleting, doctorToDelete?._id]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Doctors
          </h1>
          <p className="text-xs text-slate-500">
            Total {initialTotal} doctor{initialTotal === 1 ? '' : 's'} found
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card view"
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {(initialError || actionError) && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{actionError || initialError}</span>
        </div>
      )}

      <DoctorFilters
        search={searchInput}
        onSearchChange={handleSearchChange}
        specialization={selectedSpec}
        onSpecializationChange={handleSpecializationChange}
        specializationsList={specializationsList}
        hospital={selectedHospital}
        onHospitalChange={handleHospitalChange}
        hospitalsList={hospitalsList}
        fromDate={fromDateInput}
        onFromDateChange={handleFromDateChange}
        toDate={toDateInput}
        onToDateChange={handleToDateChange}
        onResetFilters={handleResetFilters}
      />

      {initialDoctors.length === 0 ? (
        <EmptyState
          title={
            hasAnyFilter
              ? 'No doctors match your filters'
              : 'No doctors found'
          }
          description={
            hasAnyFilter
              ? 'Try adjusting your search terms, date range, or hospital filter.'
              : 'There are no doctors registered in the database.'
          }
          actionText={hasAnyFilter ? 'Clear Filters' : 'Add Doctor'}
          onAction={
            hasAnyFilter
              ? handleResetFilters
              : () => setIsAddModalOpen(true)
          }
        />
      ) : viewMode === 'table' ? (
        <div className={`transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          <DataTable
            columns={doctorColumns}
            data={initialDoctors}
          />
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 transition-opacity ${
            isPending ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {initialDoctors.map((doc) => (
            <DoctorCard
              key={doc._id}
              doctor={doc}
              onDelete={handleRequestDelete}
              onEdit={handleOpenEditDoctor}
              onAddPatient={handleOpenAddPatient}
              onShowPatients={handleOpenShowPatients}
              isDeleting={isDeleting && doctorToDelete?._id === doc._id}
            />
          ))}
        </div>
      )}

      {initialDoctors.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <AddDoctorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onDoctorAdded={handleDoctorAdded}
        specializations={specializationsList}
        hospitals={hospitalsList}
      />

      <EditDoctorModal
        isOpen={Boolean(doctorToEdit)}
        doctor={doctorToEdit}
        onClose={() => setDoctorToEdit(null)}
        onDoctorUpdated={handleDoctorUpdated}
        specializations={specializationsList}
        hospitals={hospitalsList}
      />

      <AddPatientModal
        isOpen={Boolean(patientModalDoctor)}
        doctor={patientModalDoctor}
        onClose={() => setPatientModalDoctor(null)}
        onPatientAdded={handlePatientAdded}
      />

      <DoctorPatientsModal
        isOpen={Boolean(patientsModalDoctor)}
        doctor={patientsModalDoctor}
        onClose={() => setPatientsModalDoctor(null)}
        onAddPatient={handleOpenAddPatient}
        onRefresh={handleRefresh}
      />

      <DeleteConfirmModal
        isOpen={Boolean(doctorToDelete)}
        doctor={doctorToDelete}
        isDeleting={isDeleting}
        onClose={() => setDoctorToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default DoctorsClientView;
