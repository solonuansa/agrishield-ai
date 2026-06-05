"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, Scan, AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { AdminStats } from "@/types/api";

function AdminContent() {
  const { t } = useTranslation();
  const token = getAccessToken();

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiGet<AdminStats>("/admin/stats", token),
    enabled: Boolean(token),
  });

  const stats = statsQuery.data;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <PageHeader title={t("admin.title")} description={t("admin.description")} />

      {statsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton width="100%" height="120px" />
          <Skeleton width="100%" height="300px" />
        </div>
      ) : statsQuery.isError || !stats ? (
        <p className="text-sm text-clay-dark">
          {t("admin.dataUnavailable")}
        </p>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <motion.div variants={staggerItem}>
              <StatCard
                icon={<Users size={18} />}
                label={t("admin.users")}
                value={stats.total_users}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={<Scan size={18} />}
                label={t("admin.nationalScans")}
                value={stats.total_scans}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={<AlertTriangle size={18} />}
                label={t("admin.diseaseCases")}
                value={stats.disease_detected}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={<CheckCircle2 size={18} />}
                label={t("admin.healthyCases")}
                value={stats.healthy_detected}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={<Bell size={18} />}
                label={t("admin.activeAlerts")}
                value={stats.active_alerts}
              />
            </motion.div>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 font-serif text-2xl font-medium text-forest-700">{t("admin.topProvinces")}</h2>
            <div className="divide-y divide-cream-darker/40 border-t border-cream-darker">
              {stats.by_province.slice(0, 8).map((province) => (
                <div key={province.province} className="grid gap-2 py-4 sm:grid-cols-[1.5fr_1fr_1fr_2fr] sm:items-center">
                  <p className="text-sm font-medium text-ink-soft">{province.province}</p>
                  <p className="text-xs text-ink-muted">{t("admin.scans", { count: province.total_scans })}</p>
                  <p className="text-xs text-ink-muted">{t("admin.diseases", { count: province.disease_count })}</p>
                  <p className="text-xs text-ink-muted">
                    {t("admin.dominant")}{" "}
                    {province.top_disease ? (
                      <Badge variant="info">{province.top_disease}</Badge>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  );
}
