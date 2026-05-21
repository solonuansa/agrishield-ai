"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPostForm, ApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { ScanResponse } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/useToast";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

type CropType = "rice" | "corn";

function cropLabel(value: CropType) {
  return value === "rice" ? "Padi" : "Jagung";
}

function cropEmoji(value: CropType) {
  return value === "rice" ? "🌾" : "🌽";
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  completed: "success",
  processing: "warning",
  failed: "danger",
  pending: "info",
};

const statusLabelMap: Record<string, string> = {
  completed: "Selesai",
  processing: "Memproses",
  failed: "Gagal",
  pending: "Menunggu",
};

const PROCESSING_STEPS = [
  "Menganalisis gambar...",
  "Mendeteksi penyakit...",
  "Menyusun rekomendasi...",
];

const PHOTO_TIPS = [
  { icon: "☀️", text: "Pastikan pencahayaan cukup terang." },
  { icon: "🔍", text: "Fokuskan kamera pada gejala di daun." },
  { icon: "📏", text: "Jarak ideal 10-30 cm dari objek." },
  { icon: "🚫", text: "Hindari bayangan yang menutup area gejala." },
];

export default function ScanPage() {
  const [cropType, setCropType] = useState<CropType>("rice");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationText, setLocationText] = useState("Lokasi belum dipilih");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const toast = useToast();

  const handleFile = useCallback(
    (file: File) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setSelectedFile(file);
      setErrorMessage("");
    },
    [previewUrl]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [previewUrl]);

  const detectLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationText("Browser tidak mendukung geolocation");
      toast.warning("Browser tidak mendukung geolokasi");
      return;
    }

    setIsLocating(true);
    setLocationText("Mendeteksi lokasi...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        setCoords({ latitude, longitude });
        setLocationText(`Lokasi tersimpan: ${latitude}, ${longitude}`);
        setIsLocating(false);
        toast.success("Lokasi berhasil terdeteksi");
      },
      () => {
        setLocationText("Izin lokasi ditolak");
        setIsLocating(false);
        toast.error("Izin lokasi ditolak. Periksa pengaturan browser Anda.");
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [toast]);

  const runScan = useCallback(async () => {
    if (!selectedFile) {
      const msg = "Pilih foto daun terlebih dahulu.";
      setErrorMessage(msg);
      toast.warning(msg);
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
      const token = getAccessToken();
      const endpoint = token ? "/scans/auth" : "/scans";
      const data = await apiPostForm<ScanResponse>(endpoint, formData, token);
      setScanData(data);
      toast.success("Analisis berhasil dimulai!");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        const msg = "Gagal menjalankan analisis. Coba lagi.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFile, cropType, coords, toast]);

  const refreshStatus = useCallback(async () => {
    if (!scanData?.id) return;

    setIsSubmitting(true);
    try {
      const latest = await apiGet<ScanResponse>(`/scans/${scanData.id}`);
      setScanData(latest);
      if (latest.status === "completed") {
        toast.success("Hasil scan telah siap!");
      } else if (latest.status === "failed") {
        toast.error("Scan gagal diproses.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Gagal memuat status scan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [scanData, toast]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-forest-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <PageHeader
        title="Scan Deteksi"
        description="Unggah foto daun dan dapatkan diagnosis instan"
      />

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <FileUpload
          onFile={handleFile}
          accept="image/jpeg,image/png,image/webp"
          preview={previewUrl}
          onClear={handleClear}
          disabled={isSubmitting}
          error={errorMessage}
        />
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <label className="mb-3 block text-sm font-semibold text-ink">Jenis Tanaman</label>
        <div className="grid grid-cols-2 gap-4">
          {(["rice", "corn"] as const).map((crop) => (
            <motion.button
              key={crop}
              type="button"
              onClick={() => setCropType(crop)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-5 transition-colors ${
                crop === cropType
                  ? "border-forest-500 bg-forest-50 shadow-sm"
                  : "border-cream-300 bg-white/60 hover:border-cream-400"
              }`}
            >
              <span className="text-3xl">{cropEmoji(crop)}</span>
              <span
                className={`text-sm font-semibold ${
                  crop === cropType ? "text-forest-700" : "text-ink-muted"
                }`}
              >
                {cropLabel(crop)}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="secondary"
              size="md"
              icon={MapPin}
              onClick={detectLocation}
              disabled={isSubmitting || isLocating}
            >
              {isLocating ? "Mendeteksi..." : "Gunakan Lokasi"}
            </Button>
            {isLocating && (
              <motion.span
                className="absolute inset-0 rounded-sm border-2 border-forest-400"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </div>
          <span className="text-sm text-ink-muted">{locationText}</span>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
        <Button
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onClick={runScan}
          disabled={!selectedFile || isSubmitting}
          className="w-full"
        >
          Mulai Analisis
        </Button>
      </motion.div>

      <AnimatePresence>
        {isSubmitting && !scanData && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <Card variant="default" className="p-6">
              <div className="space-y-4">
                {PROCESSING_STEPS.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-forest-500" />
                    <span className="text-sm text-ink-soft">{step}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton variant="heading" width="50%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanData && (
          <motion.div
            key="result"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 12 }}
            className="mb-10"
          >
            <Card variant="default" className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/50 px-6 py-3">
                <p className="text-sm font-semibold text-ink-soft">
                  Scan #{scanData.id.slice(0, 8)}
                </p>
                <Badge variant={statusVariantMap[scanData.status] || "default"}>
                  {statusLabelMap[scanData.status] || scanData.status}
                </Badge>
              </div>

              <div className="p-6">
                {scanData.result ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                  >
                    <motion.div variants={staggerItem}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Penyakit Terdeteksi
                      </p>
                      <p className="text-display text-forest-700">
                        {scanData.result.detected_disease}
                      </p>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Tingkat Keyakinan
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-cream-200">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-forest-500 to-forest-700"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.round(scanData.result.confidence * 100)}%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-10 text-right text-sm font-bold text-forest-700">
                          {Math.round(scanData.result.confidence * 100)}%
                        </span>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Rekomendasi
                      </p>
                      <Card variant="flat" className="border-forest-200 bg-forest-50/40 p-4">
                        <p className="text-sm leading-relaxed text-ink-soft">
                          {scanData.result.recommendation || "Rekomendasi belum tersedia."}
                        </p>
                      </Card>
                    </motion.div>

                    {scanData.result.is_mock && (
                      <motion.p
                        variants={staggerItem}
                        className="flex items-center gap-2 text-xs text-ink-muted"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Hasil simulasi berdasarkan model ({scanData.result.model_version})
                      </motion.p>
                    )}
                  </motion.div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="mb-4 text-sm text-ink-muted">
                      Hasil belum siap. Klik tombol di bawah untuk cek status terbaru.
                    </p>
                    <Button
                      variant="secondary"
                      icon={RefreshCw}
                      onClick={refreshStatus}
                      loading={isSubmitting}
                    >
                      Cek Status
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="border-t border-cream-200 pt-8"
      >
        <Card variant="flat" className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-forest-700">
            Tips Pengambilan Foto
          </h3>
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {PHOTO_TIPS.map((tip, i) => (
              <motion.li
                key={i}
                variants={staggerItem}
                className="flex items-start gap-3 text-sm text-ink-muted"
              >
                <span className="shrink-0 text-base">{tip.icon}</span>
                <span>{tip.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </Card>
      </motion.div>
    </div>
  );
}
