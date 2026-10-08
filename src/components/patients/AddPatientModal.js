'use client';

import { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
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
import { getDoctors, createPatient } from '@/lib/api-client';
import { BLOOD_GROUPS, GENDERS, PATIENT_CONDITIONS } from '@/lib/constants';

const AddPatientModal = ({
  isOpen,
  onClose,
  doctor = null,
  doctorsList = [],
  onPatientAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    age: '',
    gender: 'Male',
    blood_group: 'A+',
    patientCondition: '',
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState(doctorsList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const effectiveDoctorId = doctor?._id || selectedDoctorId;

  useEffect(() => {
    if (!isOpen || doctor?._id || doctorsList.length > 0) return;

    let ignore = false;
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
          setSelectedDoctorId((prev) => prev || (list[0]?._id ?? ''));
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [isOpen, doctor?._id, doctorsList.length]);

  if (!isOpen) return null;

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
    if (!effectiveDoctorId) return setError('Please select a doctor to assign the patient to.');

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
        doctorId: effectiveDoctorId,
      };

      const res = await createPatient(payload);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        const errMsg =
          json.message ||
          json.error ||
          (Array.isArray(json.errors) ? json.errors.map((e) => e.msg || e.message).join(', ') : null) ||
          'Failed to create patient.';
        throw new Error(errMsg);
      }

      const createdPatient = json.data || payload;
      setSuccess('Patient added successfully under doctor!');

      if (onPatientAdded) {
        onPatientAdded(createdPatient);
      }

      setTimeout(() => {
        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          age: '',
          gender: 'Male',
          blood_group: 'A+',
          patientCondition: '',
        });
        setSuccess('');
        setError('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Error occurred while saving patient.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableConditions = PATIENT_CONDITIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Patient
              </h2>
              <p className="text-[11px] text-slate-500">
                {doctor ? `Assigning directly to Dr. ${doctor.name}` : 'Register a new patient record'}
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

          {doctor ? (
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Dr. {doctor.name}
                </span>
                {doctor.specialization && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    &bull; {doctor.specialization}
                  </span>
                )}
              </div>
              {doctor.hospital && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {doctor.hospital}
                </span>
              )}
            </div>
          ) : (
            <div>
              <Select
                label="Assign to Doctor"
                name="doctorId"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                options={availableDoctors.map((doc) => ({
                  value: doc._id,
                  label: `Dr. ${doc.name} (${doc.specialization || 'General'})`,
                }))}
                defaultOption="-- Select a Doctor --"
                required
                accent="blue"
              />
            </div>
          )}

          <Input
            label="Patient Full Name"
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
              <UserPlus className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Add Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
