"use client";

import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { formatDateID } from "@/lib/ui";

type ScanResponse = {
  id: string;
  crop_type: "rice" | "corn";
  created_at: string;
  result: {
    detected_disease: string;
    confidence: number;
  } | null;
};

function cropLabel(value: "rice" | "corn") {
  return value === "rice" ? "Padi" : "Jagung";
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
      <div className="mb-10 space-y-3">
        <p className="section-kicker">Riwayat</p>
        <h1 className="page-title">Semua scan Anda.</h1>
      </div>

      {scansQuery.isLoading ? (
        <p className="text-sm text-ink-muted">Memuat data...</p>
      ) : scansQuery.isError ? (
        <p className="text-sm text-clay-dark">Gagal memuat riwayat scan.</p>
      ) : scans.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada riwayat scan.</p>
      ) : (
        <div className="border-t border-cream-darker">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="-mx-2 flex flex-col justify-between gap-2 border-b border-cream-darker/40 px-2 py-5 transition-colors hover:bg-cream-dark/30 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-6">
                <span className="w-20 text-xs font-medium text-ink-muted">{scan.id.slice(0, 8)}</span>
                <span className="text-sm text-ink-soft">{scan.result?.detected_disease || "Sedang diproses"}</span>
              </div>
              <div className="flex items-center gap-6 sm:gap-8">
                <span className="text-xs text-ink-muted">{formatDateID(scan.created_at)}</span>
                <span className="text-xs text-ink-muted">{cropLabel(scan.crop_type)}</span>
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
