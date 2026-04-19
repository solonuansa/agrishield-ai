/**
 * Kartu ringkasan satu scan di halaman riwayat.
 * Menampilkan thumbnail, nama penyakit, crop type, dan waktu scan.
 */
import type { Scan } from "@/api/scans";

const DISEASE_LABELS: Record<string, string> = {
  rice_leaf_blast: "Blast Padi",
  rice_bacterial_leaf_blight: "Hawar Daun Bakteri",
  rice_brown_spot: "Bercak Cokelat Padi",
  rice_hispa: "Hispa Padi",
  rice_healthy: "Padi Sehat",
  corn_northern_leaf_blight: "Hawar Daun Utara Jagung",
  corn_common_rust: "Karat Jagung",
  corn_gray_leaf_spot: "Bercak Daun Abu-abu Jagung",
  corn_healthy: "Jagung Sehat",
};

const CROP_ICONS: Record<string, string> = {
  rice: "🌾",
  corn: "🌽",
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ScanHistoryCardProps {
  scan: Scan;
  onClick: (scan: Scan) => void;
}

export default function ScanHistoryCard({ scan, onClick }: ScanHistoryCardProps) {
  const isCompleted = scan.status === "completed";
  const isFailed = scan.status === "failed";
  const isHealthy = scan.result?.detected_disease.includes("healthy") ?? false;
  const confidencePct = scan.result ? Math.round(scan.result.confidence * 100) : null;

  const diseaseName = scan.result
    ? (DISEASE_LABELS[scan.result.detected_disease] ?? scan.result.detected_disease)
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick(scan)}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all p-4 flex gap-4"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
        {scan.image_url ? (
          <img
            src={scan.image_url}
            alt="Foto tanaman"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">{CROP_ICONS[scan.crop_type] ?? "🌿"}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs text-gray-400">{formatRelativeTime(scan.created_at)}</span>
          <StatusBadge status={scan.status} />
        </div>

        {isCompleted && diseaseName ? (
          <>
            <p className="font-semibold text-gray-900 text-sm truncate">
              {isHealthy ? "✅ " : "⚠️ "}
              {diseaseName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {CROP_ICONS[scan.crop_type]} {scan.crop_type === "rice" ? "Padi" : "Jagung"}
              {confidencePct != null && (
                <span className="ml-2 text-gray-400">· Keyakinan {confidencePct}%</span>
              )}
            </p>
          </>
        ) : isFailed ? (
          <p className="text-sm text-red-500 font-medium">Analisis gagal</p>
        ) : (
          <p className="text-sm text-gray-400 italic">Sedang diproses...</p>
        )}
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") return null;
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-500",
    processing: "bg-blue-50 text-blue-600",
    failed: "bg-red-50 text-red-500",
  };
  const labels: Record<string, string> = {
    pending: "Menunggu",
    processing: "Memproses",
    failed: "Gagal",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}
