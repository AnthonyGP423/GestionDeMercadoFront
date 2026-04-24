import http from "../httpClient";

export type CategoriaProductoDto = {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
};

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

export const categoriasProductoSocioApi = {
  async listar() {
    // ✅ ahora sí es SOCIO
    const res = await http.get("/api/v1/socio/categorias-productos/disponibles");
    const arr = toArray<any>(res.data);

    return arr
      .map((x: any) => ({
        id: Number(x.id ?? x.idCategoriaProducto ?? 0),
        nombre: String(x.nombre ?? x.nombreCategoriaProducto ?? ""),
        descripcion: x.descripcion != null ? String(x.descripcion) : undefined,
        estado:
          x.estado != null
            ? Boolean(x.estado)
            : x.estadoRegistro != null
            ? Boolean(x.estadoRegistro)
            : undefined,
      }))
      .filter((c: CategoriaProductoDto) => c.id > 0 && c.nombre.trim().length > 0);
  },
};