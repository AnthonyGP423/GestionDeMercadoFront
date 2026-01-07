// src/api/httpClient.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const http = axios.create({
  baseURL: API_BASE_URL,
});

// --- Evitar que dispare 20 veces el mismo flujo ---
let expiredHandled = false;
let lastToken: string | null = null;

// Interceptor request (igual que tienes, solo agrego reset del flag)
http.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token_cliente") ||
      localStorage.getItem("token_intranet") ||
      localStorage.getItem("token");

    // si cambió el token, resetea el “handled”
    if (token && token !== lastToken) {
      lastToken = token;
      expiredHandled = false;
    }

    if (token) {
      if (!config.headers) config.headers = {} as any;
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    let msg = "Ocurrió un error";

    if (typeof data === "string" && data.trim()) {
      msg = data;
    }

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

    if (!error?.response) {
      msg = "No se pudo conectar con el servidor. Revisa tu conexión.";
    }

    // ✅ SESSION EXPIRED / NO AUTENTICADO (401/403)
    if ((status === 401 || status === 403) && !expiredHandled) {
      expiredHandled = true;

      // limpia tokens
      localStorage.removeItem("token_cliente");
      localStorage.removeItem("token_intranet");
      localStorage.removeItem("token");

      // dispara evento global para que React haga toast + navigate
      window.dispatchEvent(
        new CustomEvent("auth:session-expired", {
          detail: {
            message: "Tu sesión ha expirado. Vuelve a iniciar sesión.",
          },
        })
      );
    }

    (error as any).userMessage = msg;
    return Promise.reject(error);
  }
);

export default http;