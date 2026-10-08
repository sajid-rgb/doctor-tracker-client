'use client';

import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DatePicker';

const DoctorFilters = ({
  search,
  onSearchChange,
  specialization,
  onSpecializationChange,
  specializationsList = [],
  hospital,
  onHospitalChange,
  hospitalsList = [],
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onResetFilters,
}) => {
  const hasFilter =
    Boolean(search) ||
    specialization !== 'all' ||
    hospital !== 'all' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <div className="w-full sm:w-60 md:w-68">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search doctors..."
            icon={Search}
            clearable
            size="sm"
            variant="filter"
            accent="blue"
            aria-label="Search doctors"
          />
        </div>

        <div className="w-full min-[480px]:w-auto flex-1 min-[480px]:flex-initial min-w-[155px]">
          <Select
            value={specialization}
            onChange={(e) => onSpecializationChange(e.target.value)}
            options={specializationsList}
            defaultOption="All Specializations"
            size="sm"
            variant="filter"
            accent="blue"
            aria-label="Filter by specialization"
          />
        </div>

        <div className="w-full min-[480px]:w-auto flex-1 min-[480px]:flex-initial min-w-[155px]">
          <Select
            value={hospital}
            onChange={(e) => onHospitalChange(e.target.value)}
            options={hospitalsList}
            defaultOption="All Hospitals"
            size="sm"
            variant="filter"
            accent="blue"
            aria-label="Filter by hospital"
          />
        </div>

        <div className="w-full sm:w-auto">
          <DateRangePicker
            label="Created:"
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

export default DoctorFilters;
