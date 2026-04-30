"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, UploadCloud } from "lucide-react";
import { apiGet, apiPostForm, ApiError } from "@/lib/api";

type CropType = "rice" | "corn";

type ScanResult = {
  detected_disease: string;
  confidence: number;
  recommendation: string | null;
};

type ScanResponse = {
  id: string;
  crop_type: CropType;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  result: ScanResult | null;
};

function cropLabel(value: CropType) {
  return value === "rice" ? "Padi" : "Jagung";
}

export default function ScanPage() {
  const [dragOver, setDragOver] = useState(false);
  const [cropType, setCropType] = useState<CropType>("rice");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationText, setLocationText] = useState("Lokasi belum dipilih");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFile = (file?: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorMessage("");
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    updateFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    updateFile(event.dataTransfer.files?.[0]);
  };

  const detectLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationText("Browser tidak mendukung geolocation");
      return;
    }

    setLocationText("Mendeteksi lokasi...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        setCoords({ latitude, longitude });
        setLocationText(`Lokasi tersimpan: ${latitude}, ${longitude}`);
      },
      () => {
        setLocationText("Izin lokasi ditolak");
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const runScan = async () => {
    if (!selectedFile) {
      setErrorMessage("Pilih foto daun terlebih dahulu.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("crop_type", cropType);

    if (coords.latitude !== undefined) {
      formData.append("latitude", String(coords.latitude));
    }

    if (coords.longitude !== undefined) {
      formData.append("longitude", String(coords.longitude));
    }

    try {
      const data = await apiPostForm<ScanResponse>("/scans", formData);
      setScanData(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menjalankan analisis. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshStatus = async () => {
    if (!scanData?.id) return;

    setIsSubmitting(true);
    try {
      const latest = await apiGet<ScanResponse>(`/scans/${scanData.id}`);
      setScanData(latest);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat status scan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-forest-700">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <div className="mb-10 space-y-3">
        <p className="section-kicker">Scan</p>
        <h1 className="page-title">Deteksi penyakit dalam hitungan detik.</h1>
      </div>

      <div
        className={`rounded border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragOver ? "border-forest-600 bg-forest-50" : "border-cream-darker bg-cream-dark"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-forest-700" />
        <p className="mt-3 font-serif text-2xl text-forest-700">Tarik foto daun ke area ini</p>
        <p className="mt-1 text-sm text-ink-muted">atau pilih file dari perangkat</p>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn-primary" onClick={() => fileInputRef.current?.click()}>
            Pilih File
          </button>
          <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={detectLocation}>
            <Camera className="h-4 w-4" />
            Gunakan Lokasi
          </button>
        </div>

        <p className="mt-4 text-xs text-ink-muted">JPG/PNG/WebP, maksimal 10 MB</p>
        <p className="mt-2 text-sm text-ink-soft">{selectedFile ? `File: ${selectedFile.name}` : "Belum ada file dipilih"}</p>
        <p className="mt-1 text-xs text-ink-muted">{locationText}</p>
      </div>

      <div className="mt-8">
        <label className="field-label">Jenis Tanaman</label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["rice", "corn"] as const).map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => setCropType(crop)}
              className={
                crop === cropType
                  ? "rounded border border-forest-600 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-700"
                  : "rounded border border-cream-darker px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
              }
            >
              {cropLabel(crop)}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <p className="mt-6 rounded border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay-dark">{errorMessage}</p>
      )}

      <button
        type="button"
        onClick={runScan}
        disabled={isSubmitting}
        className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Memproses..." : "Mulai Analisis"}
      </button>

      {scanData && (
        <div className="mt-8 rounded border border-cream-darker bg-cream-dark/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-darker/60 pb-3">
            <p className="text-sm font-semibold text-ink-soft">Scan #{scanData.id.slice(0, 8)}</p>
            <span className="rounded bg-forest-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-forest-700">
              {scanData.status}
            </span>
          </div>

          {scanData.result ? (
            <div className="mt-4 space-y-3">
              <p className="font-serif text-2xl text-forest-700">{scanData.result.detected_disease}</p>
              <p className="text-sm text-ink-muted">
                Keyakinan model: {Math.round(scanData.result.confidence * 100)}%
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                {scanData.result.recommendation || "Rekomendasi belum tersedia."}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-ink-muted">
                Hasil belum siap. Klik tombol di bawah untuk cek status terbaru.
              </p>
              <button
                type="button"
                onClick={refreshStatus}
                disabled={isSubmitting}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cek Status
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 border-t border-cream-darker/40 pt-8">
        <h3 className="field-label">Tips Pengambilan Foto</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>Pastikan pencahayaan cukup terang.</li>
          <li>Fokuskan kamera pada gejala di daun.</li>
          <li>Jarak ideal 10-30 cm dari objek.</li>
          <li>Hindari bayangan yang menutup area gejala.</li>
        </ul>
      </div>
    </div>
  );
}

