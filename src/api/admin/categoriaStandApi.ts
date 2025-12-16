import http from "../httpClient";

export type EstadoCategoria = "Activo" | "Inactivo";

export interface CategoriaStandResponse {
  id: number;
  nombre: string;
  descripcion: string;
  colorHex: string | null;
  iconoUrl: string | null;
  estado: boolean; // true = activo, false = inactivo
}

export interface CategoriaStandRequest {
  nombre: string;
  descripcion: string;
  colorHex?: string | null;
  iconoUrl?: string | null;
  estado: boolean;
}

const BASE_URL = "/api/v1/admin/categorias-stands";

export const listarCategorias = async (): Promise<CategoriaStandResponse[]> => {
  const { data } = await http.get<CategoriaStandResponse[]>(BASE_URL);
  return data;
};

export const crearCategoria = async (
  body: CategoriaStandRequest
): Promise<CategoriaStandResponse> => {
  const { data } = await http.post<CategoriaStandResponse>(BASE_URL, body);
  return data;
};

export const actualizarCategoria = async (
  id: number,
  body: CategoriaStandRequest
): Promise<CategoriaStandResponse> => {
  const { data } = await http.put<CategoriaStandResponse>(
    `${BASE_URL}/${id}`,
    body
  );
  return data;
};

export const eliminarCategoria = async (id: number): Promise<void> => {
  await http.delete(`${BASE_URL}/${id}`);
};