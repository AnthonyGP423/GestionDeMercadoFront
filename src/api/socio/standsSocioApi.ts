import http from "../httpClient";

export interface SocioStandDto {
  id: number;
  bloque?: string;
  numeroStand?: string;
  nombreComercial?: string;
  estado?: string;
  nombreCategoriaStand?: string;
  rubro?: string;
}

export const standsSocioApi = {
  misStands() {
    return http.get<SocioStandDto[]>("/api/v1/stands/mis-stands");
  },

  productosPorStand(idStand: number) {
    return http.get<any[]>(`/api/v1/socio/stands/${idStand}/productos`);
  },

  cambiarEstado(id: number, estado: "ABIERTO" | "CERRADO") {
    return http.patch(`/api/v1/stands/mis-stands/${id}/estado`, { estado });
  },
};