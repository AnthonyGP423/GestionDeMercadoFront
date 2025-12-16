import http from "../httpClient";

export type IncidenciaEstado = "ABIERTA" | "EN_PROCESO" | "RESUELTA" | "CERRADA";
export type IncidenciaPrioridad = "BAJA" | "MEDIA" | "ALTA";

export interface IncidenciaResponseDto {
  idIncidencia: number;
  idStand: number | null;
  nombreStand: string | null;
  bloque: string | null;
  numeroStand: string | null;

  idReportante: number | null;
  nombreReportante: string | null;

  idResponsable: number | null;
  nombreResponsable: string | null;

  titulo: string;
  descripcion: string;
  tipo: string | null;
  prioridad: IncidenciaPrioridad | string | null;
  estado: IncidenciaEstado | string;
  fotoUrl: string | null;
  fechaReporte: string | null;
  fechaCierre: string | null;
}

// Page genérico de Spring Data
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página actual
}

export interface IncidenciaResumenMensualDto {
  anio: number;
  mes: number;
  totalAbiertas: number;
  totalEnProceso: number;
  totalResueltas: number;
  totalCerradas: number;
}

export interface IncidenciaPorResponsableDto {
  idResponsable: number;
  nombreResponsable: string;
  totalAbiertas: number;
  totalEnProceso: number;
  totalResueltas: number;
  totalCerradas: number;
}

const baseUrl = "/api/v1/admin/incidencias";

const incidenciaAdminApi = {
  async listar(params?: {
    estado?: string;
    tipo?: string;
    prioridad?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<IncidenciaResponseDto>> {
    const response = await http.get<PageResponse<IncidenciaResponseDto>>(baseUrl, {
      params,
    });
    return response.data;
  },

  async cambiarEstado(idIncidencia: number, nuevoEstado: string): Promise<IncidenciaResponseDto> {
    const response = await http.patch<IncidenciaResponseDto>(
      `${baseUrl}/${idIncidencia}/estado`,
      { nuevoEstado }
    );
    return response.data;
  },

  async asignarResponsable(idIncidencia: number, idResponsable: number): Promise<IncidenciaResponseDto> {
    const response = await http.patch<IncidenciaResponseDto>(
      `${baseUrl}/${idIncidencia}/responsable`,
      { idResponsable }
    );
    return response.data;
  },

  async resumenMensual(): Promise<IncidenciaResumenMensualDto[]> {
    const response = await http.get<IncidenciaResumenMensualDto[]>(
      `${baseUrl}/reportes/mensual`
    );
    return response.data;
  },

  async resumenPorResponsable(): Promise<IncidenciaPorResponsableDto[]> {
    const response = await http.get<IncidenciaPorResponsableDto[]>(
      `${baseUrl}/reportes/responsables`
    );
    return response.data;
  },
};

export default incidenciaAdminApi;