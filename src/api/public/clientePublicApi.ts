import http from "../httpClient";

export interface RegistroClienteRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
}

export const clientePublicApi = {
  registrar(payload: RegistroClienteRequest) {
    return http.post("/api/public/clientes/registro", payload);
  },
};