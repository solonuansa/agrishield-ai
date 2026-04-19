/**
 * Kartu hasil deteksi penyakit — menampilkan nama penyakit,
 * confidence bar, dan daftar alternatif diagnosis.
 */
import type { ScanResult } from "@/api/scans";

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

function confidenceColor(pct: number): string {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-red-400";
}

interface DiseaseCardProps {
  result: ScanResult;
}

export default function DiseaseCard({ result }: DiseaseCardProps) {
  const isHealthy = result.detected_disease.includes("healthy");
  const confidencePct = Math.round(result.confidence * 100);
  const displayName = DISEASE_LABELS[result.detected_disease] ?? result.detected_disease;

  return (
    <div className={`rounded-2xl border p-6 ${isHealthy ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
      {/* Status ikon + nama penyakit */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{isHealthy ? "✅" : "⚠️"}</span>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
            {isHealthy ? "Tidak Terdeteksi Penyakit" : "Penyakit Terdeteksi"}
          </p>
          <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
          {result.is_mock && (
            <span className="inline-block mt-1 text-xs bg-gray-200 text-gray-600 rounded px-2 py-0.5">
              Mode Demo
            </span>
          )}
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tingkat keyakinan</span>
          <span className="font-semibold text-gray-700">{confidencePct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${confidenceColor(confidencePct)}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Alternatif diagnosis */}
      {result.alternatives.length > 0 && !isHealthy && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Kemungkinan lain:</p>
          <div className="space-y-1">
            {result.alternatives.map((alt) => (
              <div key={alt.disease} className="flex justify-between text-sm">
                <span className="text-gray-600">{DISEASE_LABELS[alt.disease] ?? alt.disease}</span>
                <span className="text-gray-400">{Math.round(alt.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
