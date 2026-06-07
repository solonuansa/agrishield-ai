"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { apiGet, apiPostForm, ApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
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
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const toast = useToast();

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
      setLocationText(t("scan.geoNotSupported"));
      toast.warning(t("scan.geoWarning"));
      return;
    }

    setIsLocating(true);
    setLocationText(t("scan.detecting"));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        setCoords({ latitude, longitude });
        setLocationText(t("scan.locationSaved", { lat: latitude, lng: longitude }));
        setIsLocating(false);
        toast.success(t("scan.analysisStarted"));
      },
      () => {
        setLocationText(t("scan.locationDenied"));
        setIsLocating(false);
        toast.error(t("scan.locationError"));
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [toast, t]);

  const runScan = useCallback(async () => {
    if (!selectedFile) {
      const msg = t("scan.selectPhotoFirst");
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
      toast.success(t("scan.analysisStarted"));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        const msg = t("scan.analysisFailed");
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFile, cropType, coords, toast, t]);

  const refreshStatus = useCallback(async () => {
    if (!scanData?.id) return;

    setIsSubmitting(true);
    try {
      const latest = await apiGet<ScanResponse>(`/scans/${scanData.id}`);
      setScanData(latest);
      if (latest.status === "completed") {
        toast.success(t("scan.statusReady"));
      } else if (latest.status === "failed") {
        toast.error(t("scan.statusFailed"));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t("scan.statusLoadError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [scanData, toast, t]);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-forest-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("scan.back")}
      </Link>

      <PageHeader
        title={t("scan.title")}
        description={t("scan.description")}
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
        <CropTypeSelector cropType={cropType} onChange={setCropType} t={t} />
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
              {isLocating ? t("scan.detecting") : t("scan.useLocation")}
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

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <Button
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onClick={runScan}
          disabled={!selectedFile || isSubmitting}
          className="w-full"
        >
          {t("scan.startAnalysis")}
        </Button>
      </motion.div>

      <ScanProcessing steps={PROCESSING_STEPS} visible={isSubmitting && !scanData} />

      {scanData && (
        <div className="mb-6">
          <ScanResultCard
            scanData={scanData}
            t={t}
            statusLabelMap={statusLabelMap}
            onRefresh={refreshStatus}
            isRefreshing={isSubmitting}
          />
        </div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <PhotoTipsCard t={t} />
      </motion.div>
    </div>
  );
}
