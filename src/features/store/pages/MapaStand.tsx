// src/pages/tienda/MapaStand.tsx
import { useEffect, useMemo, useState, Fragment } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
  Tooltip,
  Chip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import MapIcon from "@mui/icons-material/Map";
import GridViewIcon from "@mui/icons-material/GridView";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import StandDetailsPanel from "../mapa/StandDetailsPanel";
import LegendMapa from "../mapa/LegendMapa";

// Bloque dinámico
type Bloque = string;
type Pasillo = 1 | 2;

// Estados alineados con backend / panel
type StandEstado = "ABIERTO" | "CERRADO" | "CLAUSURADO" | "DISPONIBLE";

type StandBase = {
  id: number;
  bloque: Bloque;
  numeroStand: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;
};

// Tipo usado en el mapa
type StandMapa = StandBase & {
  pasillo?: Pasillo;
  orden?: number;
  numero: string; // alias para StandDetailsPanel
};

// Resumen de bloques desde backend
interface BloqueResumen {
  bloque: Bloque;
  totalStands?: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function MapaMercado() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialBlockFromState = (location.state as any)?.initialBlock as
    | Bloque
    | undefined;

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

  const [loading, setLoading] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [loadingBloques, setLoadingBloques] = useState(false);
  const [errorBloques, setErrorBloques] = useState<string | null>(null);

  // === CARGA INICIAL DE BLOQUES (dinámico) ===
  useEffect(() => {
    const fetchBloques = async () => {
      try {
        setLoadingBloques(true);
        setErrorBloques(null);

        const resp = await fetch(
          `${API_BASE_URL}/api/public/stands/mapa/bloques`
        );

        if (!resp.ok) {
          throw new Error(`Error al cargar bloques (HTTP ${resp.status})`);
        }

        const data: any[] = await resp.json();

        const mapped: BloqueResumen[] = data.map((b) => ({
          bloque: String(b.bloque),
          totalStands:
            typeof b.totalStands === "number" ? b.totalStands : undefined,
        }));

        setBloquesDisponibles(mapped);

        if (mapped.length > 0) {
          const existeInitial =
            initialBlockFromState &&
            mapped.some(
              (x) =>
                String(x.bloque).toUpperCase() ===
                String(initialBlockFromState).toUpperCase()
            );

          if (existeInitial) {
            setBloqueActual(String(initialBlockFromState).toUpperCase());
          } else if (!bloqueActual) {
            setBloqueActual(mapped[0].bloque);
          }
        }
      } catch (e: any) {
        console.error(e);
        setErrorBloques("No se pudieron cargar los bloques del mercado.");
      } finally {
        setLoadingBloques(false);
      }
    };

    fetchBloques();
  }, []);

  // === CARGA DE STANDS POR BLOQUE ===
  useEffect(() => {
    if (!bloqueActual) return;

    const fetchStands = async () => {
      try {
        setLoading(true);
        setErrorCarga(null);

        const resp = await fetch(
          `${API_BASE_URL}/api/public/stands/mapa?bloque=${bloqueActual}`
        );

        if (!resp.ok) {
          throw new Error(`Error al cargar stands (HTTP ${resp.status})`);
        }

        const data: any[] = await resp.json();

        const mapped: StandBase[] = data.map((dto) => {
          const estadoRaw: string = dto.estado ?? "DISPONIBLE";
          const estadoUpper = estadoRaw.toUpperCase() as StandEstado;

          return {
            id: dto.id,
            bloque: dto.bloque as Bloque,
            numeroStand: dto.numeroStand,
            nombreComercial: dto.nombreComercial,
            rubro: dto.rubro ?? dto.nombreCategoriaStand ?? "---",
            estado: estadoUpper,
          };
        });

        setStandsBloque(mapped);
        setStandSeleccionado(null);
      } catch (e: any) {
        console.error(e);
        setErrorCarga("No se pudo cargar el mapa de stands.");
      } finally {
        setLoading(false);
      }
    };

    fetchStands();
  }, [bloqueActual]);

  // === DISTRIBUCIÓN EN 4 COLUMNAS ===
  const columnas = useMemo(() => {
    const cols: StandBase[][] = [[], [], [], []];

    standsBloque
      .slice()
      .sort((a, b) => a.numeroStand.localeCompare(b.numeroStand))
      .forEach((stand, idx) => {
        const colIndex = idx % 4;
        cols[colIndex].push(stand);
      });

    return cols;
  }, [standsBloque]);

  const maxFilas = useMemo(
    () => Math.max(...columnas.map((c) => c.length), 0),
    [columnas]
  );

  const handleVerPerfil = () => {
    if (!standSeleccionado) return;
    navigate(`/tienda/stand/${standSeleccionado.id}`);
  };

  // Stand cell
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

    const standMapa: StandMapa = {
      ...stand,
      pasillo,
      orden: rowIndex + 1,
      numero: stand.numeroStand,
    };

    return (
      <Tooltip
        key={stand.id}
        title={`${stand.numeroStand} · ${stand.nombreComercial}`}
        arrow
      >
        <Box
          onClick={() => setStandSeleccionado(standMapa)}
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

  // Pasillo / pared
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        <Box mb={5} textAlign={{ xs: "center", md: "left" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontFamily:
                '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
              mb: 1,
            }}
          >
            Mapa del Mercado Mayorista
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            maxWidth={620}
            sx={{ mx: { xs: "auto", md: 0 } }}
          >
            Explora el mapa interactivo para encontrar puestos por bloque,
            pasillo y rubro. Haz clic sobre cualquier stand para ver sus
            detalles.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="flex-start"
        >
          {/* IZQUIERDA */}
          <Box sx={{ flex: 2 }}>
            {/* Bloques dinámicos */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                background:
                  "linear-gradient(135deg, #ecfdf3 0%, #f1f5f9 40%, #ffffff 100%)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
                gap={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: 1.2, color: "#16a34a" }}
                  >
                    SELECCIONA UN BLOQUE
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    Distribución de stands por zona
                  </Typography>
                </Box>

                <Chip
                  icon={<MapIcon sx={{ fontSize: 18 }} />}
                  label="Vista pública"
                  size="small"
                  sx={{
                    bgcolor: "#dcfce7",
                    color: "#166534",
                    fontWeight: 600,
                    borderRadius: 999,
                  }}
                />
              </Stack>

              {loadingBloques ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando bloques...
                </Typography>
              ) : errorBloques ? (
                <Typography variant="body2" color="error">
                  {errorBloques}
                </Typography>
              ) : bloquesDisponibles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay bloques configurados por el momento.
                </Typography>
              ) : (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" mt={1}>
                  {bloquesDisponibles.map((b) => {
                    const activo = bloqueActual === b.bloque;
                    return (
                      <Button
                        key={b.bloque}
                        onClick={() => {
                          setBloqueActual(b.bloque);
                          setStandSeleccionado(null);
                        }}
                        sx={{
                          borderRadius: 999,
                          px: 2.5,
                          py: 0.9,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 14,
                          borderWidth: 2,
                          borderStyle: "solid",
                          borderColor: activo ? "#16a34a" : "#cbd5e1",
                          bgcolor: activo ? "#16a34a" : "#f8fafc",
                          color: activo ? "#ffffff" : "#0f172a",
                          boxShadow: activo
                            ? "0 10px 24px rgba(22, 163, 74, 0.35)"
                            : "none",
                          "&:hover": {
                            bgcolor: activo ? "#15803d" : "#e2e8f0",
                            borderColor: "#16a34a",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          <span>Bloque {b.bloque}</span>
                          {typeof b.totalStands === "number" && (
                            <Chip
                              label={`${b.totalStands} puestos`}
                              size="small"
                              sx={{
                                bgcolor: activo ? "#bbf7d0" : "#e5e7eb",
                                color: "#065f46",
                                fontWeight: 600,
                                borderRadius: 999,
                              }}
                            />
                          )}
                        </Stack>
                      </Button>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            {/* Mapa */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                bgcolor: "#fff",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexWrap="wrap"
                gap={2}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <GridViewIcon color="action" /> Croquis bloque{" "}
                  {bloqueActual || "-"}
                </Typography>

                <Tabs value={0} aria-label="vista fija">
                  <Tab label="Vista general" />
                </Tabs>
              </Stack>

              {loading ? (
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
              ) : errorCarga ? (
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
                    {errorCarga}
                  </Typography>
                </Box>
              ) : standsBloque.length === 0 ? (
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
              ) : (
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
              )}

              <LegendMapa />
            </Paper>
          </Box>

          {/* DERECHA */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <StandDetailsPanel
              stand={standSeleccionado}
              onVerPerfil={handleVerPerfil}
            />
          </Box>
        </Stack>
      </Container>

      <PublicFooter />
    </Box>
  );
}