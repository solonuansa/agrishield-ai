/**
 * Axios client terpusat untuk semua request ke AgriShield API.
 * Token JWT disertakan otomatis dari Zustand auth store.
 * Mendukung auto-refresh token saat access token expired (401).
 */
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: tambahkan Authorization header jika token ada
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh token saat 401
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Import dinamis untuk menghindari circular dependency
          const { authApi } = await import("@/api/auth");
          const data = await authApi.refresh(refreshToken);

          useAuthStore.getState().setAccessToken(data.access_token);
          onTokenRefreshed(data.access_token);
          isRefreshing = false;

          // Retry request original dengan token baru
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        } catch (_refreshError) {
          isRefreshing = false;
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      // Jika sedang refresh, antrekan request untuk di-retry setelah selesai
      return new Promise((resolve) => {
        refreshSubscribers.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);
