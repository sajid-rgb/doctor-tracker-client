'use client';

import Link from 'next/link';
import { Mail, Phone, Building, Stethoscope, Users, Trash2, UserPlus, Pencil } from 'lucide-react';

const DoctorCard = ({
  doctor,
  onDelete,
  isDeleting = false,
  onAddPatient,
  onShowPatients,
  onEdit,
}) => {
  const {
    _id = '',
    name = '',
    email = '',
    hospital = '',
    specialization = '',
    phone = '',
    patients = [],
  } = doctor;

  const patientCount = Array.isArray(patients) ? patients.length : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/doctors/${_id}`}
              className="font-semibold text-slate-900 dark:text-white text-base hover:text-blue-600 dark:hover:text-blue-400 hover:underline block truncate"
              title="View doctor details"
            >
              {name || 'Unnamed Doctor'}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
              <Stethoscope className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{specialization || 'General'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onShowPatients?.(doctor)}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-blue-400 px-2 py-1 text-xs text-slate-600 transition-colors cursor-pointer"
              title="Click to view assigned patients"
            >
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span>{patientCount}</span>
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(doctor)}
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                title="Edit doctor"
                aria-label="Edit doctor"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(doctor)}
                disabled={isDeleting}
                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 cursor-pointer"
                title="Delete doctor"
                aria-label="Delete doctor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{hospital || 'Not specified'}</span>
        </div>

        <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {email ? (
              <a href={`mailto:${email}`} className="hover:underline truncate">
                {email}
              </a>
            ) : (
              <span>No email</span>
            )}
          </div>

          <div className="flex items-center gap-2 truncate">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {phone ? (
              <a href={`tel:${phone}`} className="hover:underline">
                {phone}
              </a>
            ) : (
              <span>No phone</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onAddPatient?.(doctor)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            title="Add patient under this doctor"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Patient</span>
          </button>

          <button
            type="button"
            onClick={() => onShowPatients?.(doctor)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            title="Show patients assigned to this doctor"
          >
            <Users className="h-3.5 w-3.5 text-blue-500" />
            <span>Patients ({patientCount})</span>
          </button>
        </div>

        <Link
          href={`/doctors/${_id}`}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          View &rarr;
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
