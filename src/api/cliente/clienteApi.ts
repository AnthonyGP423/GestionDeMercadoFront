import http from "../httpClient";

export type ClienteMeResponseDto = {
  idCliente: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  rol: string | null;
};

export const clienteApi = {
  me() {
    return http.get<ClienteMeResponseDto>("/api/v1/cliente/me");
  },
};