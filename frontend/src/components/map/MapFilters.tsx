"use client";

import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { getCropOptions } from "@/lib/map-utils";

interface MapFiltersProps {
  cropFilter: "all" | "rice" | "corn";
  onCropFilterChange: (value: "all" | "rice" | "corn") => void;
  diseaseFilter: string;
  onDiseaseFilterChange: (value: string) => void;
  minConfidence: number;
  onMinConfidenceChange: (value: number) => void;
  uniqueDiseases: string[];
}

export function MapFilters({
  cropFilter,
  onCropFilterChange,
  diseaseFilter,
  onDiseaseFilterChange,
  minConfidence,
  onMinConfidenceChange,
  uniqueDiseases,
}: MapFiltersProps) {
  const { t } = useTranslation();
  const CROP_OPTIONS = getCropOptions(t);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
        <span className="text-sm text-ink-soft">{t("map.filter")}</span>
      </div>
      <Select
        options={[...CROP_OPTIONS]}
        value={cropFilter}
        onChange={(e) =>
          onCropFilterChange(e.target.value as "all" | "rice" | "corn")
        }
        className="w-32"
      />
      {uniqueDiseases.length > 0 && (
        <Select
          options={[
            { value: "all", label: t("map.allDiseases") },
            ...uniqueDiseases.map((d) => ({ value: d, label: d })),
          ]}
          value={diseaseFilter}
          onChange={(e) => onDiseaseFilterChange(e.target.value)}
          className="w-44"
        />
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted">{t("map.minConfidence")}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(minConfidence * 100)}
          onChange={(e) => onMinConfidenceChange(Number(e.target.value) / 100)}
          className="h-1 w-24 accent-forest-700"
        />
        <span className="w-8 text-xs tabular-nums text-ink-soft">
          {Math.round(minConfidence * 100)}%
        </span>
      </div>
    </div>
  );
}
