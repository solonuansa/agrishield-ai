/**
 * Halaman dashboard — statistik scan milik user yang login.
 * Menampilkan kartu ringkasan, grafik timeline, dan breakdown penyakit.
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { dashboardApi, type DashboardStats } from "@/api/dashboard";
import { useAuthStore } from "@/stores/authStore";
import AlertBell from "@/components/AlertBell";

const DISEASE_LABELS: Record<string, string> = {
  rice_leaf_blast: "Blast Padi",
  rice_bacterial_leaf_blight: "Hawar Daun Bakteri",
  rice_brown_spot: "Bercak Cokelat Padi",
  rice_hispa: "Hispa Padi",
  corn_northern_leaf_blight: "Hawar Daun Utara",
  corn_common_rust: "Karat Jagung",
  corn_gray_leaf_spot: "Bercak Daun Abu-abu",
};

export default function DashboardPage() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">🌿 AgriShield AI</a>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex gap-4 text-sm text-gray-500">
              <a href="/scan" className="hover:text-primary transition-colors">Scan</a>
              <a href="/history" className="hover:text-primary transition-colors">Riwayat</a>
              <a href="/map" className="hover:text-primary transition-colors">Peta</a>
            </nav>
            <AlertBell />
            <span className="text-sm text-gray-400 hidden sm:block">{user?.full_name}</span>
            <button
              type="button"
              onClick={() => { clearAuth(); navigate("/login"); }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Judul */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selamat datang, {user?.full_name?.split(" ")[0]}
          </p>
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            Gagal memuat data dashboard. Coba muat ulang halaman.
          </div>
        )}

        {/* Kartu statistik utama */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Scan"
            value={data?.total_scans}
            icon="📷"
            isLoading={isLoading}
          />
          <StatCard
            label="Selesai Dianalisis"
            value={data?.completed_scans}
            icon="✅"
            isLoading={isLoading}
          />
          <StatCard
            label="Penyakit Terdeteksi"
            value={data?.disease_detected}
            icon="⚠️"
            valueColor="text-orange-600"
            isLoading={isLoading}
          />
          <StatCard
            label="Tanaman Sehat"
            value={data?.healthy_detected}
            icon="🌱"
            valueColor="text-green-600"
            isLoading={isLoading}
          />
        </div>

        {/* Baris tengah: timeline + breakdown tanaman */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Grafik timeline — 2/3 lebar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Aktivitas Scan (8 Minggu Terakhir)
            </h2>
            {isLoading ? (
              <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ) : !data || data.timeline.length === 0 ? (
              <EmptyChart />
            ) : (
              <TimelineChart data={data.timeline} />
            )}
          </div>

          {/* Breakdown per tanaman */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Per Jenis Tanaman</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data || data.by_crop.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>
            ) : (
              <CropBreakdownList crops={data.by_crop} total={data.completed_scans} />
            )}
          </div>
        </div>

        {/* Top penyakit */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Penyakit Paling Sering Terdeteksi
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !data || data.top_diseases.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm text-gray-400">Belum ada penyakit yang terdeteksi</p>
            </div>
          ) : (
            <TopDiseaseList diseases={data.top_diseases} />
          )}
        </div>

        {/* CTA scan baru */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-primary-800 text-sm">Cek kondisi tanaman Anda</p>
            <p className="text-xs text-primary-500 mt-0.5">Upload foto dan dapatkan diagnosis dalam hitungan detik</p>
          </div>
          <a
            href="/scan"
            className="flex-shrink-0 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Scan Sekarang
          </a>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-komponen ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  valueColor = "text-gray-900",
  isLoading,
}: {
  label: string;
  value: number | undefined;
  icon: string;
  valueColor?: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="text-2xl mb-2">{icon}</div>
      {isLoading ? (
        <div className="space-y-1">
          <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className={`text-2xl font-bold ${valueColor}`}>{value ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </>
      )}
    </div>
  );
}

function TimelineChart({ data }: { data: DashboardStats["timeline"] }) {
  // Format label minggu jadi lebih pendek: "2024-03" → "Mg 3"
  const chartData = data.map((d) => ({
    ...d,
    label: `Mg ${d.week.split("-")[1]}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} barGap={2} barSize={18}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          width={24}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(value: number, name: string) => [
            value,
            name === "disease_count" ? "Penyakit" : "Total Scan",
          ]}
        />
        <Bar dataKey="total" name="total" fill="#d1fae5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="disease_count" name="disease_count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.disease_count > 0 ? "#f97316" : "#d1fae5"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="h-40 flex items-center justify-center text-center">
      <div>
        <p className="text-2xl mb-1">📊</p>
        <p className="text-sm text-gray-400">Belum cukup data untuk grafik</p>
      </div>
    </div>
  );
}

function CropBreakdownList({
  crops,
  total,
}: {
  crops: DashboardStats["by_crop"];
  total: number;
}) {
  const CROP_LABELS: Record<string, string> = { rice: "🌾 Padi", corn: "🌽 Jagung" };
  const CROP_COLORS: Record<string, string> = { rice: "bg-green-500", corn: "bg-yellow-400" };

  return (
    <div className="space-y-3">
      {crops.map((c) => {
        const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
        return (
          <div key={c.crop_type}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{CROP_LABELS[c.crop_type] ?? c.crop_type}</span>
              <span className="text-gray-500 font-medium">{c.count} ({pct}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${CROP_COLORS[c.crop_type] ?? "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopDiseaseList({ diseases }: { diseases: DashboardStats["top_diseases"] }) {
  const maxCount = diseases[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      {diseases.map((d, i) => {
        const pct = Math.round((d.count / maxCount) * 100);
        const label = DISEASE_LABELS[d.disease] ?? d.disease;
        return (
          <div key={d.disease} className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 truncate">{label}</span>
                <span className="text-gray-500 font-medium ml-2 flex-shrink-0">{d.count}×</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-orange-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
