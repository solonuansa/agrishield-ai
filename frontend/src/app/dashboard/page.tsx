"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Scan, AlertTriangle, CheckCircle2, ClipboardCheck, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { apiGet } from "@/lib/api";
import { getAccessToken, readSession } from "@/lib/auth";
import { useToast } from "@/lib/hooks/useToast";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { formatDateID } from "@/lib/ui";
import type { DashboardStats, ScanResponse } from "@/types/api";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded border border-cream-darker bg-cream-dark/30" />
        <div className="h-56 animate-pulse rounded border border-cream-darker bg-cream-dark/30" />
        <div className="h-60 animate-pulse rounded border border-cream-darker bg-cream-dark/30 lg:col-span-2" />
      </div>
    ),
  }
);

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 11) return t("dashboard.greetingMorning");
  if (hour < 15) return t("dashboard.greetingAfternoon");
  if (hour < 18) return t("dashboard.greetingEvening");
  return t("dashboard.greetingNight");
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

function getStatusVariant(
  scan: ScanResponse
): "default" | "success" | "warning" | "danger" | "info" {
  if (scan.status === "failed") return "danger";
  if (scan.status === "pending" || scan.status === "processing") return "warning";
  if (scan.result?.detected_disease) return "danger";
  return "success";
}

function getStatusLabel(scan: ScanResponse, t: (key: string) => string): string {
  if (scan.status === "failed") return t("scan.statusFailed_label");
  if (scan.status === "pending" || scan.status === "processing") return t("dashboard.processing");
  if (scan.result?.detected_disease) return scan.result.detected_disease;
  return "Sehat";
}

function DashboardContent() {
  const { t } = useTranslation();
  const token = getAccessToken();
  const router = useRouter();
  const session = readSession();
  const toast = useToast();
  const userName = session?.user?.full_name
    ? firstName(session.user.full_name)
    : "Petani";
  const greeting = useMemo(() => getGreeting(t), []);

  // Filter bulan
  const [months, setMonths] = useState("6");

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats", months],
    queryFn: () => apiGet<DashboardStats>(`/dashboard/stats?months=${months}`, token),
    enabled: Boolean(token),
  });

  const scansQuery = useQuery({
    queryKey: ["recent-scans"],
    queryFn: () => apiGet<ScanResponse[]>("/scans?per_page=5", token),
    enabled: Boolean(token),
  });

  const stats = statsQuery.data;
  const scans = scansQuery.data ?? [];

  useEffect(() => {
    if (scansQuery.isError) {
      toast.error(t("dashboard.loadError"));
    }
  }, [scansQuery.isError]);

  useEffect(() => {
    if (statsQuery.isError) {
      toast.error(t("dashboard.loadErrorStats"));
    }
  }, [statsQuery.isError]);

  const isEmpty = stats && stats.total_scans === 0;
  const statsLoading = statsQuery.isLoading;
  const scansLoading = scansQuery.isLoading;

  // Hitung trend month-over-month dari timeline
  const trendArrow = useMemo(() => {
    if (!stats?.timeline || stats.timeline.length < 2) return undefined;
    const sorted = [...stats.timeline].sort(
      (a, b) => a.month.localeCompare(b.month)
    );
    const prev = sorted[sorted.length - 2];
    const curr = sorted[sorted.length - 1];
    if (curr.count > prev.count) return "up" as const;
    if (curr.count < prev.count) return "down" as const;
    return undefined;
  }, [stats]);

  const trendDisease = useMemo(() => {
    if (!stats?.timeline || stats.timeline.length < 2) return undefined;
    const sorted = [...stats.timeline].sort(
      (a, b) => a.month.localeCompare(b.month)
    );
    const prev = sorted[sorted.length - 2];
    const curr = sorted[sorted.length - 1];
    if (curr.disease_count > prev.disease_count) return "up" as const;
    if (curr.disease_count < prev.disease_count) return "down" as const;
    return undefined;
  }, [stats]);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <PageHeader
        title={t("dashboard.title")}
        description={`${greeting}, ${userName}`}
      />

      {/* Filter & Refresh */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-ink-muted">{t("dashboard.period")}</label>
          <Select
            options={[
              { value: "3", label: t("dashboard.months3") },
              { value: "6", label: t("dashboard.months6") },
              { value: "12", label: t("dashboard.months12") },
            ]}
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="w-32"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            statsQuery.refetch();
            scansQuery.refetch();
          }}
        >
          <RefreshCw size={14} className="mr-1" />
          {t("dashboard.refresh")}
        </Button>
      </div>

      {isEmpty ? (
        <EmptyState
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDesc")}
          actionLabel={t("dashboard.emptyAction")}
          onAction={() => router.push("/scan")}
        />
      ) : (
        <>
          <motion.div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              {
                label: t("dashboard.totalScans"),
                value: stats?.total_scans ?? 0,
                icon: <Scan size={18} />,
                trend: trendArrow,
                trendLabel: trendArrow ? t("dashboard.fromPreviousMonth") : undefined,
              },
              {
                label: t("dashboard.diseaseDetected"),
                value: stats?.disease_detected ?? 0,
                icon: <AlertTriangle size={18} />,
                trend: trendDisease,
                trendLabel: trendDisease ? t("dashboard.fromPreviousMonth") : undefined,
              },
              {
                label: t("dashboard.healthyPlants"),
                value: stats?.healthy_detected ?? 0,
                icon: <CheckCircle2 size={18} />,
              },
              {
                label: t("dashboard.completedScans"),
                value: stats?.completed_scans ?? 0,
                icon: <ClipboardCheck size={18} />,
              },
            ].map((item) => (
              <motion.div key={item.label} variants={staggerItem}>
                {statsLoading ? (
                  <Skeleton variant="card" className="h-28" />
                ) : (
                  <StatCard
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                    trend={item.trend}
                    trendLabel={item.trendLabel}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          <DashboardCharts stats={stats} />

          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-forest-700">
                {t("dashboard.recentScans")}
              </h2>
              <Link
                href="/history"
                className="text-sm font-medium text-forest-700 transition-colors hover:text-clay"
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>

            {scansLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="card" />
                ))}
              </div>
            ) : scansQuery.isError ? (
              <p className="text-sm text-clay-dark">{t("dashboard.loadError")}</p>
            ) : scans.length === 0 ? (
              <EmptyState
                title={t("dashboard.emptyHistory")}
                description={t("dashboard.emptyHistoryDesc")}
              />
            ) : (
              <div className="divide-y divide-cream-darker/40">
                {scans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-xs font-medium text-ink-muted">
                        {scan.id.slice(0, 8)}
                      </span>
                      <span className="text-sm text-ink-soft">
                        {scan.result?.detected_disease || t("dashboard.processing")}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-ink-muted">
                        {formatDateID(scan.created_at)}
                      </span>
                      <Badge variant={getStatusVariant(scan)}>
                        {getStatusLabel(scan, t)}
                      </Badge>
                      <span className="text-sm font-medium text-forest-700">
                        {scan.result
                          ? `${Math.round(scan.result.confidence * 100)}%`
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
