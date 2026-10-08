'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  MapPin,
  Droplet,
  User,
  Activity,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getDoctors, updatePatient } from '@/lib/api-client';
import { BLOOD_GROUPS, GENDERS, PATIENT_CONDITIONS } from '@/lib/constants';

const EditPatientModal = ({
  isOpen,
  patient,
  onClose,
  doctorsList = [],
  conditionsList = [],
  onPatientUpdated,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <EditPatientModalContent
      key={patient._id || 'edit-patient'}
      patient={patient}
      onClose={onClose}
      doctorsList={doctorsList}
      conditionsList={conditionsList}
      onPatientUpdated={onPatientUpdated}
    />
  );
};

export default EditPatientModal;

const EditPatientModalContent = ({
  patient,
  onClose,
  doctorsList = [],
  conditionsList = [],
  onPatientUpdated,
}) => {
  const initialDoctorId =
    typeof patient.doctorId === 'object'
      ? patient.doctorId?._id || ''
      : patient.doctorId || '';

  const [formData, setFormData] = useState({
    name: patient.name || '',
    email: patient.email || '',
    phone: patient.phone || '',
    address: patient.address || '',
    city: patient.city || '',
    age: patient.age !== undefined && patient.age !== null ? String(patient.age) : '',
    gender: patient.gender || 'Male',
    blood_group: patient.blood_group || 'A+',
    patientCondition: patient.patientCondition || patient.condition || '',
  });
  const [fetchedConditions, setFetchedConditions] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [availableDoctors, setAvailableDoctors] = useState(doctorsList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const conditions = conditionsList.length > 0 ? conditionsList : fetchedConditions;

  useEffect(() => {
    if (conditionsList.length > 0) return;
    let ignore = false;
    getPatientCondition()
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (ignore) return;
        const list =
          json?.data?.data ||
          json?.data?.conditions ||
          json?.data ||
          json?.conditions ||
          (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          setFetchedConditions(list.filter(Boolean));
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [conditionsList.length]);

  useEffect(() => {
    let ignore = false;
    if (doctorsList.length === 0) {
      getDoctors('limit=100')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (ignore) return;
          const list =
            json?.data?.data ||
            json?.data?.doctors ||
            json?.data ||
            (Array.isArray(json) ? json : []);
          if (Array.isArray(list)) {
            setAvailableDoctors(list);
          }
        })
        .catch(() => {});
    }

    return () => {
      ignore = true;
    };
  }, [doctorsList.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');

    if (!formData.name.trim()) return setError('Patient name is required.');
    if (!formData.email.trim()) return setError('Email address is required.');
    if (!formData.phone.trim()) return setError('Phone number is required.');
    if (!formData.address.trim()) return setError('Address is required.');
    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      return setError('Please enter a valid age (positive number).');
    }
    if (!formData.gender) return setError('Gender is required.');
    if (!formData.blood_group) return setError('Blood group is required.');
    if (!selectedDoctorId) return setError('Please select an assigned doctor.');

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        blood_group: formData.blood_group.trim(),
        patientCondition: formData.patientCondition ? formData.patientCondition.trim() : '',
        doctorId: selectedDoctorId,
      };

      const res = await updatePatient(patient._id, payload);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        const errMsg =
          json.message ||
          json.error ||
          (Array.isArray(json.errors) ? json.errors.map((e) => e.msg || e.message).join(', ') : null) ||
          'Failed to update patient details.';
        throw new Error(errMsg);
      }

      setSuccess('Patient details updated successfully!');
      if (onPatientUpdated) {
        onPatientUpdated(json.data || payload);
      }

      setTimeout(() => {
        onClose();
        setSuccess('');
        setError('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error occurred while updating patient.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentConditions = conditions.length > 0 ? conditions : conditionsList;
  const baseConditions =
    currentConditions.length > 0 ? currentConditions : PATIENT_CONDITIONS;
  const availableConditions = Array.from(
    new Set([
      ...baseConditions,
      ...(formData.patientCondition ? [formData.patientCondition] : []),
    ])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Patient Details
              </h2>
              <p className="text-[11px] text-slate-500">
                Updating record for {patient.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
          <div>
            <Select
              label="Assigned Doctor"
              name="doctorId"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={availableDoctors.map((doc) => ({
                value: doc._id,
                label: `Dr. ${doc.name} (${doc.specialization || 'General'})`,
              }))}
              defaultOption="-- Select Doctor --"
              required
              accent="blue"
            />
          </div>
          <Input
            label="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            icon={User}
            accent="blue"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              icon={MapPin}
              accent="blue"
            />

            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              accent="blue"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Age"
              type="number"
              name="age"
              required
              min="0"
              max="130"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
              accent="blue"
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={GENDERS}
              required
              accent="blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Blood Group"
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
              options={BLOOD_GROUPS}
              required
              accent="blue"
            />

            <Select
              label="Patient Condition"
              name="patientCondition"
              value={formData.patientCondition}
              onChange={handleChange}
              options={availableConditions}
              placeholder="-- Select Condition (Optional) --"
              accent="blue"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
