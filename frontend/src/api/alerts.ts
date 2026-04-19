/**
 * API calls untuk modul Alert (peringatan wabah).
 */
import { apiClient } from "./client";

export type AlertSeverity = "low" | "medium" | "high";

export interface Alert {
  id: string;
  disease: string;
  crop_type: string;
  center_latitude: number;
  center_longitude: number;
  area_name: string | null;
  case_count: number;
  radius_km: number;
  severity: AlertSeverity;
  message: string;
  status: string;
  detected_from: string;
  detected_until: string;
  created_at: string;
  is_read: boolean;
}

export interface AlertListData {
  alerts: Alert[];
  unread_count: number;
}

export interface GetAlertsParams {
  lat?: number;
  lng?: number;
  radius_km?: number;
}

export const alertsApi = {
  list: async (params?: GetAlertsParams): Promise<AlertListData> => {
    const { data } = await apiClient.get<{ success: boolean; data: AlertListData }>(
      "/alerts",
      { params }
    );
    return data.data;
  },

  markRead: async (alertIds: string[]): Promise<void> => {
    await apiClient.post("/alerts/read", alertIds);
  },
};
