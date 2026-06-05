"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Leaf,
  Sun,
  ScanSearch,
  Ruler,
  Ban,
} from "lucide-react";
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

type IconComponent = typeof Sprout;

function cropLabel(value: CropType, t: (key: string) => string) {
  return value === "rice" ? t("crop.rice") : t("crop.corn");
}

function cropIcon(value: CropType): IconComponent {
  return value === "rice" ? Leaf : Sprout;
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  completed: "success",
  processing: "warning",
  failed: "danger",
  pending: "info",
};

function useStatusLabelMap(t: (key: string) => string) {
  return {
    completed: t("scan.statusCompleted"),
    processing: t("scan.statusProcessing"),
    failed: t("scan.statusFailed_label"),
    pending: t("scan.statusPending"),
  };
}

function useProcessingSteps(t: (key: string) => string) {
  return [
    t("scan.stepAnalyzing"),
    t("scan.stepDetecting"),
    t("scan.stepRecommendations"),
  ];
}

function usePhotoTips(t: (key: string) => string) {
  return [
    { icon: Sun, text: t("scan.tipLight") },
    { icon: ScanSearch, text: t("scan.tipFocus") },
    { icon: Ruler, text: t("scan.tipDistance") },
    { icon: Ban, text: t("scan.tipShadow") },
  ];
}

export default function ScanPage() {
  const { t } = useTranslation();
  const statusLabelMap = useStatusLabelMap(t);
  const PROCESSING_STEPS = useProcessingSteps(t);
  const PHOTO_TIPS = usePhotoTips(t);
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
  }, [toast]);

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
  }, [selectedFile, cropType, coords, toast]);

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
  }, [scanData, toast]);

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
        <label className="mb-3 block text-sm font-semibold text-ink">{t("scan.cropType")}</label>
        <div className="grid grid-cols-2 gap-4">
          {(["rice", "corn"] as const).map((crop) => {
            const CropIcon = cropIcon(crop);
            return (
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
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${
                  crop === cropType
                    ? "border-forest-200 bg-forest-100 text-forest-700"
                    : "border-cream-300 bg-cream-100 text-ink-muted"
                }`}
              >
                <CropIcon className="h-5 w-5" />
              </span>
              <span
                className={`text-sm font-semibold ${
                  crop === cropType ? "text-forest-700" : "text-ink-muted"
                }`}
              >
                {cropLabel(crop, t)}
              </span>
            </motion.button>
            );
          })}
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

      <AnimatePresence>
        {isSubmitting && !scanData && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
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
            className="mb-6"
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
                        {t("scan.diseaseLabel")}
                      </p>
                      <p className="text-display text-forest-700">
                        {scanData.result.detected_disease}
                      </p>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        {t("scan.confidenceLabel")}
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
                        {t("scan.recommendationLabel")}
                      </p>
                      <Card variant="flat" className="border-forest-200 bg-forest-50/40 p-4">
                        <p className="text-sm leading-relaxed text-ink-soft">
                          {scanData.result.recommendation || t("scan.recommendationEmpty")}
                        </p>
                      </Card>
                    </motion.div>

                    {scanData.result.is_mock && (
                      <motion.p
                        variants={staggerItem}
                        className="flex items-center gap-2 text-xs text-ink-muted"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t("scan.simulationNote", { version: scanData.result.model_version })}
                      </motion.p>
                    )}
                  </motion.div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="mb-4 text-sm text-ink-muted">
                      {t("scan.resultNotReady")}
                    </p>
                    <Button
                      variant="secondary"
                      icon={RefreshCw}
                      onClick={refreshStatus}
                      loading={isSubmitting}
                    >
                      {t("scan.checkStatus")}
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
        className="border-t border-cream-200 pt-6"
      >
        <Card variant="flat" className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-forest-700">
            {t("scan.photoTips")}
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
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-muted">
                  <tip.icon className="h-3.5 w-3.5" />
                </span>
                <span>{tip.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </Card>
      </motion.div>
    </div>
  );
}
