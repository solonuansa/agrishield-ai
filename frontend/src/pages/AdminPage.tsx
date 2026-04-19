/**
 * Halaman Admin/Government — statistik nasional agregat.
 * Hanya bisa diakses oleh user dengan role admin atau government.
 */
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { adminApi, type AdminStats } from "@/api/admin";
import { useAuthStore } from "@/stores/authStore";

const DISEASE_LABELS: Record<string, string> = {
  rice_leaf_blast: "Blast Padi",
  rice_bacterial_leaf_blight: "Hawar Daun Bakteri",
  rice_brown_spot: "Bercak Cokelat",
  rice_hispa: "Hispa Padi",
  corn_northern_leaf_blight: "Hawar Daun Utara",
  corn_common_rust: "Karat Jagung",
  corn_gray_leaf_spot: "Bercak Abu Jagung",
};

function diseaseLabel(d: string): string {
  return DISEASE_LABELS[d] ?? d.replace(/_/g, " ");
}

export default function AdminPage() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect jika bukan admin/government
  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "government")) {
    window.location.href = "/";
    return null;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
    staleTime: 10 * 60 * 1000, // 10 menit
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-primary font-bold text-lg">AgriShield AI</a>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              {user?.role === "admin" ? "Admin" : "Pemerintah"}
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/map" className="text-gray-500 hover:text-primary transition-colors">Peta Wabah</a>
            <span className="text-gray-400">{user?.full_name}</span>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Nasional</h1>
          <p className="text-sm text-gray-500 mt-0.5">Statistik agregat seluruh pengguna AgriShield AI</p>
        </div>

        {isLoading && <LoadingSkeleton />}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            Gagal memuat statistik. Periksa koneksi dan coba lagi.
          </div>
        )}

        {data && <AdminContent stats={data} />}
      </main>
    </div>
  );
}

// ─── AdminContent ──────────────────────────────────────────────────────────────

function AdminContent({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Scan" value={stats.total_scans} />
        <StatCard label="Total Pengguna" value={stats.total_users} />
        <StatCard label="Penyakit Terdeteksi" value={stats.disease_detected} accent="text-red-600" />
        <StatCard label="Tanaman Sehat" value={stats.healthy_detected} accent="text-green-600" />
        <StatCard label="Alert Aktif" value={stats.active_alerts} accent="text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline grafik */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Aktivitas Scan (12 Minggu)</h2>
          {stats.timeline.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.timeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickFormatter={(w) => w.split("-")[1] ? `W${w.split("-")[1]}` : w}
                />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip
                  labelFormatter={(w) => `Minggu ${w}`}
                  formatter={(value, name) => [
                    value,
                    name === "total" ? "Total Scan" : "Penyakit",
                  ]}
                />
                <Bar dataKey="total" fill="#86efac" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disease_count" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 10 penyakit nasional */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top Penyakit Nasional</h2>
          {stats.top_diseases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-2.5">
              {stats.top_diseases.map((d, i) => {
                const max = stats.top_diseases[0].count;
                const pct = Math.round((d.count / max) * 100);
                return (
                  <div key={d.disease + d.crop_type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">
                        {i + 1}. {diseaseLabel(d.disease)}
                      </span>
                      <span className="text-gray-400">{d.count} kasus</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.crop_type === "rice" ? "bg-green-400" : "bg-yellow-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 pt-1">Hijau = padi, kuning = jagung</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabel per provinsi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Aktivitas per Provinsi (Top 10)</h2>
        {stats.by_province.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada data lokasi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Provinsi</th>
                  <th className="pb-2 font-medium text-right">Total Scan</th>
                  <th className="pb-2 font-medium text-right">Penyakit</th>
                  <th className="pb-2 font-medium text-right">% Sakit</th>
                  <th className="pb-2 font-medium">Penyakit Utama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.by_province.map((p) => {
                  const pct = p.total_scans > 0
                    ? Math.round((p.disease_count / p.total_scans) * 100)
                    : 0;
                  return (
                    <tr key={p.province} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 font-medium text-gray-800">{p.province}</td>
                      <td className="py-2.5 text-right text-gray-600">{p.total_scans}</td>
                      <td className="py-2.5 text-right text-red-500">{p.disease_count}</td>
                      <td className="py-2.5 text-right">
                        <span className={`font-medium ${pct >= 50 ? "text-red-500" : pct >= 30 ? "text-yellow-600" : "text-green-600"}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">
                        {p.top_disease ? diseaseLabel(p.top_disease) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent = "text-gray-900",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

// ─── LoadingSkeleton ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 h-72" />
        <div className="bg-white rounded-2xl border border-gray-100 h-72" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 h-64" />
    </div>
  );
}
