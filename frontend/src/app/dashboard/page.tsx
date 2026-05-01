"use client";

import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { formatDateID } from "@/lib/ui";
import type { DashboardStats, ScanResponse } from "@/types/api";

const COLORS = ["#3f6e47", "#b85c38", "#8c7b6c", "#d4a574", "#5a8a62"];

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

  const cropData = stats?.by_crop.map((c) => ({
    name: c.crop_type === "rice" ? "Padi" : "Jagung",
    value: c.count,
    disease: c.disease_count,
  })) ?? [];

  const diseaseData = stats?.top_diseases.map((d) => ({
    name: d.disease,
    count: d.count,
  })) ?? [];

  const timelineData = stats?.timeline.map((t) => ({
    month: t.month.slice(0, 7),
    scan: t.count,
    disease: t.disease_count,
  })) ?? [];

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
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Pie — Crop distribution */}
        <div className="rounded border border-cream-darker bg-cream-dark/30 p-5">
          <h3 className="mb-1 text-sm font-medium text-ink-soft">Distribusi Tanaman</h3>
          <p className="mb-4 text-xs text-ink-muted">Perbandingan scan berdasarkan jenis tanaman</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  stroke="none"
                >
                  {cropData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid #e2dcd0",
                    fontSize: 12,
                  }}
                  formatter={(value, _name, props) => {
                    const diseaseCount = (props?.payload as { disease?: number } | undefined)?.disease ?? 0;
                    return [`${value} scan (${diseaseCount} penyakit)`, _name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {cropData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bar — Top diseases */}
        <div className="rounded border border-cream-darker bg-cream-dark/30 p-5">
          <h3 className="mb-1 text-sm font-medium text-ink-soft">Penyakit Terbanyak</h3>
          <p className="mb-4 text-xs text-ink-muted">Jenis penyakit yang paling sering terdeteksi</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "#5c5348" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid #e2dcd0",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "#e8e4dc" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#b85c38" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area — Timeline */}
        <div className="rounded border border-cream-darker bg-cream-dark/30 p-5 lg:col-span-2">
          <h3 className="mb-1 text-sm font-medium text-ink-soft">Trend Scan Bulanan</h3>
          <p className="mb-4 text-xs text-ink-muted">Volume scan dan deteksi penyakit per bulan</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ left: 0, right: 10 }}>
                <defs>
                  <linearGradient id="colorScan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f6e47" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3f6e47" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDisease" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b85c38" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#b85c38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#8c7b6c" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8c7b6c" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 6,
                    border: "1px solid #e2dcd0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scan"
                  stroke="#3f6e47"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScan)"
                  name="Total Scan"
                />
                <Area
                  type="monotone"
                  dataKey="disease"
                  stroke="#b85c38"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDisease)"
                  name="Penyakit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
