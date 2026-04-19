/**
 * Halaman riwayat scan — menampilkan semua scan milik user yang login.
 * Hanya bisa diakses oleh pengguna yang sudah autentikasi.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { scansApi, type Scan } from "@/api/scans";
import { useAuthStore } from "@/stores/authStore";
import ScanHistoryCard from "@/components/ScanHistoryCard";
import DiseaseCard from "@/components/DiseaseCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import AlertBell from "@/components/AlertBell";

export default function HistoryPage() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  // Redirect ke login jika belum autentikasi
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">🌿 AgriShield AI</a>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex gap-4 text-sm text-gray-500">
              <a href="/scan" className="hover:text-primary transition-colors">Scan</a>
              <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
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

      <main className="max-w-2xl mx-auto px-4 py-8">
        {selectedScan ? (
          <ScanDetailView
            scan={selectedScan}
            onBack={() => setSelectedScan(null)}
          />
        ) : (
          <ScanListView
            page={page}
            onPageChange={setPage}
            onSelectScan={setSelectedScan}
          />
        )}
      </main>
    </div>
  );
}

// ─── Daftar scan ────────────────────────────────────────────────────────────

interface ScanListViewProps {
  page: number;
  onPageChange: (page: number) => void;
  onSelectScan: (scan: Scan) => void;
}

function ScanListView({ page, onPageChange, onSelectScan }: ScanListViewProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["scans", "mine", page],
    queryFn: () => scansApi.listMine(page, 20),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Scan</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.meta.total} scan tersimpan
            </p>
          )}
        </div>
        <a
          href="/scan"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          + Scan Baru
        </a>
      </div>

      {isLoading && <ScanListSkeleton />}

      {isError && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-medium text-gray-600">Gagal memuat riwayat scan</p>
          <p className="text-sm">Periksa koneksi internet Anda dan coba lagi</p>
        </div>
      )}

      {data && data.scans.length === 0 && (
        <EmptyState />
      )}

      {data && data.scans.length > 0 && (
        <>
          <div className="space-y-3">
            {data.scans.map((scan) => (
              <ScanHistoryCard
                key={scan.id}
                scan={scan}
                onClick={onSelectScan}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.meta.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:border-primary/50 transition-colors"
              >
                ← Sebelumnya
              </button>
              <span className="text-sm text-gray-500">
                Halaman {page} / {data.meta.total_pages}
              </span>
              <button
                type="button"
                disabled={page >= data.meta.total_pages}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:border-primary/50 transition-colors"
              >
                Berikutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-6xl mb-4">🌱</p>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Scan</h2>
      <p className="text-gray-400 text-sm mb-6">
        Mulai scan pertama Anda untuk mendeteksi penyakit tanaman
      </p>
      <a
        href="/scan"
        className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors"
      >
        Mulai Scan Sekarang
      </a>
    </div>
  );
}

function ScanListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Detail satu scan ───────────────────────────────────────────────────────

interface ScanDetailViewProps {
  scan: Scan;
  onBack: () => void;
}

function ScanDetailView({ scan, onBack }: ScanDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Tombol kembali */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        ← Kembali ke Riwayat
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Detail Scan</h1>
        <span className="text-xs text-gray-400">
          {new Date(scan.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Foto tanaman */}
      {scan.image_url && (
        <img
          src={scan.image_url}
          alt="Tanaman yang dianalisis"
          loading="lazy"
          className="w-full rounded-2xl object-cover max-h-56"
        />
      )}

      {/* Status jika belum selesai */}
      {scan.status !== "completed" && (
        <div className={`rounded-2xl border p-5 text-center ${
          scan.status === "failed"
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-blue-50 border-blue-200 text-blue-600"
        }`}>
          {scan.status === "failed"
            ? "Analisis gagal. Coba scan ulang dengan foto yang lebih jelas."
            : "Sedang memproses analisis..."}
        </div>
      )}

      {/* Hasil analisis */}
      {scan.result && (
        <>
          <DiseaseCard result={scan.result} />
          {scan.result.recommendation && (
            <RecommendationPanel markdown={scan.result.recommendation} />
          )}
        </>
      )}

      {/* Tombol scan ulang */}
      <div className="text-center">
        <a
          href="/scan"
          className="inline-block bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors"
        >
          Scan Tanaman Baru
        </a>
      </div>
    </div>
  );
}
