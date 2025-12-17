import http from "../httpClient";

export interface CredencialQrDto {
  idCredencial?: number;
  idUsuario?: number;
  nombres?: string;
  apellidos?: string;
  email?: string;
  codigoQr?: string;
  tipoCredencial?: string;
  fechaEmision?: string;       // yyyy-MM-dd
  fechaVencimiento?: string;   // yyyy-MM-dd
  vigente?: boolean;

  codigo?: string;
  urlQr?: string;
  estado?: string;
}

export const credencialQrSocioApi = {
  obtener() {
    return http.get<CredencialQrDto>("/api/v1/socio/credencial-qr");
  },
};