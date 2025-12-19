// src/features/store/types/mapa.types.ts

export type Bloque = string;
export type Pasillo = 1 | 2;

export type StandEstado = "ABIERTO" | "CERRADO" | "CLAUSURADO" | "DISPONIBLE";

export type StandBase = {
  id: number;
  bloque: Bloque;
  numeroStand: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;

  // ✅ NUEVO (opcional para no romper)
  idCategoriaStand?: number | null;
  nombreCategoriaStand?: string | null;
  categoriaColorHex?: string | null;
};

export type StandMapa = StandBase & {
  pasillo?: Pasillo;
  orden?: number;
  numero: string;
};

export interface BloqueResumen {
  bloque: Bloque;
  totalStands?: number;
}