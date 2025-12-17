import http from "../httpClient";

function toParams(obj?: Record<string, any>) {
  return obj ?? {};
}

export interface ProductoRequestDto {
  idCategoriaProducto?: number;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  imagenUrl?: string;
  precioActual: number;
  enOferta?: boolean;
  precioOferta?: number;
  visibleDirectorio?: boolean;
}

export interface ProductoResponseDto {
  idProducto: number;
  idStand: number;

  idCategoriaProducto?: number;
  nombreCategoriaProducto?: string;

  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  imagenUrl?: string;

  precioActual?: number;
  enOferta?: boolean;
  precioOferta?: number;
  visibleDirectorio?: boolean;

  bloqueStand?: string;
  numeroStand?: string;
  nombreComercialStand?: string;
}

export const productosSocioApi = {
  listarPorStand(idStand: number) {
    return http.get<ProductoResponseDto[]>(`/api/v1/socio/stands/${idStand}/productos`);
  },

  crearEnStand(idStand: number, payload: any) {
    return http.post(`/api/v1/socio/stands/${idStand}/productos`, payload);
  },

  actualizar(idProducto: number, payload: any) {
    return http.put(`/api/v1/socio/productos/${idProducto}`, payload);
  },

  eliminar(idProducto: number) {
    return http.delete(`/api/v1/socio/productos/${idProducto}`);
  },

  cambiarVisibilidad(idProducto: number, visible: boolean) {
    return http.patch(
      `/api/v1/socio/productos/${idProducto}/visibilidad`,
      null,
      { params: { visible } }
    );
  },
};