"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`field-input ${icon ? "pl-7" : ""} ${error ? "error" : ""} ${className}`}
            {...props}
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

Input.displayName = "Input";
