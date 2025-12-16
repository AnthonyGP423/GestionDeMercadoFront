import http from "../httpClient";

export interface CrearCredencialRequest {
  idUsuario: number;
  fechaVencimiento?: string; // ISO: "2025-12-10"
  tipoCredencial?: string;   // SOCIO, TRABAJADOR, SEGURIDAD, etc.
}

export interface CredencialResponseDto {
  idCredencial: number;
  idUsuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  codigoQr: string;
  tipoCredencial: string;
  fechaEmision: string;
  fechaVencimiento: string | null;
  vigente: boolean;
}

export interface ValidacionQrResponseDto {
  valida: boolean;
  mensaje: string;
  idUsuario?: number;
  nombres?: string;
  apellidos?: string;
  estadoUsuario?: string;
  tipoCredencial?: string;
  fechaEmision?: string;
  fechaVencimiento?: string | null;
  vigente?: boolean;
}


const credencialesQrAdminApi = {
  crear: async (
    body: CrearCredencialRequest
  ): Promise<CredencialResponseDto> => {
    const res = await http.post<CredencialResponseDto>(
      "/api/v1/admin/credenciales-qr",
      body
    );
    return res.data;

  },
  listarHistorialPorUsuario: async (
    idUsuario: number
  ): Promise<CredencialResponseDto[]> => {
    const res = await http.get<CredencialResponseDto[]>(
      `/api/v1/admin/credenciales-qr/usuario/${idUsuario}`
    );
    return res.data;
  },

  validarPorCodigo: async (
    codigoQr: string
  ): Promise<ValidacionQrResponseDto> => {
    const res = await http.get<ValidacionQrResponseDto>(
      `/api/v1/credenciales/validar/${encodeURIComponent(codigoQr)}`
    );
    return res.data;
  },
};


export default credencialesQrAdminApi;