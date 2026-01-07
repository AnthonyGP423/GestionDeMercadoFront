import http from "../httpClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;      
  tipoToken: string;  // "Bearer"
  email: string;
  rol: string;  
  nombreCompleto?: string;
  fotoUrl?: string;   
}

export const authApi = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>("/api/auth/login", data),
};