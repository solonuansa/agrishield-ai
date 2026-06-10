"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { apiGet, apiPostForm, ApiError } from "@/lib/api";
import type { ScanResponse } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";
import { fadeUp } from "@/lib/motion";
import { CropTypeSelector } from "@/components/scan/CropTypeSelector";
import { ScanProcessing } from "@/components/scan/ScanProcessing";
import { ScanResultCard } from "@/components/scan/ScanResultCard";
import { PhotoTipsCard } from "@/components/scan/PhotoTipsCard";

type CropType = "rice" | "corn";

export default function ScanPage() {
  const { t } = useTranslation();
  const [cropType, setCropType] = useState<CropType>("rice");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationText, setLocationText] = useState(t("scan.locationNotSelected"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const toast = useToast();
  const previewUrlRef = useRef<string | null>(null);
  const scanPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (scanPollRef.current) clearInterval(scanPollRef.current);
    };
  }, []);

  const statusLabelMap: Record<string, string> = {
    completed: t("scan.statusCompleted"),
    processing: t("scan.statusProcessing"),
    failed: t("scan.statusFailed_label"),
    pending: t("scan.statusPending"),
  };

  const PROCESSING_STEPS = [
    t("scan.stepAnalyzing"),
    t("scan.stepDetecting"),
    t("scan.stepRecommendations"),
  ];

  const handleFile = useCallback(
    (file: File) => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setSelectedFile(file);
      setErrorMessage("");
    },
    []
  );

  const handleClear = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setSelectedFile(null);
  }, []);

  const detectLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationText(t("scan.geoNotSupported"));
      toast.warning(t("scan.geoWarning"));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationText(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        );
        setIsLocating(false);
      },
      () => {
        setLocationText(t("scan.geoDenied"));
        setIsLocating(false);
        toast.warning(t("scan.geoWarning"));
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  }, [t, toast]);

  const handleRefresh = useCallback(async () => {
    if (!scanData) return;
    setIsRefreshing(true);
    try {
      const updated = await apiGet<ScanResponse>(`/scans/${scanData.id}`);
      setScanData(updated);
    } catch {
      toast.error(t("scan.refreshError"));
    } finally {
      setIsRefreshing(false);
    }
  }, [scanData, toast, t]);

  const runScan = useCallback(async () => {
    if (!selectedFile || !cropType) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const endpoint = "/scans";
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("crop_type", cropType);
      if (coords.latitude !== undefined) formData.append("latitude", String(coords.latitude));
      if (coords.longitude !== undefined) formData.append("longitude", String(coords.longitude));

      const data = await apiPostForm<ScanResponse>(endpoint, formData);

      setScanData(data);

      let pollCount = 0;
      const MAX_POLL_RETRIES = 60;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const updated = await apiGet<ScanResponse>(`/scans/${data.id}`);
          if (updated.status !== "processing" && updated.status !== "pending") {
            setScanData(updated);
            clearInterval(pollInterval);
            setIsSubmitting(false);
            return;
          }
        } catch {
          clearInterval(pollInterval);
          setIsSubmitting(false);
          return;
        }
        if (pollCount >= MAX_POLL_RETRIES) {
          clearInterval(pollInterval);
          setIsSubmitting(false);
          setErrorMessage(t("scan.timeoutError"));
        }
      }, 2000);
      scanPollRef.current = pollInterval;
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t("scan.uploadError"));
      }
      setIsSubmitting(false);
    }
  }, [selectedFile, cropType, coords, t]);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <PageHeader
        title={t("scan.title")}
        description={t("scan.description")}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-8">
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-lg border border-cream-300 bg-white/70 p-6 shadow-sm"
          >
            <h2 className="font-serif text-2xl font-semibold text-forest-700">
              {t("scan.step1")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t("scan.step1Description")}</p>
            <div className="mt-4">
              <CropTypeSelector cropType={cropType} onChange={setCropType} t={t} />
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-cream-300 bg-white/70 p-6 shadow-sm"
          >
            <h2 className="font-serif text-2xl font-semibold text-forest-700">
              {t("scan.step2")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t("scan.step2Description")}</p>
            <div className="mt-4">
              <FileUpload
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={10}
                preview={previewUrl}
                onFile={handleFile}
                onClear={handleClear}
                disabled={isSubmitting}
              />
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-cream-300 bg-white/70 p-6 shadow-sm"
          >
            <h2 className="font-serif text-2xl font-semibold text-forest-700">
              {t("scan.step3")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t("scan.step3Description")}</p>
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={detectLocation}
                disabled={isLocating}
                icon={MapPin}
              >
                {isLocating ? t("scan.locating") : t("scan.detectLocation")}
              </Button>
              <span className="text-xs text-ink-muted">{locationText}</span>
            </div>
          </motion.section>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={runScan}
              disabled={!selectedFile || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? t("scan.processing") : t("scan.analyze")}
            </Button>
            {errorMessage && (
              <p className="text-sm text-clay-dark" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          {scanData && (
            <ScanProcessing steps={PROCESSING_STEPS} visible={scanData.status === "processing"} />
          )}

          {scanData && scanData.status !== "processing" && (
            <ScanResultCard
              scanData={scanData}
              t={t}
              statusLabelMap={statusLabelMap}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}
        </div>

        <aside className="hidden space-y-6 lg:block">
          <PhotoTipsCard t={t} />
          <div className="rounded-lg border border-cream-300 bg-cream-200/40 p-5">
            <h3 className="font-serif text-lg text-forest-700">{t("scan.riceTipTitle")}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {cropType === "rice" ? t("scan.riceTipBody") : t("scan.cornTipBody")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
