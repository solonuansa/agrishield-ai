import type { ScanResponse } from "@/types/api";

export function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 11) return t("dashboard.greetingMorning");
  if (hour < 15) return t("dashboard.greetingAfternoon");
  if (hour < 18) return t("dashboard.greetingEvening");
  return t("dashboard.greetingNight");
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

export function getStatusVariant(
  scan: ScanResponse
): "default" | "success" | "warning" | "danger" | "info" {
  if (scan.status === "failed") return "danger";
  if (scan.status === "pending" || scan.status === "processing") return "warning";
  if (scan.result?.detected_disease) return "danger";
  return "success";
}

export function getStatusLabel(scan: ScanResponse, t: (key: string) => string): string {
  if (scan.status === "failed") return t("scan.statusFailed_label");
  if (scan.status === "pending" || scan.status === "processing") return t("dashboard.processing");
  if (scan.result?.detected_disease) return scan.result.detected_disease;
  return "Sehat";
}
