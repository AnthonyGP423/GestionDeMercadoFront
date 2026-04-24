import http from "../httpClient";

export interface SocioCuotaDto {
  idCuota?: number;

  idStand?: number;

  id?: number;
  monto?: number;

  estado?: string;
  fechaVencimiento?: string; // ISO
  periodo?: string;

  stand?: string;
  nombreStand?: string;
  numeroStand?: string;
  bloque?: string;

  montoCuota?: number;
  montoPagado?: number;
  saldoPendiente?: number;

  medioPago?: string;
  referenciaPago?: string;
  fechaPago?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const cuotasSocioApi = {
  misCuotas() {
    return http.get<any>("/api/v1/socio/cuotas/mis-cuotas");
  },

  listar(params?: {
    estado?: string;
    periodo?: string;
    page?: number;
    size?: number;
  }) {
    return http.get<PageResponse<SocioCuotaDto>>(
      "/api/v1/socio/cuotas/mis-cuotas",
      { params }
    );
  },
};