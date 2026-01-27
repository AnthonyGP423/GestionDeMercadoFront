import http from "../httpClient";

// =========================
// LOGIN
// =========================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipoToken: string; // "Bearer"
  email: string;
  rol: string;
  nombreCompleto?: string;
  fotoUrl?: string;
}

// =========================
// FORGOT / RESET PASSWORD
// =========================
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// =========================
// API
// =========================
export const authApi = {
  // Login (igual que antes)
  login: (data: LoginRequest) =>
    http.post<LoginResponse>("/api/auth/login", data),

  // Forgot password (envía correo)
  forgotPassword: (data: ForgotPasswordRequest) =>
    http.post("/api/auth/forgot-password", data),

  // Reset password (cambia contraseña)
  resetPassword: (data: ResetPasswordRequest) =>
    http.post("/api/auth/reset-password", data),
};