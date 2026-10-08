'use client';

import { useId } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

const DatePicker = ({
  label,
  labelClassName = '',
  id,
  name,
  value = '',
  onChange,
  min,
  max,
  icon: Icon = CalendarIcon,
  error,
  helperText,
  required = false,
  disabled = false,
  clearable = false,
  onClear,
  size = 'sm',
  variant = 'filter',
  accent = 'blue',
  className = '',
  inputClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const sizeClasses = {
    sm: 'py-1 text-xs px-2.5',
    md: 'py-2.5 text-sm px-3.5',
    lg: 'py-3 text-base px-4',
  }[size] || 'py-1 text-xs px-2.5';

  const radiusClass = variant === 'filter' ? 'rounded-lg' : 'rounded-xl';

  const accentRingClasses = {
    blue: 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
    cyan: 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
    indigo: 'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15',
    slate: 'focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 dark:focus:border-slate-300 dark:focus:ring-slate-300/10',
  }[accent] || 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15';

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { name: name || '', value: '' } });
    }
  };

  const hasValue = Boolean(value);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative inline-flex items-center w-full">
        <input
          id={inputId}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={`w-full ${radiusClass} border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-slate-700'
          } bg-white dark:bg-slate-900 ${sizeClasses} text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-3 ${accentRingClasses} disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer ${inputClassName}`}
          {...props}
        />

        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title="Clear date"
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default DatePicker;

export const DateRangePicker = ({
  label = 'Date:',
  fromDate = '',
  onFromDateChange,
  toDate = '',
  onToDateChange,
  fromLabel = 'From',
  toLabel = 'To',
  accent = 'blue',
  size = 'sm',
  className = '',
  pickerClassName = 'flex-1 sm:flex-initial min-w-[120px] sm:w-32',
}) => {
  const accentIconClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    cyan: 'text-blue-600 dark:text-blue-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    slate: 'text-slate-600 dark:text-slate-400',
  }[accent] || 'text-blue-600 dark:text-blue-400';

  return (
    <div className={`flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto ${className}`}>
      {label && (
        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 text-xs shrink-0">
          <CalendarIcon className={`h-3.5 w-3.5 ${accentIconClasses}`} />
          <span>{label}</span>
        </span>
      )}

      <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-[130px]">
        <label className="text-xs text-slate-500 shrink-0">{fromLabel}</label>
        <DatePicker
          value={fromDate}
          onChange={(e) => onFromDateChange && onFromDateChange(e.target.value)}
          size={size}
          accent={accent}
          variant="filter"
          className={pickerClassName}
          aria-label={fromLabel}
        />
      </div>

      <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-[130px]">
        <label className="text-xs text-slate-500 shrink-0">{toLabel}</label>
        <DatePicker
          value={toDate}
          onChange={(e) => onToDateChange && onToDateChange(e.target.value)}
          size={size}
          accent={accent}
          variant="filter"
          className={pickerClassName}
          aria-label={toLabel}
        />
      </div>
    </div>
  );
}

export { DatePicker, DatePicker as Calendar, DateRangePicker as CalendarRange };
