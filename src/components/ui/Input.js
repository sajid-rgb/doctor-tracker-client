'use client';

import { useId } from 'react';
import { X } from 'lucide-react';

const Input = ({
  label,
  labelClassName = '',
  id,
  name,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  icon: Icon,
  endIcon: EndIcon,
  endAction,
  error,
  helperText,
  required = false,
  disabled = false,
  clearable = false,
  onClear,
  size = 'md',
  variant = 'default',
  accent = 'blue',
  className = '',
  inputClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

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

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { name: name || '', value: '' } });
    }
  };

  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const computedPlaceholder =
    placeholder !== undefined
      ? placeholder
      : label
      ? `Enter ${label.toLowerCase().replace(/[*:]/g, '').trim()}`
      : undefined;

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

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={computedPlaceholder}
          required={required}
          disabled={disabled}
          className={`w-full ${radiusClass} border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-slate-700'
          } bg-white dark:bg-slate-800 ${sizeClasses} ${
            Icon ? 'pl-9' : 'pl-3.5'
          } ${
            endAction || (clearable && hasValue) || EndIcon ? 'pr-10' : 'pr-3.5'
          } text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-3 ${accentRingClasses} disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${inputClassName}`}
          {...props}
        />

        {endAction ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAction}
          </div>
        ) : clearable && hasValue && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title="Clear"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        ) : EndIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <EndIcon className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;

export { Input as TextInput };
