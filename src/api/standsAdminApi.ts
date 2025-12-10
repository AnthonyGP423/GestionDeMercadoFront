import http from "./httpClient";

export type EstadoStand = "ABIERTO" | "CERRADO" | "CLAUSURADO";

export interface StandBackend {
  id: number;
  idPropietario: number;
  nombrePropietario: string;

  idCategoriaStand: number;
  nombreCategoriaStand: string;

  bloque: string;
  numeroStand: string;
  nombreComercial: string;
  descripcionNegocio: string;

  latitud: number | null;
  longitud: number | null;

  estado: EstadoStand;
}

export interface StandRow {
  id: number;
  bloque: string;
  numeroStand: string;
  codigoStand: string; // A-101
  nombreComercial: string;
  categoria: string;
  propietario: string;
  estado: EstadoStand;
}

export interface StandRequestDto {
  idPropietario: number | null;
  idCategoriaStand: number | null;
  bloque: string;
  numeroStand: string;
  nombreComercial: string;
  descripcionNegocio: string;
  latitud: number | null;
  longitud: number | null;
}

export interface CambiarEstadoStandRequest {
  estado: EstadoStand;
}

const mapBackendToRow = (s: StandBackend): StandRow => ({
  id: s.id,
  bloque: s.bloque,
  numeroStand: s.numeroStand,
  codigoStand: `${s.bloque}-${s.numeroStand}`,
  nombreComercial: s.nombreComercial,
  categoria: s.nombreCategoriaStand,
  propietario: s.nombrePropietario,
  estado: s.estado,
});

const standsAdminApi = {
  async listar(): Promise<StandRow[]> {
    const { data } = await http.get<StandBackend[]>("/api/v1/stands");
    return data.map(mapBackendToRow);
  },

  async obtener(id: number): Promise<StandBackend> {
    const { data } = await http.get<StandBackend>(`/api/v1/stands/${id}`);
    return data;
  },

  async crear(payload: StandRequestDto): Promise<StandRow> {
    const { data } = await http.post<StandBackend>("/api/v1/stands", payload);
    return mapBackendToRow(data);
  },

  async actualizar(
    id: number,
    payload: StandRequestDto
  ): Promise<StandRow> {
    const { data } = await http.put<StandBackend>(
      `/api/v1/stands/${id}`,
      payload
    );
    return mapBackendToRow(data);
  },

  async eliminar(id: number): Promise<void> {
    await http.delete(`/api/v1/stands/${id}`);
  },

  async cambiarEstado(id: number, estado: EstadoStand): Promise<StandRow> {
    const body: CambiarEstadoStandRequest = { estado };
    const { data } = await http.patch<StandBackend>(
      `/api/v1/stands/${id}/estado`,
      body
    );
    return mapBackendToRow(data);
  },
};

export default standsAdminApi;