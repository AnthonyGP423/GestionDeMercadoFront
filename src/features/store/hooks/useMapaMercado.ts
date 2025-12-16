// src/features/store/hooks/useMapaMercado.ts
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getBloquesMapa,
  getMapaStandsByBloque,
  BloqueResumenApi,
  StandMapaApi,
} from "../../../api/public/standsPublicApi";

import {
  Bloque,
  BloqueResumen,
  StandBase,
  StandEstado,
  StandMapa,
} from "../types/mapa.types";

function normalizeBloque(value: any): Bloque {
  return String(value ?? "").toUpperCase();
}

function mapBloques(api: BloqueResumenApi[]): BloqueResumen[] {
  return (api ?? []).map((b) => ({
    bloque: normalizeBloque(b.bloque),
    totalStands:
      typeof b.totalStands === "number" ? b.totalStands : undefined,
  }));
}

function mapStands(api: StandMapaApi[]): StandBase[] {
  return (api ?? []).map((dto) => {
    const estadoRaw: string = dto.estado ?? "DISPONIBLE";
    const estadoUpper = estadoRaw.toUpperCase() as StandEstado;

    return {
      id: dto.id,
      bloque: normalizeBloque(dto.bloque),
      numeroStand: dto.numeroStand,
      nombreComercial: dto.nombreComercial,
      rubro: dto.rubro ?? dto.nombreCategoriaStand ?? "---",
      estado: estadoUpper,
    };
  });
}

type LocationState = {
  state?: {
    initialBlock?: string;
  };
};

export function useMapaMercado() {
  const location = useLocation() as LocationState;

  const initialBlockFromState = location.state?.initialBlock
    ? normalizeBloque(location.state.initialBlock)
    : undefined;

  const [bloqueActual, setBloqueActual] = useState<Bloque | "">(
    initialBlockFromState ?? ""
  );

  const [bloquesDisponibles, setBloquesDisponibles] = useState<BloqueResumen[]>(
    []
  );

  const [standsBloque, setStandsBloque] = useState<StandBase[]>([]);
  const [standSeleccionado, setStandSeleccionado] = useState<StandMapa | null>(
    null
  );

  const [loadingBloques, setLoadingBloques] = useState(false);
  const [errorBloques, setErrorBloques] = useState<string | null>(null);

  const [loadingStands, setLoadingStands] = useState(false);
  const [errorStands, setErrorStands] = useState<string | null>(null);

  // ==== CARGA BLOQUES ====
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingBloques(true);
        setErrorBloques(null);

        const api = await getBloquesMapa();
        const mapped = mapBloques(api);

        setBloquesDisponibles(mapped);

        if (mapped.length > 0) {
          const existeInitial =
            initialBlockFromState &&
            mapped.some((x) => normalizeBloque(x.bloque) === initialBlockFromState);

          if (existeInitial) {
            setBloqueActual(initialBlockFromState);
          } else if (!bloqueActual) {
            setBloqueActual(mapped[0].bloque);
          }
        }
      } catch (e) {
        console.error(e);
        setErrorBloques("No se pudieron cargar los bloques del mercado.");
      } finally {
        setLoadingBloques(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==== CARGA STANDS POR BLOQUE ====
  useEffect(() => {
    if (!bloqueActual) return;

    const run = async () => {
      try {
        setLoadingStands(true);
        setErrorStands(null);

        const api = await getMapaStandsByBloque(String(bloqueActual));
        const mapped = mapStands(api);

        setStandsBloque(mapped);
        setStandSeleccionado(null);
      } catch (e) {
        console.error(e);
        setErrorStands("No se pudo cargar el mapa de stands.");
      } finally {
        setLoadingStands(false);
      }
    };

    run();
  }, [bloqueActual]);

  const seleccionarBloque = (b: Bloque) => {
    const normalized = normalizeBloque(b);
    setBloqueActual(normalized);
    setStandSeleccionado(null);
  };

  const seleccionarStandBase = (stand: StandBase, pasillo: 1 | 2, rowIndex: number) => {
    const standMapa: StandMapa = {
      ...stand,
      pasillo,
      orden: rowIndex + 1,
      numero: stand.numeroStand,
    };
    setStandSeleccionado(standMapa);
  };

  const standsOrdenados = useMemo(() => {
    return standsBloque
      .slice()
      .sort((a, b) => a.numeroStand.localeCompare(b.numeroStand));
  }, [standsBloque]);

  return {
    // state
    bloqueActual,
    bloquesDisponibles,
    standsBloque,
    standsOrdenados,
    standSeleccionado,

    // flags
    loadingBloques,
    errorBloques,
    loadingStands,
    errorStands,

    // actions
    setBloqueActual: seleccionarBloque,
    setStandSeleccionado,
    seleccionarStandBase,
  };
}