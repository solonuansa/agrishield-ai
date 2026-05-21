"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = "", id, ...props },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`field-input appearance-none pr-8 ${error ? "error" : ""} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted"
          />
        </div>
        {error && (
          <p className="field-error">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-caption text-ink-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
