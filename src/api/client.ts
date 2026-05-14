import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthToken, getAuthToken } from "../utils/storage";

/**
 * Central Axios instance.
 * - Injects Bearer token on every request
 * - Handles 401 globally by clearing auth state
 * Update BASE_URL to your actual API endpoint.
 */
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://livestock-backend-production.up.railway.app/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API Request
    console.log(
      `🚀 [Axios Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — clear stored credentials
      await clearAuthToken();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
