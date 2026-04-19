/**
 * API calls untuk modul Dashboard.
 */
import { apiClient } from "./client";

export interface CropBreakdown {
  crop_type: string;
  count: number;
}

export interface DiseaseBreakdown {
  disease: string;
  count: number;
}

export interface TimelinePoint {
  week: string;
  total: number;
  disease_count: number;
}

export interface DashboardStats {
  total_scans: number;
  completed_scans: number;
  disease_detected: number;
  healthy_detected: number;
  by_crop: CropBreakdown[];
  top_diseases: DiseaseBreakdown[];
  timeline: TimelinePoint[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      "/dashboard/stats"
    );
    return data.data;
  },
};
