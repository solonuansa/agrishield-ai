"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { HeatmapResponse, HeatmapPoint } from "@/types/api";
import { DUMMY_HEATMAP } from "@/lib/mocks/mock-map-data";
import { MapStats } from "@/components/map/MapStats";
import { MapFilters } from "@/components/map/MapFilters";
import { DiseaseList } from "@/components/map/DiseaseList";

const HeatmapMap = dynamic(() => import("@/components/map/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-muted">
      Memuat peta…
    </div>
  ),
});

export default function MapPage() {
  const { t } = useTranslation();
  const { data: heatmap, isLoading } = useQuery<HeatmapResponse>({
    queryKey: ["heatmap"],
    queryFn: async () => {
      try {
        const liveData = await apiGet<HeatmapResponse>("/map/heatmap?months=6", null, "force-cache");
        if (!liveData.points.length) return DUMMY_HEATMAP;
        return liveData;
      } catch {
        return DUMMY_HEATMAP;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const [cropFilter, setCropFilter] = useState<"all" | "rice" | "corn">("all");
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const [pointLimit, setPointLimit] = useState(20);

  const allPoints = useMemo(() => heatmap?.points ?? [], [heatmap?.points]);

  const uniqueDiseases = useMemo(() => {
    const set = new Set(allPoints.map((p) => p.disease));
    return Array.from(set).sort();
  }, [allPoints]);

  const filteredPoints = useMemo<HeatmapPoint[]>(() => {
    return allPoints.filter((p) => {
      if (cropFilter !== "all" && p.crop_type !== cropFilter) return false;
      if (diseaseFilter !== "all" && p.disease !== diseaseFilter) return false;
      if (p.confidence < minConfidence) return false;
      return true;
    });
  }, [allPoints, cropFilter, diseaseFilter, minConfidence]);

  const highRisk = useMemo(
    () => allPoints.filter((p) => p.confidence >= 0.85).length,
    [allPoints]
  );
  const uniqueLocations = useMemo(
    () => new Set(allPoints.map((p) => `${p.lat.toFixed(1)}:${p.lng.toFixed(1)}`)).size,
    [allPoints]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12">
      <PageHeader
        title={t("map.title")}
        description={t("map.description")}
      />

      <MapStats
        allPointsLength={allPoints.length}
        highRisk={highRisk}
        uniqueLocations={uniqueLocations}
      />

      <MapFilters
        cropFilter={cropFilter}
        setCropFilter={setCropFilter}
        diseaseFilter={diseaseFilter}
        setDiseaseFilter={setDiseaseFilter}
        minConfidence={minConfidence}
        setMinConfidence={setMinConfidence}
        uniqueDiseases={uniqueDiseases}
      />

      <div className="mt-6 overflow-hidden rounded border border-cream-darker">
        <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
          <MapPin className="h-4 w-4 text-forest-700" />
          {t("map.mapTitle")}
          <span className="ml-auto text-xs text-ink-muted">
            {t("map.showingPoints", { count: filteredPoints.length })}
          </span>
        </div>
        {isLoading ? (
          <Skeleton variant="chart" className="h-[28rem] rounded-t-none" />
        ) : allPoints.length === 0 ? (
          <div className="flex h-[28rem] items-center justify-center">
            <EmptyState
              icon={<MapPin size={32} />}
              title={t("map.noDataTitle")}
              description={t("map.noDataDesc")}
            />
          </div>
        ) : (
          <div className="h-[28rem] w-full">
            <HeatmapMap points={filteredPoints} />
          </div>
        )}
      </div>

      <DiseaseList
        filteredPoints={filteredPoints}
        isLoading={isLoading}
        pointLimit={pointLimit}
        setPointLimit={setPointLimit}
      />
    </div>
  );
}
