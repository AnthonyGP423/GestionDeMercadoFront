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

// Interceptor de respuesta del backend
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error?.response?.data;

    let msg = "Ocurrió un error";

    // 1) Si backend devuelve texto plano
    if (typeof data === "string" && data.trim()) {
      msg = data;
    }

    // 2) Si backend devuelve JSON con campos comunes
    if (data && typeof data === "object") {
      msg =
        data.message ||
        data.mensaje ||
        data.error ||
        data.detail ||
        data.title ||
        data.descripcion ||
        msg;
    }

    // 3) Si no hay response (caída de red, CORS, etc.)
    if (!error?.response) {
      msg = "No se pudo conectar con el servidor. Revisa tu conexión.";
    }

    // Guardamos el mensaje para usarlo en los catch
    (error as any).userMessage = msg;

    return Promise.reject(error);
  }
);

export default http;