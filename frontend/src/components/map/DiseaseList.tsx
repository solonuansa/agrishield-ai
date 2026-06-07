"use client";

import { useTranslation } from "react-i18next";
import { List, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateID } from "@/lib/ui";
import {
  confidenceColor,
  diseaseBadgeVariant,
  toCropLabel,
} from "@/lib/map-utils";
import type { HeatmapPoint } from "@/types/api";

interface DiseaseListProps {
  filteredPoints: HeatmapPoint[];
  isLoading: boolean;
  pointLimit: number;
  setPointLimit: React.Dispatch<React.SetStateAction<number>>;
}

export function DiseaseList({
  filteredPoints,
  isLoading,
  pointLimit,
  setPointLimit,
}: DiseaseListProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="mt-8 overflow-hidden rounded border border-cream-darker bg-cream-dark/40">
      <div className="flex items-center gap-2 border-b border-cream-darker px-4 py-3 text-sm font-medium text-ink-soft">
        <List className="h-4 w-4 text-forest-700" />
        {t("map.listTitle")}
      </div>
      {isLoading ? (
        <div className="px-4 py-10">
          <SkeletonLines count={5} />
        </div>
      ) : filteredPoints.length === 0 ? (
        <EmptyState
          icon={<TriangleAlert size={32} />}
          title={t("map.noPointsTitle")}
          description={t("map.noPointsDesc")}
        />
      ) : (
        <div>
          <ul className="divide-y divide-cream-darker/60">
            {filteredPoints.slice(0, pointLimit).map((point) => (
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
                      {t("map.scanId", { id: point.scan_id.slice(0, 8) })} - {toCropLabel(point.crop_type, t)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-ink-muted">
                  Lat {point.lat.toFixed(4)}, Lng {point.lng.toFixed(4)}
                </p>
                <p className="text-xs text-ink-muted">
                  {formatDateID(`${point.month}-01`, i18n.language?.startsWith("en") ? "en-US" : "id-ID")}
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
          {filteredPoints.length > pointLimit && (
            <div className="border-t border-cream-darker/60 px-4 py-3 text-center">
              <button
                onClick={() => setPointLimit((prev) => prev + 20)}
                className="text-sm font-medium text-forest-700 transition-colors hover:text-clay"
              >
                {t("map.loadMore", { count: filteredPoints.length - pointLimit })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
