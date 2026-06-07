import type { BadgeVariant } from "@/components/ui/Badge";

export function useCropOptions(t: (key: string) => string) {
  return [
    { value: "all", label: t("map.allCrops") },
    { value: "rice", label: t("crop.rice") },
    { value: "corn", label: t("crop.corn") },
  ] as const;
}

export function toCropLabel(value: string, t: (key: string) => string) {
  return value === "rice" ? t("crop.rice") : t("crop.corn");
}

export function confidenceColor(confidence: number) {
  if (confidence >= 0.85) return "#b91c1c";
  if (confidence >= 0.5) return "#a16207";
  return "#15803d";
}

export function diseaseBadgeVariant(disease: string): BadgeVariant {
  const lower = disease.toLowerCase();
  if (lower.includes("blast") || lower.includes("busuk") || lower.includes("kresek"))
    return "danger";
  if (lower.includes("blight") || lower.includes("hawar") || lower.includes("karat") || lower.includes("rust") || lower.includes("bercak"))
    return "warning";
  if (lower.includes("tungro"))
    return "info";
  return "default";
}
