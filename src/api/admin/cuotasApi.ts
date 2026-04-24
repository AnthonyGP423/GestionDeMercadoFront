
import http from "../httpClient";

export interface CuotaResponseDto {
  idCuota: number;
  idStand: number;
  nombreStand: string;
  bloque: string;
  numeroStand: string;
  periodo: string;
  fechaVencimiento?: string;
  montoCuota: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
  medioPago?: string;
  referenciaPago?: string;
  fechaPago?: string;
}

export interface CuotaMasivaRequest {
  periodo: string;
  fechaVencimiento?: string;
  montoCuota: number;
  bloque?: string;
  idCategoriaStand?: number;
}

export interface CuotaRequest {
  periodo: string;
  fechaVencimiento?: string;
  montoCuota: number;
}

export interface PagoCuotaRequest {
  montoPagado: number;
  medioPago: string;
  referenciaPago?: string;
  fechaPago?: string;
  observaciones?: string;
}

export interface IndicadoresCuotasDto {
  periodo: string;
  totalStandsConCuota: number;
  standsAlDia: number;
  standsMorosos: number;
  porcentajeAlDia: number;
  porcentajeMorosos: number;
  morosidadPorBloque: {
    bloque: string;
    standsAlDia: number;
    standsMorosos: number;
  }[];
}

// Filtros para cuotas admin
export interface FiltroCuotasAdmin {
  periodo?: string;
  estado?: string;
  bloque?: string;
  idCategoriaStand?: number;
}

const baseUrl = "/api/v1/admin/cuotas";

const cuotasApi = {
  // POST /api/v1/admin/cuotas/stand/{idStand}
  generarCuotaParaStand: (idStand: number, body: CuotaRequest) =>
    http
      .post<CuotaResponseDto>(`${baseUrl}/stand/${idStand}`, body)
      .then((r) => r.data),

  // POST /api/v1/admin/cuotas/masivo
  generarCuotasMasivo: (body: CuotaMasivaRequest) =>
    http.post<void>(`${baseUrl}/masivo`, body).then((r) => r.data),

  // POST /api/v1/admin/cuotas/{idCuota}/pagos
  registrarPago: (idCuota: number, body: PagoCuotaRequest) =>
    http
      .post<CuotaResponseDto>(`${baseUrl}/${idCuota}/pagos`, body)
      .then((r) => r.data),

  // GET /api/v1/admin/cuotas/stand/{idStand}?page=&size=
  listarCuotasPorStandAdmin: (idStand: number, page = 0, size = 20) =>
    http
      .get<{ content: CuotaResponseDto[] }>(`${baseUrl}/stand/${idStand}`, {
        params: { page, size },
      })
      .then((r) => r.data.content),

  // ✅ NUEVO: GET /api/v1/admin/cuotas (todas las cuotas con filtros opcionales)
  listarCuotasAdmin: (filtros: FiltroCuotasAdmin = {}) =>
    http
      .get<CuotaResponseDto[]>(`${baseUrl}`, { params: filtros })
      .then((r) => r.data),

  // GET /api/v1/admin/cuotas/morosos
  listarMorosos: (params: {
    periodo?: string;
    bloque?: string;
    idCategoriaStand?: number;
  }) =>
    http
      .get<CuotaResponseDto[]>(`${baseUrl}/morosos`, { params })
      .then((r) => r.data),

  // GET /api/v1/admin/cuotas/ultimos-pagos
  listarUltimosPagos: (limit = 5) =>
    http
      .get<CuotaResponseDto[]>(`${baseUrl}/ultimos-pagos`, {
        params: { limit },
      })
      .then((r) => r.data),

  // GET /api/v1/admin/cuotas/indicadores
  obtenerIndicadores: (periodo: string) =>
    http
      .get<IndicadoresCuotasDto>(`${baseUrl}/indicadores`, {
        params: { periodo },
      })
      .then((r) => r.data),
};

export default cuotasApi;