"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  List,
  MapPin,
  TriangleAlert,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDateID } from "@/lib/ui";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Skeleton, SkeletonLines } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { HeatmapResponse, HeatmapPoint } from "@/types/api";

const HeatmapMap = dynamic(() => import("@/components/map/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-muted">
      Memuat peta…
    </div>
  ),
});

const CROP_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "rice", label: "Padi" },
  { value: "corn", label: "Jagung" },
] as const;

function toCropLabel(value: string) {
  return value === "rice" ? "Padi" : "Jagung";
}

function confidenceColor(confidence: number) {
  if (confidence >= 0.85) return "#b91c1c";
  if (confidence >= 0.5) return "#a16207";
  return "#15803d";
}

function diseaseBadgeVariant(disease: string): BadgeVariant {
  const lower = disease.toLowerCase();
  if (lower.includes("blast") || lower.includes("busuk") || lower.includes("kresek"))
    return "danger";
  if (lower.includes("blight") || lower.includes("hawar") || lower.includes("karat") || lower.includes("rust") || lower.includes("bercak"))
    return "warning";
  if (lower.includes("tungro"))
    return "info";
  return "default";
}

export default function MapPage() {
  const { data: heatmap, isLoading, isError } = useQuery<HeatmapResponse>({
    queryKey: ["heatmap"],
    queryFn: () => apiGet<HeatmapResponse>("/map/heatmap?months=6", null, "force-cache"),
    staleTime: 5 * 60 * 1000,
  });

  const [cropFilter, setCropFilter] = useState<"all" | "rice" | "corn">("all");
  const [minConfidence, setMinConfidence] = useState(0);

  const allPoints = useMemo(() => heatmap?.points ?? [], [heatmap?.points]);

  const filteredPoints = useMemo<HeatmapPoint[]>(() => {
    return allPoints.filter((p) => {
      if (cropFilter !== "all" && p.crop_type !== cropFilter) return false;
      if (p.confidence < minConfidence) return false;
      return true;
    });
  }, [allPoints, cropFilter, minConfidence]);

  const highRisk = useMemo(
    () => allPoints.filter((p) => p.confidence >= 0.85).length,
    [allPoints]
  );
  const provinces = useMemo(
    () => new Set(allPoints.map((p) => `${p.lat.toFixed(1)}:${p.lng.toFixed(1)}`)).size,
    [allPoints]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <PageHeader
        title="Peta Sebaran"
        description="Titik berikut berasal dari hasil scan dalam 6 bulan terakhir. Gunakan data ini untuk memantau area rawan lebih dini."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 border-y border-cream-darker py-6 sm:grid-cols-3"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            label="Titik Laporan"
            value={allPoints.length}
            icon={<MapPin size={18} />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Risiko Tinggi"
            value={highRisk}
            icon={
              <TriangleAlert
                size={18}
                className={highRisk > 0 ? "text-clay" : ""}
              />
            }
            className={highRisk > 0 ? "border-l-4 border-l-clay" : ""}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Klaster Unik"
            value={provinces}
            icon={<Compass size={18} />}
          />
        </motion.div>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
          <span className="text-sm text-ink-soft">Filter:</span>
        </div>
        <Select
          options={[...CROP_OPTIONS]}
          value={cropFilter}
          onChange={(e) =>
            setCropFilter(e.target.value as "all" | "rice" | "corn")
          }
          className="w-32"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Min. keyakinan:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(minConfidence * 100)}
            onChange={(e) => setMinConfidence(Number(e.target.value) / 100)}
            className="h-1 w-24 accent-forest-700"
          />
          <span className="w-8 text-xs tabular-nums text-ink-soft">
            {Math.round(minConfidence * 100)}%
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded border border-cream-darker">
        <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
          <MapPin className="h-4 w-4 text-forest-700" />
          Peta sebaran
          <span className="ml-auto text-xs text-ink-muted">
            Menampilkan {filteredPoints.length} titik
          </span>
        </div>
        {isLoading ? (
          <Skeleton variant="chart" className="h-[28rem] rounded-t-none" />
        ) : isError ? (
          <div className="flex h-[28rem] items-center justify-center">
            <EmptyState
              icon={<TriangleAlert size={32} />}
              title="Gagal Memuat Data"
              description="Terjadi kesalahan saat memuat data peta. Silakan coba lagi."
            />
          </div>
        ) : allPoints.length === 0 ? (
          <div className="flex h-[28rem] items-center justify-center">
            <EmptyState
              icon={<MapPin size={32} />}
              title="Belum Ada Data"
              description="Data peta belum tersedia. Jalankan scan dengan GPS aktif untuk menambahkan titik baru."
            />
          </div>
        ) : (
          <div className="h-[28rem] w-full">
            <HeatmapMap points={filteredPoints} />
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded border border-cream-darker bg-cream-dark/40">
        <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
          <List className="h-4 w-4 text-forest-700" />
          Daftar titik sebaran terbaru
        </div>
        {isLoading ? (
          <div className="px-4 py-10">
            <SkeletonLines count={5} />
          </div>
        ) : isError ? (
          <EmptyState
            icon={<TriangleAlert size={32} />}
            title="Gagal Memuat Data"
            description="Terjadi kesalahan saat memuat data peta. Silakan coba lagi."
          />
        ) : filteredPoints.length === 0 ? (
          <EmptyState
            icon={<TriangleAlert size={32} />}
            title="Tidak Ada Titik"
            description="Tidak ada titik yang cocok dengan filter. Ubah filter untuk melihat hasil."
          />
        ) : (
          <ul className="divide-y divide-cream-darker/60">
            {filteredPoints.slice(0, 20).map((point) => (
              <li
                key={point.scan_id}
                className="grid gap-2 px-4 py-4 sm:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: confidenceColor(point.confidence) }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={diseaseBadgeVariant(point.disease)}>
                        {point.disease}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      Scan #{point.scan_id.slice(0, 8)} - {toCropLabel(point.crop_type)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-ink-muted">
                  Lat {point.lat.toFixed(4)}, Lng {point.lng.toFixed(4)}
                </p>
                <p className="text-xs text-ink-muted">
                  Bulan {formatDateID(`${point.month}-01`)}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: confidenceColor(point.confidence) }}
                >
                  {Math.round(point.confidence * 100)}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
