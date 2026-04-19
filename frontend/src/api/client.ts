/**
 * Axios client terpusat untuk semua request ke AgriShield API.
 * Token JWT disertakan otomatis dari Zustand auth store.
 */
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: tambahkan Authorization header jika token ada
apiClient.interceptors.request.use((config) => {
  // Import dinamis untuk menghindari circular dependency
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: tangani 401 global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
