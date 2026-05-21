"use client";

import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "flat";
  children: ReactNode;
}

const variants = {
  default: "bg-white/70 border border-cream-300 shadow-card rounded-lg",
  interactive:
    "bg-white/70 border border-cream-300 shadow-card rounded-lg hover:shadow-card-hover hover:border-cream-400 transition-all duration-200 cursor-pointer",
  flat: "bg-cream-200/60 border border-cream-200 rounded-lg",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
