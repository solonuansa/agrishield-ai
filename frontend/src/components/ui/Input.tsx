"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
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
    const errorId = useId();
    const hintId = useId();

    const describedBy = [
      error ? errorId : null,
      hint && !error ? hintId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

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
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={`field-input ${icon ? "pl-7" : ""} ${error ? "error" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="field-error">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-caption text-ink-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
