/**
 * Halaman utama scan — upload foto, pilih tanaman, analisis, dan lihat hasil.
 * Bisa diakses tanpa login (guest scan).
 *
 * Catatan: UI state (upload / analyzing / result) diturunkan langsung dari
 * React Query data tanpa useEffect, sesuai panduan project.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { scansApi, type CropType, type Scan } from "@/api/scans";
import { useAuthStore } from "@/stores/authStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import ImageUploader from "@/components/ImageUploader";
import LocationPicker from "@/components/LocationPicker";
import DiseaseCard from "@/components/DiseaseCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import AlertBell from "@/components/AlertBell";

export default function ScanPage() {
  const { isAuthenticated } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState<CropType>("rice");
  const [scanId, setScanId] = useState<string | null>(null);
  const geo = useGeolocation();

  // --- Upload mutation ---
  const uploadMutation = useMutation({
    mutationFn: scansApi.create,
    onSuccess: (scan) => {
      setScanId(scan.id);
    },
  });

  // --- Polling hasil scan ---
  const { data: scanData } = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => scansApi.getById(scanId!),
    enabled: !!scanId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 2000;
    },
  });

  // Derive UI state langsung dari data — tanpa useEffect
  const isAnalyzing =
    !!scanId && scanData?.status !== "completed" && scanData?.status !== "failed";
  const isResult = scanData?.status === "completed";
  const isFailed = scanData?.status === "failed";
  const showUpload = !isAnalyzing && !isResult;

  function handleAnalyze() {
    if (!selectedFile) return;
    uploadMutation.mutate({
      file: selectedFile,
      crop_type: cropType,
      latitude: geo.coords?.lat,
      longitude: geo.coords?.lng,
    });
  }

  function handleReset() {
    setSelectedFile(null);
    setScanId(null);
    uploadMutation.reset();
    geo.clear();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="text-primary font-bold text-lg">
            🌿 AgriShield AI
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/map"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              Peta
            </a>
            {isAuthenticated ? (
              <a
                href="/history"
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Riwayat
              </a>
            ) : (
              <a
                href="/login"
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Masuk
              </a>
            )}
            <AlertBell lat={geo.coords?.lat} lng={geo.coords?.lng} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {showUpload && (
          <UploadStep
            selectedFile={selectedFile}
            cropType={cropType}
            isUploading={uploadMutation.isPending}
            uploadError={
              isFailed
                ? "Analisis gagal. Silakan coba lagi."
                : uploadMutation.isError
                  ? "Gagal mengirim gambar. Periksa koneksi dan coba lagi."
                  : null
            }
            geoStatus={geo.status}
            geoCoords={geo.coords}
            onFileSelect={setSelectedFile}
            onCropTypeChange={setCropType}
            onGeoRequest={geo.request}
            onGeoClear={geo.clear}
            onAnalyze={handleAnalyze}
          />
        )}

        {isAnalyzing && (
          <AnalyzingStep cropType={cropType} hasLocation={!!geo.coords} />
        )}

        {isResult && scanData?.result && (
          <ResultStep
            scan={scanData}
            isAuthenticated={isAuthenticated}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

// ─── Sub-komponen ──────────────────────────────────────────────────────────────

interface UploadStepProps {
  selectedFile: File | null;
  cropType: CropType;
  isUploading: boolean;
  uploadError: string | null;
  geoStatus: ReturnType<typeof useGeolocation>["status"];
  geoCoords: ReturnType<typeof useGeolocation>["coords"];
  onFileSelect: (f: File) => void;
  onCropTypeChange: (c: CropType) => void;
  onGeoRequest: () => void;
  onGeoClear: () => void;
  onAnalyze: () => void;
}

function UploadStep({
  selectedFile,
  cropType,
  isUploading,
  uploadError,
  geoStatus,
  geoCoords,
  onFileSelect,
  onCropTypeChange,
  onGeoRequest,
  onGeoClear,
  onAnalyze,
}: UploadStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Deteksi Penyakit Tanaman
        </h1>
        <p className="text-gray-500 text-sm">
          Upload foto daun yang menunjukkan gejala untuk dianalisis AI
        </p>
      </div>

      {/* Upload area */}
      <ImageUploader onFileSelect={onFileSelect} disabled={isUploading} />

      {/* Pilih jenis tanaman */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jenis Tanaman
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["rice", "corn"] as CropType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onCropTypeChange(type)}
              className={`
                py-3 rounded-xl border-2 text-sm font-medium transition-colors
                ${cropType === type
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary/50"
                }
              `}
            >
              {type === "rice" ? "🌾 Padi" : "🌽 Jagung"}
            </button>
          ))}
        </div>
      </div>

      {/* Lokasi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lokasi Lahan
        </label>
        <LocationPicker
          status={geoStatus}
          coords={geoCoords}
          onRequest={onGeoRequest}
          onClear={onGeoClear}
        />
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {uploadError}
        </div>
      )}

      {/* Tombol analisis */}
      <button
        type="button"
        onClick={onAnalyze}
        disabled={!selectedFile || isUploading}
        className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-xl transition-colors text-base"
      >
        {isUploading ? "Mengirim gambar..." : "Analisis Sekarang"}
      </button>

      <p className="text-center text-xs text-gray-400">
        Tidak perlu login · Hasil tersimpan jika Anda{" "}
        <a href="/login" className="text-primary hover:underline">
          masuk ke akun
        </a>
      </p>
    </div>
  );
}

function AnalyzingStep({
  cropType,
  hasLocation,
}: {
  cropType: CropType;
  hasLocation: boolean;
}) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-6 animate-pulse">
        {cropType === "rice" ? "🌾" : "🌽"}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Menganalisis Gambar...
      </h2>
      <p className="text-gray-500 text-sm mb-2">
        AI sedang memeriksa kondisi tanaman Anda. Biasanya membutuhkan 5–10
        detik.
      </p>
      {hasLocation && (
        <p className="text-xs text-green-600 mb-6">
          📍 Lokasi lahan disertakan
        </p>
      )}
      {/* Loading bar animasi */}
      <div className="max-w-xs mx-auto bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full animate-[slide_2s_ease-in-out_infinite]"
          style={{ width: "60%" }}
        />
      </div>
    </div>
  );
}

interface ResultStepProps {
  scan: Scan;
  isAuthenticated: boolean;
  onReset: () => void;
}

function ResultStep({ scan, isAuthenticated, onReset }: ResultStepProps) {
  const result = scan.result!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hasil Analisis</h1>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-primary hover:underline font-medium"
        >
          Scan Baru
        </button>
      </div>

      {/* Lokasi yang digunakan */}
      {scan.latitude && scan.longitude && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>📍</span>
          <span>
            {scan.latitude.toFixed(4)}, {scan.longitude.toFixed(4)}
          </span>
        </div>
      )}

      {/* Foto tanaman */}
      {scan.image_url && (
        <img
          src={scan.image_url}
          alt="Tanaman yang dianalisis"
          loading="lazy"
          className="w-full rounded-2xl object-cover max-h-56"
        />
      )}

      {/* Kartu diagnosis */}
      <DiseaseCard result={result} />

      {/* Rekomendasi dari Gemini */}
      {result.recommendation && (
        <RecommendationPanel markdown={result.recommendation} />
      )}

      {/* Ajakan login untuk simpan riwayat — hanya untuk guest */}
      {!isAuthenticated && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-primary-700 font-medium mb-1">
            Simpan hasil ini ke riwayat lahan Anda
          </p>
          <p className="text-xs text-primary-500 mb-3">
            Daftar gratis untuk melacak riwayat penyakit di semua lahan Anda
          </p>
          <a
            href="/login?mode=register"
            className="inline-block bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Daftar Gratis
          </a>
        </div>
      )}
    </div>
  );
}
