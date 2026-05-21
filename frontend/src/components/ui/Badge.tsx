"use client";

import type { ReactNode, HTMLAttributes } from "react";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantColors: Record<BadgeVariant, string> = {
  default: "bg-forest-100 text-forest-800",
  success: "bg-success-100 text-success-800",
  warning: "bg-warning-100 text-warning-800",
  danger: "bg-error-100 text-error-800",
  info: "bg-info-100 text-info-800",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${variantColors[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
