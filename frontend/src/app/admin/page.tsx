"use client";

import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { AdminStats } from "@/types/api";

function AdminContent() {
  const token = getAccessToken();

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiGet<AdminStats>("/admin/stats", token),
    enabled: Boolean(token),
  });

  const stats = statsQuery.data;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="mb-10 space-y-3">
        <p className="section-kicker">Admin</p>
        <h1 className="page-title">Panel administrasi nasional.</h1>
      </div>

      {statsQuery.isLoading ? (
        <p className="text-sm text-ink-muted">Memuat statistik nasional...</p>
      ) : statsQuery.isError || !stats ? (
        <p className="text-sm text-clay-dark">
          Data admin belum bisa diakses. Pastikan akun Anda memiliki role admin/pemerintah.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-0 border-t border-cream-darker lg:grid-cols-5">
            <div className="border-b border-cream-darker py-6 lg:border-r">
              <p className="font-serif text-3xl font-semibold text-forest-700">{stats.total_users}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Pengguna</p>
            </div>
            <div className="border-b border-cream-darker py-6 lg:border-r">
              <p className="font-serif text-3xl font-semibold text-forest-700">{stats.total_scans}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Scan Nasional</p>
            </div>
            <div className="border-b border-cream-darker py-6 lg:border-r">
              <p className="font-serif text-3xl font-semibold text-clay">{stats.disease_detected}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Kasus Penyakit</p>
            </div>
            <div className="border-b border-cream-darker py-6 lg:border-r">
              <p className="font-serif text-3xl font-semibold text-forest-700">{stats.healthy_detected}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Kasus Sehat</p>
            </div>
            <div className="border-b border-cream-darker py-6">
              <p className="font-serif text-3xl font-semibold text-clay">{stats.active_alerts}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Alert Aktif</p>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 font-serif text-2xl font-medium text-forest-700">Top Provinsi</h2>
            <div className="divide-y divide-cream-darker/40 border-t border-cream-darker">
              {stats.by_province.slice(0, 8).map((province) => (
                <div key={province.province} className="grid gap-2 py-4 sm:grid-cols-[1.5fr_1fr_1fr_2fr] sm:items-center">
                  <p className="text-sm font-medium text-ink-soft">{province.province}</p>
                  <p className="text-xs text-ink-muted">{province.total_scans} scan</p>
                  <p className="text-xs text-ink-muted">{province.disease_count} penyakit</p>
                  <p className="text-xs text-ink-muted">Dominan: {province.top_disease || "-"}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  );
}
