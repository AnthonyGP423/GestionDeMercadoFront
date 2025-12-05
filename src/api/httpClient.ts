import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Adjuntar token si existe
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo global de errores (luego lo afinamos)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Aquí luego pondremos limpiar sesión / redirigir al login
      // console.warn("No autenticado o token expirado");
    }
    return Promise.reject(error);
  }
);

export default http;
