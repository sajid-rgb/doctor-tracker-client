'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Users,
  UserPlus,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  MapPin,
  Droplet,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Pencil,
} from 'lucide-react';

import EditPatientModal from '@/components/patients/EditPatientModal';
import { getPatientsByDoctor, deletePatientFromDoctor } from '@/lib/api-client';

const DoctorPatientsModal = ({
  isOpen,
  doctor,
  onClose,
  onAddPatient,
  onRefresh,
}) => {
  const [patients, setPatients] = useState([]);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !doctor?._id) return;

    let ignore = false;

    getPatientsByDoctor(doctor._id)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load doctor patients');
        return res.json();
      })
      .then((json) => {
        if (ignore) return;
        const list =
          json?.data?.patients ||
          json?.data ||
          (Array.isArray(json) ? json : []);
        setPatients(Array.isArray(list) ? list : []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.warn('Fallback to populated doctor patients:', err);
        const fallback = Array.isArray(doctor.patients) ? doctor.patients : [];
        setPatients(fallback);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, doctor?._id, doctor?.patients]);

  if (!isOpen || !doctor) return null;

  const handleDeletePatient = async (patientId) => {
    if (!confirm('Are you sure you want to remove this patient from this doctor?')) return;

    try {
      setDeletingId(patientId);
      const res = await deletePatientFromDoctor(patientId);

      if (res.ok) {
        setSuccessMsg('Patient removed from doctor successfully.');
        setPatients((prev) => prev.filter((p) => p._id !== patientId));
        setTimeout(() => setSuccessMsg(null), 3000);
        if (onRefresh) onRefresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.message || 'Failed to remove patient from doctor.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while deleting patient.');
    } finally {
      setDeletingId(null);
    }
  };

  const patientCount = patients.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Patients under Dr. {doctor.name}
                </h3>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  {patientCount} patient{patientCount === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="h-3 w-3 text-blue-500" />
                  {doctor.specialization || 'General'}
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  {doctor.hospital || 'Hospital'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <Link
            href={`/doctors/${doctor._id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
          >
            <span>View Full Doctor Profile</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {onAddPatient && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddPatient(doctor);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Patient</span>
            </button>
          )}
        </div>

        {successMsg && (
          <div className="mx-4 sm:mx-6 mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="space-y-2 py-4">
              <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No patients assigned yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Dr. {doctor.name} does not have any patients registered under their care.
              </p>
              {onAddPatient && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddPatient(doctor);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register First Patient</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {patients.map((pat, idx) => {
                const patientId = typeof pat === 'string' ? pat : pat._id;
                const name = typeof pat === 'object' ? pat.name : `Patient #${idx + 1}`;
                const phone = typeof pat === 'object' ? pat.phone : '';
                const email = typeof pat === 'object' ? pat.email : '';
                const address = typeof pat === 'object' ? pat.address : '';
                const city = typeof pat === 'object' ? pat.city : '';
                const age = typeof pat === 'object' ? pat.age : null;
                const gender = typeof pat === 'object' ? pat.gender : null;
                const bloodGroup = typeof pat === 'object' ? pat.blood_group : null;

                return (
                  <div
                    key={patientId || idx}
                    className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {name}
                        </span>
                        {bloodGroup && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                            <Droplet className="h-2.5 w-2.5" />
                            {bloodGroup}
                          </span>
                        )}
                        {age && gender && (
                          <span className="text-xs text-slate-500">
                            &bull; {age} yrs, {gender}
                          </span>
                        )}
                        {(pat.patientCondition || pat.condition) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {pat.patientCondition || pat.condition}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        {phone && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <a href={`tel:${phone}`} className="hover:underline font-mono">
                              {phone}
                            </a>
                          </div>
                        )}
                        {email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <a href={`mailto:${email}`} className="hover:underline truncate">
                              {email}
                            </a>
                          </div>
                        )}
                        {(address || city) && (
                          <div className="flex items-center gap-1.5 truncate sm:col-span-2">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {[address, city].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPatientToEdit(
                            typeof pat === 'object'
                              ? pat
                              : { _id: patientId, doctorId: doctor?._id }
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                        title="Edit patient"
                        aria-label="Edit patient"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {patientId && (
                        <button
                          type="button"
                          onClick={() => handleDeletePatient(patientId)}
                          disabled={deletingId === patientId}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 cursor-pointer"
                          title="Remove patient from doctor"
                          aria-label="Remove patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Total {patientCount} patient{patientCount === 1 ? '' : 's'} assigned to Dr. {doctor.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <EditPatientModal
        isOpen={Boolean(patientToEdit)}
        patient={patientToEdit}
        onClose={() => setPatientToEdit(null)}
        doctorsList={doctor ? [doctor] : []}
        onPatientUpdated={(updatedPat) => {
          setPatients((prev) =>
            prev.map((p) => {
              const pid = typeof p === 'string' ? p : p._id;
              return pid === updatedPat._id ? { ...p, ...updatedPat } : p;
            })
          );
          setSuccessMsg(`Patient "${updatedPat.name || 'Patient'}" updated successfully.`);
          setTimeout(() => setSuccessMsg(null), 3000);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default DoctorPatientsModal;
