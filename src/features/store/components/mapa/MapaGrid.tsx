// src/features/store/components/mapa/MapaGrid.tsx
import { Fragment, useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { Pasillo, StandBase, StandMapa, StandEstado } from "../../types/mapa.types";

type Props = {
  stands: StandBase[];
  standSeleccionado: StandMapa | null;
  loading: boolean;
  error: string | null;
  onSelectStand: (stand: StandBase, pasillo: Pasillo, rowIndex: number) => void;
};

function isHexColor(value: any) {
  const s = String(value ?? "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(s);
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getStandPalette(stand: StandBase) {
  const estado = stand.estado as StandEstado;

  // ✅ prioridad por estado:
  if (estado === "CLAUSURADO") {
    return {
      bg: "#fda4af",
      fg: "#881337",
      border: "#fb7185",
      soft: "rgba(225,29,72,0.14)",
    };
  }
  if (estado === "CERRADO") {
    return {
      bg: "#fdba74",
      fg: "#7c2d12",
      border: "#fb923c",
      soft: "rgba(234,88,12,0.14)",
    };
  }
  if (estado === "DISPONIBLE") {
    return {
      bg: "#e5e7eb",
      fg: "#374151",
      border: "#d1d5db",
      soft: "rgba(15,23,42,0.08)",
    };
  }

  // ✅ ABIERTO: color de categoría si viene
  const catHex = isHexColor((stand as any).categoriaColorHex)
    ? String((stand as any).categoriaColorHex)
    : "#16a34a";

  return {
    bg: catHex,
    fg: "#ffffff",
    border: hexToRgba(catHex, 0.55),
    soft: hexToRgba(catHex, 0.18),
  };
}

function getShortNumber(numeroStand: string) {
  // Si viene "A-101" o "101" o "101-1" etc.
  const raw = String(numeroStand ?? "").trim();
  if (!raw) return "—";
  const parts = raw.split("-");
  return parts[parts.length - 1] || raw;
}

export default function MapaGrid({
  stands,
  standSeleccionado,
  loading,
  error,
  onSelectStand,
}: Props) {
  // === DISTRIBUCIÓN: 4 columnas de stands (2 pasillos + pared central)
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

    const selected = Number(standSeleccionado?.id) === Number(stand.id);
    const pal = getStandPalette(stand);

    return (
      <Tooltip
        key={stand.id}
        title={`${stand.numeroStand} · ${stand.nombreComercial}`}
        arrow
      >
        <Box
          onClick={() => onSelectStand(stand, pasillo, rowIndex)}
          sx={{
            width: 54,
            height: 54,
            borderRadius: 2,
            bgcolor: pal.bg,
            color: pal.fg,
            fontSize: 14,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",

            // menos saturado: sombra suave y consistente
            boxShadow: selected
              ? `0 0 0 2px #0ea5e9, 0 14px 28px rgba(15,23,42,0.18)`
              : `0 10px 22px rgba(15,23,42,0.12)`,

            transform: selected ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.18s ease",

            // borde sutil (se nota en ABIERTO con cat color)
            outline: selected ? "none" : `1px solid ${pal.border}`,

            "&:hover": {
              boxShadow: `0 0 0 2px #0ea5e9, 0 16px 32px rgba(15,23,42,0.20)`,
              transform: "translateY(-3px)",
            },

            // pequeño brillo (muy suave)
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              inset: -6,
              borderRadius: 3,
              background: pal.soft,
              filter: "blur(10px)",
              opacity: selected ? 0.6 : 0.35,
              zIndex: -1,
            },
          }}
        >
          {getShortNumber(stand.numeroStand)}
        </Box>
      </Tooltip>
    );
  };

  const renderPasilloCell = (tipo: "P1" | "P2" | "PARED", rowIndex: number) => {
    const isHeaderRow = rowIndex === 0;

    // pared central (bloques grises como la imagen)
    if (tipo === "PARED") {
      return (
        <Box
          key={`pared-${rowIndex}`}
          sx={{
            width: 38,
            height: 54,
            borderRadius: 2,
            bgcolor: "#e5e7eb",
            border: "1px solid #d1d5db",
          }}
        />
      );
    }

    const label = tipo === "P1" ? "Pasillo\n1" : "Pasillo\n2";

    return (
      <Box
        key={`${tipo}-${rowIndex}`}
        sx={{
          width: 54,
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isHeaderRow ? (
          <Typography
            variant="caption"
            sx={{
              fontSize: 12,
              color: "#64748b",
              fontWeight: 800,
              lineHeight: 1.05,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {label}
          </Typography>
        ) : (
          // círculo punteado como el croquis (no “pastilla”)
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 999,
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "#c7d2fe",
              opacity: 0.9,
              bgcolor: "transparent",
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
          borderRadius: 4,
          border: "2px dashed #e2e8f0",
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
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
          borderRadius: 4,
          border: "2px dashed #fee2e2",
        }}
      >
        <Typography variant="body2" color="error" fontWeight={800}>
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
          borderRadius: 4,
          border: "2px dashed #e2e8f0",
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 40, mb: 1, color: "action.disabled" }} />
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          No hay stands registrados en este bloque por el momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        // “escenario” del croquis
        bgcolor: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      {/* contenedor central, como en tu screenshot */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, auto)",
          gap: 1.6,
          justifyContent: "center",
          py: 2,
          px: 1,
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
    </Box>
  );
}
