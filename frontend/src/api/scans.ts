/**
 * API calls untuk modul Scan.
 */
import { apiClient } from "./client";

export type ScanStatus = "pending" | "processing" | "completed" | "failed";
export type CropType = "rice" | "corn";

export interface AlternativeDiagnosis {
  disease: string;
  confidence: number;
}

export interface ScanResult {
  detected_disease: string;
  confidence: number;
  alternatives: AlternativeDiagnosis[];
  recommendation: string | null;
  model_version: string;
  is_mock: boolean;
  processed_at: string;
}

export interface Scan {
  id: string;
  crop_type: CropType;
  status: ScanStatus;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  result: ScanResult | null;
}

export interface CreateScanPayload {
  file: File;
  crop_type: CropType;
  latitude?: number;
  longitude?: number;
}

export interface ScanListMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ScanListResponse {
  scans: Scan[];
  meta: ScanListMeta;
}

export const scansApi = {
  create: async (payload: CreateScanPayload): Promise<Scan> => {
    const form = new FormData();
    form.append("file", payload.file);
    form.append("crop_type", payload.crop_type);
    if (payload.latitude != null) form.append("latitude", String(payload.latitude));
    if (payload.longitude != null) form.append("longitude", String(payload.longitude));

    const { data } = await apiClient.post<{ success: boolean; data: Scan }>(
      "/scans",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  getById: async (scanId: string): Promise<Scan> => {
    const { data } = await apiClient.get<{ success: boolean; data: Scan }>(
      `/scans/${scanId}`
    );
    return data.data;
  },

  listMine: async (page = 1, perPage = 20): Promise<ScanListResponse> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Scan[];
      meta: ScanListMeta;
    }>("/scans", { params: { page, per_page: perPage } });
    return { scans: data.data, meta: data.meta };
  },
};
