'use client';

import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, CheckCircle2, Stethoscope, Building2, Mail, Phone, User } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { createDoctor, getSpecializations, getHospitals } from '@/lib/api-client';
import { COMMON_SPECIALIZATIONS } from '@/lib/constants';

const AddDoctorModal = ({
  isOpen,
  onClose,
  onDoctorAdded,
  specializations = [],
  hospitals = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hospital: '',
    specialization: 'Cardiology',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiSpecializations, setApiSpecializations] = useState([]);
  const [apiHospitals, setApiHospitals] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    if (specializations.length === 0 && apiSpecializations.length === 0) {
      getSpecializations()
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!ignore && json) {
            const list = json?.data?.data || json?.data || (Array.isArray(json) ? json : null);
            if (Array.isArray(list)) setApiSpecializations(list.filter(Boolean));
          }
        })
        .catch(() => {});
    }

    if (hospitals.length === 0 && apiHospitals.length === 0) {
      getHospitals()
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!ignore && json) {
            const list = json?.data?.data || json?.data || (Array.isArray(json) ? json : null);
            if (Array.isArray(list)) setApiHospitals(list.filter(Boolean));
          }
        })
        .catch(() => {});
    }

    return () => {
      ignore = true;
    };
  }, [isOpen, specializations.length, hospitals.length, apiSpecializations.length, apiHospitals.length]);

  if (!isOpen) return null;

  const availableSpecs = specializations.length > 0 ? specializations : apiSpecializations;
  const specializationsList = Array.from(
    new Set([...availableSpecs, ...COMMON_SPECIALIZATIONS].filter(Boolean))
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');
    if (!formData.name.trim()) return setError('Doctor name is required.');
    if (!formData.email.trim()) return setError('Email address is required.');
    if (!formData.hospital.trim()) return setError('Hospital is required.');
    if (!formData.specialization.trim()) return setError('Specialization is required.');
    if (!formData.phone.trim()) return setError('Phone number is required.');

    try {
      setIsLoading(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        hospital: formData.hospital.trim(),
        specialization: formData.specialization.trim(),
        phone: formData.phone.trim(),
        patients: [],
      };

      const res = await createDoctor(payload);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        const errMsg =
          json.message ||
          json.error ||
          (Array.isArray(json.errors) ? json.errors.map((e) => e.msg || e.message).join(', ') : null) ||
          'Failed to add doctor.';
        setError(errMsg);
        return;
      }

      const createdDoctor = json.data || json.doctor || json;
      const finalDoctor = {
        _id: createdDoctor?._id || `doc-${Date.now()}`,
        ...payload,
        ...createdDoctor,
      };

      setSuccess('Doctor profile added successfully!');
      if (onDoctorAdded) onDoctorAdded(finalDoctor);

      setTimeout(() => {
        onClose();
        setFormData({
          name: '',
          email: '',
          hospital: '',
          specialization: 'Cardiology',
          phone: '',
        });
        setSuccess('');
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to add doctor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add New Doctor
              </h3>
              <p className="text-xs text-slate-500">
                Register a clinician to the hospital network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Input
            label="Doctor Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            icon={User}
            accent="blue"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            icon={Mail}
            accent="blue"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              options={specializationsList}
              required
              accent="blue"
            />

            <div>
              <Input
                label="Hospital Affiliation"
                name="hospital"
                list="add-doctor-hospitals"
                required
                value={formData.hospital}
                onChange={handleChange}
                placeholder="Enter hospital name"
                icon={Building2}
                accent="blue"
              />
              <datalist id="add-doctor-hospitals">
                {apiHospitals.map((hosp) => (
                  <option key={hosp} value={hosp} />
                ))}
              </datalist>
            </div>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            icon={Phone}
            accent="blue"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Add Doctor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
