/**
 * API calls untuk modul Map/Heatmap.
 */
import { apiClient } from "./client";

export interface DiseasePoint {
  scan_id: string;
  lat: number;
  lng: number;
  disease: string;
  crop_type: "rice" | "corn";
  confidence: number;
  month: string;
}

export interface HeatmapData {
  points: DiseasePoint[];
  total: number;
}

export interface HeatmapParams {
  crop_type?: "rice" | "corn";
  disease?: string;
  months?: number;
}

export const mapApi = {
  getHeatmap: async (params: HeatmapParams = {}): Promise<HeatmapData> => {
    const { data } = await apiClient.get<{ success: boolean; data: HeatmapData }>(
      "/map/heatmap",
      { params }
    );
    return data.data;
  },
};
