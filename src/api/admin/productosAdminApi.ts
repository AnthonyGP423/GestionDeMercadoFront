import http from "../httpClient";

export interface ProductoBackend {
  idProducto: number;
  idStand: number;
  idCategoriaProducto: number;
  nombreCategoriaProducto: string;

  nombre: string;
  descripcion: string;
  unidadMedida: string;
  imagenUrl: string | null;

  precioActual: number;
  enOferta: boolean;
  precioOferta: number | null;
  visibleDirectorio: boolean;

  bloqueStand: string;
  numeroStand: string;
  nombreComercialStand: string;
}

export interface ProductoRow {
  idProducto: number;
  nombre: string;
  categoria: string;
  stand: string;
  unidad: string;

  precioNormal: number;
  precioNormalTexto: string;

  // Oferta
  tieneOferta: boolean;
  ofertaStatus: "Con oferta" | "Sin oferta";
  precioOferta: number | null;
  precioOfertaTexto: string;

  visible: boolean;
  estado: "En venta" | "Eliminado";
}

const mapProductoToRow = (p: ProductoBackend): ProductoRow => {
  const precioNormal = Number(p.precioActual ?? 0);

  const categoria = p.nombreCategoriaProducto || "(Sin categoría)";
  const standText =
    p.bloqueStand && p.numeroStand
      ? `${p.bloqueStand}-${p.numeroStand}`
      : "(Sin stand)";

  const precioOfertaNumber =
    p.precioOferta !== null && p.precioOferta !== undefined
      ? Number(p.precioOferta)
      : null;

  // Regla de oferta
  const hayOferta = !!p.enOferta && precioOfertaNumber !== null;
  const ofertaStatus: "Con oferta" | "Sin oferta" = hayOferta
    ? "Con oferta"
    : "Sin oferta";

  return {
    idProducto: p.idProducto,
    nombre: p.nombre,
    categoria,
    stand: standText,
    unidad: p.unidadMedida,

    precioNormal,
    precioNormalTexto: `S/ ${precioNormal.toFixed(2)}`,

    tieneOferta: hayOferta,
    ofertaStatus,
    precioOferta: precioOfertaNumber,
    precioOfertaTexto: hayOferta
      ? `S/ ${precioOfertaNumber!.toFixed(2)} (oferta)`
      : "-",

    visible: !!p.visibleDirectorio,
    estado: p.visibleDirectorio ? "En venta" : "Eliminado",
  };
};

const BASE_URL = "/api/v1/admin/productos";

const productosAdminApi = {
  async listar(): Promise<ProductoRow[]> {
    const { data } = await http.get<ProductoBackend[]>(BASE_URL);
    return data.map(mapProductoToRow);
  },

  async listarPorStand(idStand: number): Promise<ProductoRow[]> {
    const { data } = await http.get<ProductoBackend[]>(BASE_URL);
    const filtrados = data.filter((p) => p.idStand === idStand);
    return filtrados.map(mapProductoToRow);
  },

  async cambiarVisibilidad(
    idProducto: number,
    visible: boolean
  ): Promise<ProductoRow> {
    const visibleParam = visible ? "True" : "False";
    const { data } = await http.patch<ProductoBackend>(
      `${BASE_URL}/${idProducto}/visibilidad?visible=${visibleParam}`
    );
    return mapProductoToRow(data);
  },
};

export default productosAdminApi;