/**
 * API calls untuk modul Lahan (Fields).
 */
import { apiClient } from "./client";
import type { CropType } from "./scans";

export interface Field {
  id: string;
  name: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  area_hectares: number | null;
  crop_type: CropType | null;
  created_at: string;
}

export interface CreateFieldPayload {
  name: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  area_hectares?: number;
  crop_type?: CropType;
}

export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {}

export const fieldsApi = {
  list: async (): Promise<Field[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: Field[] }>("/fields");
    return data.data;
  },

  create: async (payload: CreateFieldPayload): Promise<Field> => {
    const { data } = await apiClient.post<{ success: boolean; data: Field }>(
      "/fields",
      payload
    );
    return data.data;
  },

  update: async (id: string, payload: UpdateFieldPayload): Promise<Field> => {
    const { data } = await apiClient.put<{ success: boolean; data: Field }>(
      `/fields/${id}`,
      payload
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/fields/${id}`);
  },
};
