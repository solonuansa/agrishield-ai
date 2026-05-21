"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children?: ReactNode;
  ariaLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-forest-700 text-cream-100 hover:bg-forest-800 hover:shadow-md active:scale-[0.98] disabled:opacity-50",
  secondary:
    "border border-cream-300 text-ink-muted hover:border-ink-muted hover:text-ink active:scale-[0.98]",
  ghost:
    "text-ink-muted hover:bg-cream-200/60 hover:text-ink active:scale-[0.98]",
  danger:
    "bg-error-600 text-white hover:bg-error-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[36px] px-3 py-1.5 text-sm gap-1.5 rounded-sm",
  md: "min-h-[44px] px-5 py-2.5 text-[0.95rem] gap-2 rounded-sm",
  lg: "min-h-[52px] px-7 py-3 text-base gap-2.5 rounded-md",
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      children,
      className = "",
      disabled,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const iconSize = iconSizes[size];

    const resolvedAriaLabel =
      ariaLabel ||
      (!children ? (Icon ? (Icon as { displayName?: string }).displayName || "button" : "button") : undefined);

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-label={resolvedAriaLabel}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 whitespace-nowrap select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin shrink-0" />
        ) : Icon ? (
          <Icon size={iconSize} className="shrink-0" />
        ) : null}
        <span>{children}</span>
        {!loading && IconRight && (
          <IconRight size={iconSize} className="shrink-0" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
