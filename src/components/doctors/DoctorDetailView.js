'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  UserPlus,
  Trash2,
  Droplet,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Search,
  Pencil,
} from 'lucide-react';
import AddPatientModal from '@/components/patients/AddPatientModal';
import EditPatientModal from '@/components/patients/EditPatientModal';
import EditDoctorModal from '@/components/doctors/EditDoctorModal';
import DeleteConfirmModal from '@/components/doctors/DeleteConfirmModal';
import DataTable from '@/components/ui/DataTable';
import Input from '@/components/ui/Input';
import {
  getDoctorById,
  getPatientsByDoctor,
  deletePatientFromDoctor,
  deleteDoctor,
} from '@/lib/api-client';

const DoctorDetailView = ({
  doctor: initialDoctor,
  patients: initialPatients = [],
}) => {
  const router = useRouter();

  const [doctor, setDoctor] = useState(initialDoctor);
  const [patients, setPatients] = useState(initialPatients);
  const [searchPatient, setSearchPatient] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [isDeleteDoctorOpen, setIsDeleteDoctorOpen] = useState(false);
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRefreshData = useCallback(async () => {
    if (!doctor?._id) return;
    try {
      setIsRefreshing(true);
      setErrorMsg(null);

      const [docRes, patRes] = await Promise.all([
        getDoctorById(doctor._id),
        getPatientsByDoctor(doctor._id),
      ]);

      if (docRes.ok) {
        const docJson = await docRes.json();
        const updatedDoc = docJson?.data?.data || docJson?.data || docJson;
        if (updatedDoc) setDoctor(updatedDoc);
      }

      if (patRes.ok) {
        const patJson = await patRes.json();
        const updatedPatients =
          patJson?.data?.patients ||
          patJson?.data ||
          (Array.isArray(patJson) ? patJson : []);
        setPatients(Array.isArray(updatedPatients) ? updatedPatients : []);
      }
    } catch (err) {
      console.error('Error refreshing doctor data:', err);
      setErrorMsg('Failed to refresh latest doctor data.');
    } finally {
      setIsRefreshing(false);
    }
  }, [doctor._id]);

  const handlePatientAdded = (newPatient) => {
    setSuccessMsg(`Patient "${newPatient.name || 'New Patient'}" added successfully!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    handleRefreshData();
  };

  const handleDoctorUpdated = (updatedDoctor) => {
    setDoctor(updatedDoctor);
    setSuccessMsg(`Doctor "${updatedDoctor.name || 'Doctor'}" updated successfully!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    handleRefreshData();
  };

  const handlePatientUpdated = (updatedPatient) => {
    setSuccessMsg(`Patient "${updatedPatient.name || 'Patient'}" updated successfully!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    handleRefreshData();
  };

  const handleDeletePatient = useCallback(async (patientId) => {
    if (!confirm('Are you sure you want to remove this patient from this doctor?')) return;

    try {
      setDeletingPatientId(patientId);
      const res = await deletePatientFromDoctor(patientId);

      if (res.ok) {
        setSuccessMsg('Patient removed from doctor successfully.');
        setPatients((prev) => prev.filter((p) => p._id !== patientId));
        setTimeout(() => setSuccessMsg(null), 3000);
        handleRefreshData();
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.message || 'Failed to delete patient from doctor.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while deleting patient.');
    } finally {
      setDeletingPatientId(null);
    }
  }, [handleRefreshData]);

  const handleDeleteDoctor = async () => {
    if (!doctor?._id) return;

    try {
      setIsDeletingDoctor(true);
      setErrorMsg(null);

      const res = await deleteDoctor(doctor._id);

      if (res.ok) {
        router.push('/doctors');
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.message || 'Failed to delete doctor.');
        setIsDeletingDoctor(false);
        setIsDeleteDoctorOpen(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while deleting doctor.');
      setIsDeletingDoctor(false);
      setIsDeleteDoctorOpen(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchPatient.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.blood_group?.toLowerCase().includes(q)
    );
  });

  const patientColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Patient Name',
        render: (pat, idx) => {
          const patId = typeof pat === 'string' ? pat : pat?._id;
          const name = typeof pat === 'object' ? pat?.name : `Patient #${idx + 1}`;
          return (
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{name}</div>
              {patId && (
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {patId.slice(-6)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'contact',
        header: 'Contact',
        render: (pat) => {
          const email = typeof pat === 'object' ? pat?.email : '';
          const phone = typeof pat === 'object' ? pat?.phone : '';
          return (
            <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
              {email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="font-mono">{phone}</span>
                </div>
              )}
              {!email && !phone && <span className="text-slate-400">—</span>}
            </div>
          );
        },
      },
      {
        key: 'location',
        header: 'Location',
        render: (pat) => {
          const city = typeof pat === 'object' ? pat?.city : '';
          const address = typeof pat === 'object' ? pat?.address : '';
          return (
            <div className="text-slate-600 dark:text-slate-300">
              {city && (
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{city}</span>
                </div>
              )}
              {address && (
                <div className="text-[11px] text-slate-400 truncate max-w-xs">
                  {address}
                </div>
              )}
              {!city && !address && <span className="text-slate-400">—</span>}
            </div>
          );
        },
      },
      {
        key: 'demographics',
        header: 'Age / Gender',
        render: (pat) => {
          const age = typeof pat === 'object' ? pat?.age : null;
          const gender = typeof pat === 'object' ? pat?.gender : null;
          return (
            <div className="text-slate-600 dark:text-slate-300">
              {age ? <span>{age} yrs</span> : <span>—</span>}
              {gender && <span> &bull; {gender}</span>}
            </div>
          );
        },
      },
      {
        key: 'blood_group',
        header: 'Blood Group',
        render: (pat) => {
          const bloodGroup = typeof pat === 'object' ? pat?.blood_group : null;
          return bloodGroup ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-0.5 font-bold text-red-600 dark:text-red-400 text-[11px]">
              <Droplet className="h-3 w-3" />
              {bloodGroup}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          );
        },
      },
      {
        key: 'patientCondition',
        header: 'Condition',
        render: (pat) => {
          const condition = typeof pat === 'object' ? (pat?.patientCondition || pat?.condition) : null;
          if (!condition) return <span className="text-slate-400">—</span>;

          const lower = condition.toLowerCase();
          let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
          let dotColor = 'bg-blue-500';

          if (lower.includes('critical') || lower.includes('emergency')) {
            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
            dotColor = 'bg-rose-500';
          } else if (lower.includes('serious') || lower.includes('severe')) {
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
            dotColor = 'bg-amber-500';
          } else if (lower.includes('stable') || lower.includes('normal') || lower.includes('good')) {
            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
            dotColor = 'bg-emerald-500';
          }

          return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
              <span>{condition}</span>
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (pat) => {
          const patId = typeof pat === 'string' ? pat : pat?._id;
          if (!patId) return null;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() =>
                  setPatientToEdit(
                    typeof pat === 'object'
                      ? pat
                      : { _id: patId, doctorId: doctor?._id }
                  )
                }
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                title="Edit patient"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeletePatient(patId)}
                disabled={deletingPatientId === patId}
                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 cursor-pointer"
                title="Delete patient from doctor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [deletingPatientId, handleDeletePatient, doctor._id]
  );

  const patientCount = patients.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Doctors</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsEditDoctorOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit doctor"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddPatientOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDoctorOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 shrink-0"
            title="Delete doctor"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {doctor.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <Stethoscope className="h-3.5 w-3.5" />
                {doctor.specialization || 'General Practitioner'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {doctor.hospital || 'Hospital Affiliation Not Specified'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Assigned Patients
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {patientCount}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              Email Address
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {doctor.email ? (
                <a href={`mailto:${doctor.email}`} className="hover:underline truncate">
                  {doctor.email}
                </a>
              ) : (
                <span>Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              Phone Number
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {doctor.phone ? (
                <a href={`tel:${doctor.phone}`} className="hover:underline font-mono">
                  {doctor.phone}
                </a>
              ) : (
                <span>Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              Doctor ID
            </span>
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{doctor._id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Assigned Patients ({patientCount})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Patients currently under the clinical care of Dr. {doctor.name}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {patientCount > 0 && (
              <Input
                variant="filter"
                size="sm"
                icon={Search}
                clearable
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                onClear={() => setSearchPatient('')}
                placeholder="Search patients..."
                accent="blue"
                className="w-full sm:w-56"
              />
            )}

            <button
              type="button"
              onClick={() => setIsAddPatientOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Add Patient</span>
            </button>
          </div>
        </div>

        {patientCount === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No patients assigned yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no patients registered under Dr. {doctor.name}. Add a patient to associate them with this doctor.
            </p>
            <button
              type="button"
              onClick={() => setIsAddPatientOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add First Patient</span>
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No patients match &quot;{searchPatient}&quot;.
          </div>
        ) : (
          <DataTable
            columns={patientColumns}
            data={filteredPatients}
            keyExtractor={(pat, idx) => (typeof pat === 'string' ? pat : pat?._id || idx)}
          />
        )}
      </div>

      <AddPatientModal
        isOpen={isAddPatientOpen}
        doctor={doctor}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      <EditPatientModal
        isOpen={Boolean(patientToEdit)}
        patient={patientToEdit}
        onClose={() => setPatientToEdit(null)}
        doctorsList={doctor ? [doctor] : []}
        onPatientUpdated={handlePatientUpdated}
      />

      <EditDoctorModal
        isOpen={isEditDoctorOpen}
        doctor={doctor}
        onClose={() => setIsEditDoctorOpen(false)}
        onDoctorUpdated={handleDoctorUpdated}
        specializations={doctor?.specialization ? [doctor.specialization] : []}
        hospitals={doctor?.hospital ? [doctor.hospital] : []}
      />

      <DeleteConfirmModal
        isOpen={isDeleteDoctorOpen}
        doctor={doctor}
        isDeleting={isDeletingDoctor}
        onClose={() => setIsDeleteDoctorOpen(false)}
        onConfirm={handleDeleteDoctor}
      />
    </div>
  );
};

export default DoctorDetailView;
