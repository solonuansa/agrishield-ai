"use client";

import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Clock } from "lucide-react";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { formatDateID } from "@/lib/ui";
import type { ScanResponse } from "@/types/api";

function cropLabel(value: "rice" | "corn") {
  return value === "rice" ? "Padi" : "Jagung";
}

function isHealthyDisease(disease: string | null | undefined): boolean {
  if (!disease) return false;
  const lower = disease.toLowerCase();
  return lower === "healthy" || lower === "sehat";
}

function HistoryContent() {
  const token = getAccessToken();

  const scansQuery = useQuery({
    queryKey: ["history-scans"],
    queryFn: () => apiGet<ScanResponse[]>("/scans?per_page=30", token),
    enabled: Boolean(token),
  });

  const scans = scansQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <PageHeader title="Riwayat Scan" description="Semua riwayat pemindaian Anda." />

      {scansQuery.isLoading ? (
        <SkeletonLines count={5} />
      ) : scansQuery.isError ? (
        <p className="text-sm text-clay-dark">Gagal memuat riwayat scan.</p>
      ) : scans.length === 0 ? (
        <EmptyState
          icon={<Clock size={36} strokeWidth={1.5} />}
          title="Belum Ada Riwayat"
          description="Scan pertama Anda akan muncul di sini."
        />
      ) : (
        <div className="border-t border-cream-darker">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="-mx-2 flex flex-col justify-between gap-2 border-b border-cream-darker/40 px-2 py-5 transition-colors hover:bg-cream-dark/30 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-6">
                <span className="w-20 text-xs font-medium text-ink-muted">{scan.id.slice(0, 8)}</span>
                {scan.result?.detected_disease ? (
                  <Badge variant={isHealthyDisease(scan.result.detected_disease) ? "success" : "warning"}>
                    {scan.result.detected_disease}
                  </Badge>
                ) : (
                  <span className="text-sm text-ink-muted">Sedang diproses</span>
                )}
              </div>
              <div className="flex items-center gap-6 sm:gap-8">
                <span className="text-xs text-ink-muted">{formatDateID(scan.created_at)}</span>
                <Badge variant="default">{cropLabel(scan.crop_type)}</Badge>
                <span className="text-sm font-medium text-forest-700">
                  {scan.result ? `${Math.round(scan.result.confidence * 100)}%` : "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
