"use client";

import type { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down";
  trendLabel?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`bg-white/70 border border-cream-300 shadow-card rounded-lg p-5 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-overline text-ink-muted">{label}</p>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-50 text-forest-500">
            {icon}
          </div>
        )}
      </div>
      <p className="text-display text-forest-700 leading-none mb-1">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 text-caption">
          {trend === "up" ? (
            <ArrowUp size={14} className="text-success-600" />
          ) : (
            <ArrowDown size={14} className="text-error-600" />
          )}
          <span className={trend === "up" ? "text-success-600" : "text-error-600"}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
