"use client";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getStatusVariant, getStatusLabel } from "@/lib/dashboard-utils";
import { formatDateID } from "@/lib/ui";
import type { ScanResponse } from "@/types/api";

interface RecentScansListProps {
  scans: ScanResponse[];
  isLoading: boolean;
  isError: boolean;
  t: (key: string) => string;
}

export default function RecentScansList({ scans, isLoading, isError, t }: RecentScansListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-clay-dark">{t("dashboard.loadError")}</p>;
  }

  if (scans.length === 0) {
    return (
      <EmptyState
        title={t("dashboard.emptyHistory")}
        description={t("dashboard.emptyHistoryDesc")}
      />
    );
  }

  return (
    <div className="divide-y divide-cream-darker/40">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="w-20 text-xs font-medium text-ink-muted">
              {scan.id.slice(0, 8)}
            </span>
            <span className="text-sm text-ink-soft">
              {scan.result?.detected_disease || t("dashboard.processing")}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-ink-muted">
              {formatDateID(scan.created_at)}
            </span>
            <Badge variant={getStatusVariant(scan)}>
              {getStatusLabel(scan, t)}
            </Badge>
            <span className="text-sm font-medium text-forest-700">
              {scan.result
                ? `${Math.round(scan.result.confidence * 100)}%`
                : "-"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
