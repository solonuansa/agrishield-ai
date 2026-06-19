"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { apiGet } from "@/lib/api";
import { getAccessToken, readSession } from "@/lib/auth";
import { getGreeting, firstName } from "@/lib/dashboard-utils";
import { useToast } from "@/lib/hooks/useToast";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";
import RecentScansList from "@/components/dashboard/RecentScansList";
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

function DashboardContent() {
  const { t } = useTranslation();
  const token = getAccessToken();
  const router = useRouter();
  const session = readSession();
  const toast = useToast();
  const userName = session?.user?.full_name
    ? firstName(session.user.full_name)
    : "Petani";
  const greeting = useMemo(() => getGreeting(t), [t]);

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
          <DashboardStatsGrid stats={stats} isLoading={statsLoading} t={t} />

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

            <RecentScansList
              scans={scans}
              isLoading={scansLoading}
              isError={scansQuery.isError}
              t={t}
            />
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
