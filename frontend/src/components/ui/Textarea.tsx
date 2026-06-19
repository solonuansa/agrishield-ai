"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, rows = 4, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const hintId = hint && !error && inputId ? `${inputId}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`field-input resize-y min-h-[80px] ${error ? "error" : ""} ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        />
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

Textarea.displayName = "Textarea";
