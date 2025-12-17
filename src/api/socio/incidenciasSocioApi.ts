import http from "../httpClient";

export interface SocioIncidenciaDto {
  id?: number;
  idIncidencia?: number;

  idStand?: number;
  nombreStand?: string;
  bloque?: string;
  numeroStand?: string;

  idReportante?: number;
  nombreReportante?: string;

  idResponsable?: number;
  nombreResponsable?: string;

  titulo?: string;
  descripcion?: string;

  tipo?: string;
  prioridad?: string;
  estado?: string;

  imagenUrl?: string;
  fotoUrl?: string;

  fechaRegistro?: string;
  fechaReporte?: string;
  fechaCierre?: string;
}

export type CrearIncidenciaPayload = {
  idStand: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  prioridad: string;
  imagenUrl?: string;
  fotoUrl?: string;
};

export type IncidenciaSocioDto = SocioIncidenciaDto;
export type IncidenciaCreateRequest = CrearIncidenciaPayload;

function normalizeCreatePayload(payload: any) {
  const p = payload ?? {};
  if (p.imagenUrl && !p.fotoUrl) return { ...p, fotoUrl: p.imagenUrl };
  return p;
}

export const incidenciasSocioApi = {
  listar(params?: { estado?: string; page?: number; size?: number }) {
    return http.get("/api/v1/socio/incidencias", { params: params ?? {} });
  },

  crear(payload: any) {
    return http.post("/api/v1/socio/incidencias", normalizeCreatePayload(payload));
  },
};