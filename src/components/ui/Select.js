'use client';

import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
  label,
  labelClassName = '',
  id,
  name,
  value = '',
  onChange,
  options = [],
  placeholder,
  defaultOption,
  defaultOptionValue,
  defaultOptionDisabled = false,
  icon: Icon,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  accent = 'blue',
  className = '',
  selectClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  const sizeClasses = {
    sm: 'py-1.5 text-xs',
    md: 'py-2.5 text-sm',
    lg: 'py-3 text-base',
  }[size] || 'py-2.5 text-sm';

  const radiusClass = variant === 'filter' ? 'rounded-lg' : 'rounded-xl';

  const accentRingClasses = {
    blue: 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
    cyan: 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
    indigo: 'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15',
    slate: 'focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 dark:focus:border-slate-300 dark:focus:ring-slate-300/10',
  }[accent] || 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15';

  const emptyPlaceholder = placeholder || defaultOption;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full appearance-none ${radiusClass} border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-slate-700'
          } bg-white dark:bg-slate-800 ${sizeClasses} ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-8 text-slate-900 dark:text-white focus:outline-hidden focus:ring-3 ${accentRingClasses} disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer ${selectClassName}`}
          {...props}
        >
          {emptyPlaceholder !== undefined && (
            <option
              value={defaultOptionValue !== undefined ? defaultOptionValue : placeholder ? '' : 'all'}
              disabled={defaultOptionDisabled}
            >
              {emptyPlaceholder}
            </option>
          )}

          {options.map((opt, idx) => {
            if (opt === null || opt === undefined) return null;

            if (typeof opt === 'string' || typeof opt === 'number') {
              return (
                <option key={`${opt}-${idx}`} value={opt}>
                  {opt}
                </option>
              );
            }

            const optVal =
              opt.value !== undefined
                ? opt.value
                : opt._id !== undefined
                ? opt._id
                : opt.id !== undefined
                ? opt.id
                : String(idx);

            const optLabel =
              opt.label !== undefined
                ? opt.label
                : opt.name
                ? `${opt.name}${opt.specialization ? ` (${opt.specialization})` : ''}${
                    opt.hospital ? ` - ${opt.hospital}` : ''
                  }`
                : String(optVal);

            return (
              <option key={`${optVal}-${idx}`} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;

export { Select, Select as Dropdown };
