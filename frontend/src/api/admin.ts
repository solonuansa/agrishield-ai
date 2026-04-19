/**
 * API calls untuk Admin/Government dashboard.
 */
import { apiClient } from "./client";

export interface ProvinceStats {
  province: string;
  total_scans: number;
  disease_count: number;
  top_disease: string | null;
}

export interface NationalDiseaseBreakdown {
  disease: string;
  count: number;
  crop_type: string;
}

export interface NationalTimelinePoint {
  week: string;
  total: number;
  disease_count: number;
}

export interface AdminStats {
  total_scans: number;
  total_users: number;
  disease_detected: number;
  healthy_detected: number;
  active_alerts: number;
  by_province: ProvinceStats[];
  top_diseases: NationalDiseaseBreakdown[];
  timeline: NationalTimelinePoint[];
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: AdminStats }>("/admin/stats");
    return data.data;
  },
};
