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
