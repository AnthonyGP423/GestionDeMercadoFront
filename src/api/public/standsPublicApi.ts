// src/api/public/standsPublicApi.ts
import http from "../httpClient";

export type BloqueResumenApi = {
  bloque: string;
  totalStands?: number;
};

export type StandMapaApi = {
  id: number;
  bloque: string;
  numeroStand: string;
  nombreComercial: string;
  estado?: string;
  rubro?: string;
  nombreCategoriaStand?: string;
};

export const getBloquesMapa = async (): Promise<BloqueResumenApi[]> => {
  const res = await http.get("/api/public/stands/mapa/bloques");
  return res.data;
};

export const getMapaStandsByBloque = async (
  bloque: string
): Promise<StandMapaApi[]> => {
  const res = await http.get("/api/public/stands/mapa", {
    params: { bloque },
  });
  return res.data;
};