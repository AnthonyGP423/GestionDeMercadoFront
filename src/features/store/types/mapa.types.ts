// src/features/store/types/mapa.types.ts

// Bloque dinámico
export type Bloque = string;
export type Pasillo = 1 | 2;

// Estados alineados con backend / panel
export type StandEstado = "ABIERTO" | "CERRADO" | "CLAUSURADO" | "DISPONIBLE";

export type StandBase = {
  id: number;
  bloque: Bloque;
  numeroStand: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;
};

// Tipo usado en el mapa
export type StandMapa = StandBase & {
  pasillo?: Pasillo;
  orden?: number;
  numero: string;
};

// Resumen de bloques desde backend
export interface BloqueResumen {
  bloque: Bloque;
  totalStands?: number;
}