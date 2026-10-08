'use client';

import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DatePicker';
import { BLOOD_GROUPS, GENDERS, PATIENT_CONDITIONS } from '@/lib/constants';

const PatientFilters = ({
  search,
  onSearchChange,
  gender,
  onGenderChange,
  bloodGroup,
  onBloodGroupChange,
  patientCondition = 'all',
  onConditionChange,
  conditionsList = [],
  doctorId,
  onDoctorChange,
  doctorsList = [],
  fromDate = '',
  onFromDateChange,
  toDate = '',
  onToDateChange,
  onResetFilters,
}) => {
  const hasFilter =
    Boolean(search) ||
    gender !== 'all' ||
    bloodGroup !== 'all' ||
    (patientCondition && patientCondition !== 'all') ||
    doctorId !== 'all' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const availableConditions =
    Array.isArray(conditionsList) ? conditionsList : [];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <div className="w-full sm:w-60 md:w-68">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patients..."
            icon={Search}
            clearable
            size="sm"
            variant="filter"
            accent="blue"
            aria-label="Search patients"
          />
        </div>
        <div className="w-full min-[480px]:w-auto flex-1 min-[480px]:flex-initial min-w-[120px]">
          <Select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            options={GENDERS}
            defaultOption="All Genders"
            size="sm"
            variant="filter"
            accent="blue"
            aria-label="Filter by gender"
          />
        </div>
        <div className="w-full min-[480px]:w-auto flex-1 min-[480px]:flex-initial min-w-[135px]">
          <Select
            value={bloodGroup}
            onChange={(e) => onBloodGroupChange(e.target.value)}
            options={BLOOD_GROUPS}
            defaultOption="All Blood Groups"
            size="sm"
            variant="filter"
            accent="blue"
            aria-label="Filter by blood group"
          />
        </div>
        {onConditionChange && (
          <div className="w-full min-[480px]:w-auto flex-1 min-[480px]:flex-initial min-w-[140px]">
            <Select
              value={patientCondition}
              onChange={(e) => onConditionChange(e.target.value)}
              options={availableConditions}
              defaultOption="All Conditions"
              size="sm"
              variant="filter"
              accent="blue"
              aria-label="Filter by condition"
            />
          </div>
        )}
        {doctorsList.length > 0 && (
          <div className="w-full min-[480px]:w-auto flex-1 min-[480px]:flex-initial min-w-[150px] sm:max-w-[200px]">
            <Select
              value={doctorId}
              onChange={(e) => onDoctorChange(e.target.value)}
              options={doctorsList.map((doc) => ({
                value: doc._id,
                label: doc.name,
              }))}
              defaultOption="All Doctors"
              size="sm"
              variant="filter"
              accent="blue"
              aria-label="Filter by doctor"
            />
          </div>
        )}
        <div className="w-full sm:w-auto">
          <DateRangePicker
            label="Registered:"
            fromDate={fromDate}
            onFromDateChange={onFromDateChange}
            toDate={toDate}
            onToDateChange={onToDateChange}
            accent="blue"
            size="sm"
          />
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors shrink-0 text-center"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientFilters;
