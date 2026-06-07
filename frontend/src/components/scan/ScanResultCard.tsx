"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShieldCheck } from "lucide-react";
import type { ScanResponse } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

interface ScanResultCardProps {
  scanData: ScanResponse;
  t: (key: string, options?: Record<string, unknown>) => string;
  statusLabelMap: Record<string, string>;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  completed: "success",
  processing: "warning",
  failed: "danger",
  pending: "info",
};

export function ScanResultCard({
  scanData,
  t,
  statusLabelMap,
  onRefresh,
  isRefreshing,
}: ScanResultCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="result"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: 12 }}
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
                  onClick={onRefresh}
                  loading={isRefreshing}
                >
                  {t("scan.checkStatus")}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
