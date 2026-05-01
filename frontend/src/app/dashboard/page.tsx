"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { formatDateID } from "@/lib/ui";
import type { DashboardStats, ScanResponse } from "@/types/api";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded border border-cream-darker bg-cream-dark/30" />
        <div className="h-56 animate-pulse rounded border border-cream-darker bg-cream-dark/30" />
        <div className="h-60 animate-pulse rounded border border-cream-darker bg-cream-dark/30 lg:col-span-2" />
      </div>
    ),
  }
);

function DashboardContent() {
  const token = getAccessToken();

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<DashboardStats>("/dashboard/stats", token),
    enabled: Boolean(token),
  });

  const scansQuery = useQuery({
    queryKey: ["recent-scans"],
    queryFn: () => apiGet<ScanResponse[]>("/scans?per_page=5", token),
    enabled: Boolean(token),
  });

  const stats = statsQuery.data;
  const scans = scansQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="mb-10 space-y-3">
        <p className="section-kicker">Dashboard</p>
        <h1 className="page-title">Ringkasan aktivitas akun.</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-0 border-t border-cream-darker lg:grid-cols-4">
        <div className="border-b border-cream-darker py-6 lg:border-r">
          <p className="font-serif text-3xl font-semibold text-forest-700">{stats?.total_scans ?? 0}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Total Scan</p>
        </div>
        <div className="border-b border-cream-darker py-6 lg:border-r">
          <p className="font-serif text-3xl font-semibold text-forest-700">{stats?.disease_detected ?? 0}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Penyakit</p>
        </div>
        <div className="border-b border-cream-darker py-6 lg:border-r">
          <p className="font-serif text-3xl font-semibold text-forest-700">{stats?.healthy_detected ?? 0}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Sehat</p>
        </div>
        <div className="border-b border-cream-darker py-6">
          <p className="font-serif text-3xl font-semibold text-clay">{stats?.completed_scans ?? 0}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Selesai Diproses</p>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts stats={stats} />

      {/* Recent scans */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium text-forest-700">Scan Terakhir</h2>
        </div>

        {scansQuery.isLoading ? (
          <p className="text-sm text-ink-muted">Memuat riwayat scan...</p>
        ) : scansQuery.isError ? (
          <p className="text-sm text-clay-dark">Gagal memuat riwayat scan.</p>
        ) : scans.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada riwayat scan.</p>
        ) : (
          <div className="divide-y divide-cream-darker/40">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="w-20 text-xs font-medium text-ink-muted">{scan.id.slice(0, 8)}</span>
                  <span className="text-sm text-ink-soft">
                    {scan.result?.detected_disease || "Sedang diproses"}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-ink-muted">{formatDateID(scan.created_at)}</span>
                  <span className="text-sm font-medium text-forest-700">
                    {scan.result ? `${Math.round(scan.result.confidence * 100)}%` : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
