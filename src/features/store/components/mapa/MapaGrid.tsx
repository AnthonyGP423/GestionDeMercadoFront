// src/features/store/components/mapa/MapaGrid.tsx
import { Fragment, useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { Pasillo, StandBase, StandMapa } from "../../types/mapa.types";

type Props = {
  stands: StandBase[];
  standSeleccionado: StandMapa | null;
  loading: boolean;
  error: string | null;
  onSelectStand: (stand: StandBase, pasillo: Pasillo, rowIndex: number) => void;
};

export default function MapaGrid({
  stands,
  standSeleccionado,
  loading,
  error,
  onSelectStand,
}: Props) {
  // === DISTRIBUCIÓN EN 4 COLUMNAS ===
  const columnas = useMemo(() => {
    const cols: StandBase[][] = [[], [], [], []];

    stands
      .slice()
      .sort((a, b) => a.numeroStand.localeCompare(b.numeroStand))
      .forEach((stand, idx) => {
        const colIndex = idx % 4;
        cols[colIndex].push(stand);
      });

    return cols;
  }, [stands]);

  const maxFilas = useMemo(
    () => Math.max(...columnas.map((c) => c.length), 0),
    [columnas]
  );

  const renderStandCell = (
    stand: StandBase | undefined,
    pasillo: Pasillo,
    colIndex: number,
    rowIndex: number
  ) => {
    if (!stand) return <Box key={`empty-${colIndex}-${rowIndex}`} />;

    const esDisponible = stand.estado === "DISPONIBLE";
    const estadoColor = esDisponible ? "#6b7280" : "#16a34a";
    const selected = standSeleccionado?.id === stand.id;

    return (
      <Tooltip
        key={stand.id}
        title={`${stand.numeroStand} · ${stand.nombreComercial}`}
        arrow
      >
        <Box
          onClick={() => onSelectStand(stand, pasillo, rowIndex)}
          sx={{
            width: 46,
            height: 46,
            borderRadius: 1,
            bgcolor: estadoColor,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: selected
              ? "0 0 0 2px #0ea5e9, 0 10px 20px rgba(15,23,42,0.35)"
              : "0 10px 20px rgba(15,23,42,0.25)",
            transition: "all 0.18s ease",
            transform: selected ? "translateY(-2px)" : "translateY(0)",
            "&:hover": {
              boxShadow:
                "0 0 0 2px #0ea5e9, 0 12px 24px rgba(15,23,42,0.40)",
              transform: "translateY(-3px)",
            },
          }}
        >
          {stand.numeroStand.split("-")[1] ?? stand.numeroStand}
        </Box>
      </Tooltip>
    );
  };

  const renderPasilloCell = (tipo: "P1" | "P2" | "PARED", rowIndex: number) => {
    const isHeaderRow = rowIndex === 0;

    if (tipo === "PARED") {
      return (
        <Box
          key={`pared-${rowIndex}`}
          sx={{
            width: 32,
            height: 46,
            borderRadius: 1,
            bgcolor: "#e5e7eb",
            border: "1px solid #d1d5db",
          }}
        />
      );
    }

    const label = tipo === "P1" ? "Pasillo 1" : "Pasillo 2";

    return (
      <Box
        key={`${tipo}-${rowIndex}`}
        sx={{
          width: 46,
          height: 46,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isHeaderRow ? (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            {label}
          </Typography>
        ) : (
          <Box
            sx={{
              width: "50%",
              height: "80%",
              borderRadius: 999,
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "#cbd5f5",
            }}
          />
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          bgcolor: "#f8fafc",
          borderRadius: 3,
          border: "2px dashed #e2e8f0",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Cargando mapa de stands...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          bgcolor: "#fef2f2",
          borderRadius: 3,
          border: "2px dashed #fee2e2",
        }}
      >
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (stands.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          bgcolor: "#f8fafc",
          borderRadius: 3,
          border: "2px dashed #e2e8f0",
        }}
      >
        <InfoOutlinedIcon
          sx={{ fontSize: 40, mb: 1, color: "action.disabled" }}
        />
        <Typography variant="body2" color="text.secondary">
          No hay stands registrados en este bloque por el momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, auto)",
        gap: 1.5,
        justifyContent: "center",
        py: 2,
      }}
    >
      {Array.from({ length: maxFilas }).map((_, rowIndex) => {
        const col0 = columnas[0][rowIndex];
        const col1 = columnas[1][rowIndex];
        const col2 = columnas[2][rowIndex];
        const col3 = columnas[3][rowIndex];

        return (
          <Fragment key={`row-${rowIndex}`}>
            {renderStandCell(col0, 1, 0, rowIndex)}
            {renderPasilloCell("P1", rowIndex)}
            {renderStandCell(col1, 1, 1, rowIndex)}
            {renderPasilloCell("PARED", rowIndex)}
            {renderStandCell(col2, 2, 2, rowIndex)}
            {renderPasilloCell("P2", rowIndex)}
            {renderStandCell(col3, 2, 3, rowIndex)}
          </Fragment>
        );
      })}
    </Box>
  );
}