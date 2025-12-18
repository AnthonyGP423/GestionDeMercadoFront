// src/api/httpClient.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const http = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor que mete el Authorization en TODAS las peticiones
http.interceptors.request.use(
  (config) => {
    // 🔐 buscamos token de cliente o intranet
    const token =
      localStorage.getItem("token_cliente") ||
      localStorage.getItem("token_intranet") ||
      localStorage.getItem("token");

    if (token) {
      // Aseguramos que headers existe
      if (!config.headers) {
        config.headers = {} as any;
      }

      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default http;