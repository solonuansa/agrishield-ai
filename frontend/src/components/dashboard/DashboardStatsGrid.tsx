"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Scan, AlertTriangle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { DashboardStats } from "@/types/api";

interface DashboardStatsGridProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  t: (key: string) => string;
}

export default function DashboardStatsGrid({ stats, isLoading, t }: DashboardStatsGridProps) {
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
          {isLoading ? (
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
  );
}
