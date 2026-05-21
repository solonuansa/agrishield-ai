"use client";

import type { ReactNode } from "react";
import { Sprout } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-forest-50 text-forest-400">
        {icon || <Sprout size={36} strokeWidth={1.5} />}
      </div>
      <h3 className="text-heading text-forest-700 mb-2">{title}</h3>
      {description && (
        <p className="text-body text-ink-muted max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
