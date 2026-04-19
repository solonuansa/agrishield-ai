/**
 * API calls untuk autentikasi: register dan login.
 */
import { apiClient } from "./client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  province: string | null;
  city: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  province?: string;
  city?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      "/auth/register",
      payload
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      "/auth/login",
      payload
    );
    return data.data;
  },
};
