import http from "./httpClient";

export type EstadoCategoria = "Activo" | "Inactivo";

export interface CategoriaProductoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean; // true = activo, false = inactivo
}

export interface CategoriaProductoRequest {
  nombre: string;
  descripcion: string;
  estado: boolean;
}

export interface CategoriaRow {
  id: number;
  nombre: string;
  descripcion: string;
  estado: EstadoCategoria;
}

// Mappers
const mapFromBackend = (c: CategoriaProductoResponse): CategoriaRow => ({
  id: c.id,
  nombre: c.nombre,
  descripcion: c.descripcion ?? "",
  estado: c.estado ? "Activo" : "Inactivo",
});

const mapToRequest = (c: {
  nombre: string;
  descripcion: string;
  estado: EstadoCategoria;
}): CategoriaProductoRequest => ({
  nombre: c.nombre,
  descripcion: c.descripcion,
  estado: c.estado === "Activo",
});

const categoriasProductosApi = {
  async listar(): Promise<CategoriaRow[]> {
    const res = await http.get<CategoriaProductoResponse[]>(
      "/api/v1/admin/categorias-productos"
    );
    return res.data.map(mapFromBackend);
  },

  async crear(payload: {
    nombre: string;
    descripcion: string;
    estado: EstadoCategoria;
  }): Promise<CategoriaRow> {
    const body = mapToRequest(payload);
    const res = await http.post<CategoriaProductoResponse>(
      "/api/v1/admin/categorias-productos",
      body
    );
    return mapFromBackend(res.data);
  },

  async actualizar(
    id: number,
    payload: {
      nombre: string;
      descripcion: string;
      estado: EstadoCategoria;
    }
  ): Promise<CategoriaRow> {
    const body = mapToRequest(payload);
    const res = await http.put<CategoriaProductoResponse>(
      `/api/v1/admin/categorias-productos/${id}`,
      body
    );
    return mapFromBackend(res.data);
  },

  async eliminar(id: number): Promise<void> {
    await http.delete(`/api/v1/admin/categorias-productos/${id}`);
  },

  async cambiarEstado(
    categoria: CategoriaRow,
    nuevoEstado: EstadoCategoria
  ): Promise<CategoriaRow> {
    const body: CategoriaProductoRequest = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: nuevoEstado === "Activo",
    };

    const res = await http.put<CategoriaProductoResponse>(
      `/api/v1/admin/categorias-productos/${categoria.id}`,
      body
    );

    return mapFromBackend(res.data);
  },
};

export default categoriasProductosApi;