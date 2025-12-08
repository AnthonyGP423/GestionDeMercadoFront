import http from "./httpClient";

export interface RolDto {
  idRol: number;
  nombreRol: string;
  descripcion?: string;
  estadoRegistro?: number;
}

export interface RolCreateRequest {
  nombreRol: string;
  descripcion?: string;
}

export interface RolUpdateRequest {
  nombreRol: string;
  descripcion?: string;
}

const BASE_URL = "/api/v1/admin/roles";

const rolesApi = {
  async listar(): Promise<RolDto[]> {
    const { data } = await http.get<RolDto[]>(BASE_URL);
    return data;
  },

  async crear(payload: RolCreateRequest): Promise<RolDto> {
    const { data } = await http.post<RolDto>(BASE_URL, payload);
    return data;
  },

  async actualizar(idRol: number, payload: RolUpdateRequest): Promise<RolDto> {
    const { data } = await http.put<RolDto>(`${BASE_URL}/${idRol}`, payload);
    return data;
  },

  async eliminar(idRol: number): Promise<void> {
    await http.delete(`${BASE_URL}/${idRol}`);
  },
};

export default rolesApi;