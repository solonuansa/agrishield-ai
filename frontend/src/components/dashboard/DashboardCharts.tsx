"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import type { DashboardStats } from "@/types/api";

const COLORS = ["#3f6e47", "#b85c38", "#8c7b6c", "#d4a574", "#5a8a62"];

interface DashboardChartsProps {
  stats: DashboardStats | undefined;
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  const { t } = useTranslation();

  const cropData = useMemo(
    () =>
      stats?.by_crop.map((c) => ({
        name: c.crop_type === "rice" ? t("crop.rice") : t("crop.corn"),
        value: c.count,
        disease: c.disease_count,
      })) ?? [],
    [stats, t],
  );

  const diseaseData = useMemo(
    () =>
      stats?.top_diseases.map((d) => ({
        name: d.disease,
        count: d.count,
      })) ?? [],
    [stats],
  );

  const timelineData = useMemo(
    () =>
      stats?.timeline.map((p) => ({
        month: p.month,
        total: p.count,
        disease: p.disease_count,
      })) ?? [],
    [stats],
  );

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded border border-cream-darker bg-cream-dark/30 p-5">
        <h3 className="mb-1 text-sm font-medium text-ink-soft">{t("dashboard.chartCropDistTitle")}</h3>
        <p className="mb-4 text-xs text-ink-muted">{t("dashboard.chartCropDistDesc")}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cropData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                stroke="none"
              >
                {cropData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #e2dcd0",
                  fontSize: 12,
                }}
                formatter={(value, _name, props) => {
                  const diseaseCount =
                    (props?.payload as { disease?: number } | undefined)?.disease ?? 0;
                  return [t("dashboard.chartScanCount", { count: value, diseaseCount }), _name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {cropData.map((c, i) => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {c.name}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-cream-darker bg-cream-dark/30 p-5">
        <h3 className="mb-1 text-sm font-medium text-ink-soft">{t("dashboard.chartTopDiseaseTitle")}</h3>
        <p className="mb-4 text-xs text-ink-muted">{t("dashboard.chartTopDiseaseDesc")}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diseaseData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11, fill: "#5c5348" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #e2dcd0",
                  fontSize: 12,
                }}
                cursor={{ fill: "#e8e4dc" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#b85c38" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded border border-cream-darker bg-cream-dark/30 p-5 lg:col-span-2">
        <h3 className="mb-1 text-sm font-medium text-ink-soft">{t("dashboard.chartTimelineTitle")}</h3>
        <p className="mb-4 text-xs text-ink-muted">{t("dashboard.chartTimelineDesc")}</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ left: 0, right: 10 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3f6e47" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3f6e47" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="diseaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b85c38" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#b85c38" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c5348" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5c5348" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 6, border: "1px solid #e2dcd0", fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3f6e47"
                strokeWidth={2}
                fill="url(#totalGrad)"
                name={t("dashboard.chartTotalScan")}
              />
              <Area
                type="monotone"
                dataKey="disease"
                stroke="#b85c38"
                strokeWidth={2}
                fill="url(#diseaseGrad)"
                name={t("dashboard.chartDisease")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
