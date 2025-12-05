import http from "./httpClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;      
  tipoToken: string;  // "Bearer"
  email: string;
  rol: string;        // "ADMIN", "SOCIO", etc.
}

export const authApi = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>("/api/auth/login", data),
};