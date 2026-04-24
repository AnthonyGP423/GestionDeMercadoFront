// src/features/store/pages/MapaStand.tsx
import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import MapIcon from "@mui/icons-material/Map";
import GridViewIcon from "@mui/icons-material/GridView";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import StandDetailsPanel from "../../../features/store/mapa/StandDetailsPanel";
import LegendMapa from "../../../features/store/mapa/LegendMapa";
import MapaGrid from "../components/mapa/MapaGrid";
import { useMapaMercado } from "../hooks/useMapaMercado";

export default function MapaMercado() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    bloqueActual,
    bloquesDisponibles,
    standsBloque,
    standSeleccionado,

    loadingBloques,
    errorBloques,

    loadingStands,
    errorStands,

    setBloqueActual,
    seleccionarStandBase,
  } = useMapaMercado();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleVerPerfil = () => {
    if (!standSeleccionado) return;
    navigate(`/tienda/stand/${standSeleccionado.id}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 50%, #ffffff 100%)",
      }}
    >
      <PublicHeader />

      {/* HERO / TITULO */}
      <Box
        sx={{
          pt: { xs: 4, md: 6 },
          pb: { xs: 2, md: 4 },
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign={{ xs: "center", md: "left" }} mb={2}>
            <Chip
              label="Navegación Interactiva"
              color="success"
              size="small"
              sx={{
                mb: 1.5,
                fontWeight: 700,
                bgcolor: "#dcfce7",
                color: "#166534",
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontFamily: '"Inter", sans-serif',
                color: "#0f172a",
                mb: 1,
                fontSize: { xs: "2rem", md: "3rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Mapa del Mercado
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              maxWidth={700}
              sx={{ mx: { xs: "auto", md: 0 }, fontSize: "1.1rem" }}
            >
              Selecciona un bloque para ver la distribución de los puestos. Haz
              clic en cualquier stand para ver información detallada y
              productos.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Container maxWidth="xl" sx={{ pb: 8, flex: 1 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems="flex-start"
        >
          {/* COLUMNA IZQUIERDA: CONTROLES + MAPA */}
          <Box sx={{ flex: { lg: 3 }, width: "100%", minWidth: 0 }}>
            {/* SELECTOR DE BLOQUES */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                mb: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                mb={2}
                gap={1}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 800,
                      color: "#16a34a",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ZONAS DEL MERCADO
                  </Typography>
                  <Typography variant="h6" fontWeight={800} lineHeight={1}>
                    Selecciona un bloque
                  </Typography>
                </Box>

                <Tooltip title="Recargar bloques">
                  <IconButton size="small" disabled={loadingBloques}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {loadingBloques ? (
                <Box py={2}>
                  <Typography variant="body2" color="text.secondary">
                    Cargando estructura del mercado...
                  </Typography>
                </Box>
              ) : errorBloques ? (
                <Typography variant="body2" color="error" py={2}>
                  {errorBloques}
                </Typography>
              ) : bloquesDisponibles.length === 0 ? (
                <Typography variant="body2" color="text.secondary" py={2}>
                  No hay bloques disponibles.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    pb: 1,
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "#cbd5e1",
                      borderRadius: 4,
                    },
                  }}
                >
                  {bloquesDisponibles.map((b) => {
                    const activo = bloqueActual === b.bloque;
                    return (
                      <Button
                        key={b.bloque}
                        onClick={() => setBloqueActual(b.bloque)}
                        variant="contained"
                        sx={{
                          borderRadius: 3,
                          px: 2.5,
                          py: 1,
                          minWidth: "fit-content",
                          textTransform: "none",
                          boxShadow: "none",
                          border: "2px solid",
                          borderColor: activo ? "transparent" : "#e2e8f0",
                          bgcolor: activo ? "#16a34a" : "#ffffff",
                          color: activo ? "#ffffff" : "#64748b",
                          "&:hover": {
                            bgcolor: activo ? "#15803d" : "#f8fafc",
                            borderColor: activo ? "transparent" : "#cbd5e1",
                            boxShadow: "none",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Stack alignItems="start" spacing={0}>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            lineHeight={1.2}
                          >
                            Bloque {b.bloque}
                          </Typography>
                          {typeof b.totalStands === "number" && (
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.9,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              {b.totalStands} puestos
                            </Typography>
                          )}
                        </Stack>
                      </Button>
                    );
                  })}
                </Box>
              )}
            </Paper>

            {/* VISOR DEL MAPA */}
            <Fade in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  p: 0,
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                }}
              >
                {/* Header del Mapa */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#fff",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GridViewIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={800}>
                      Croquis: Bloque {bloqueActual || "?"}
                    </Typography>
                  </Stack>

                  <Tooltip title="Usa el mouse o toca para navegar">
                    <InfoOutlinedIcon fontSize="small" color="disabled" />
                  </Tooltip>
                </Box>

                {/* LEYENDA ARRIBA */}
                <Box
                  sx={{
                    px: 3,
                    pt: 2,
                    pb: 1,
                    borderBottom: "1px solid #f1f5f9",
                    bgcolor: "#ffffff",
                  }}
                >
                  <LegendMapa />
                </Box>

                {/* Grid del Mapa - MÁS BAJO */}
                <Box
                  sx={{
                    p: { xs: 2, md: 3 },
                    minHeight: { xs: 240, md: 300 }, // antes 400
                    maxHeight: { xs: 320, md: 360 }, // límite para que no se alargue tanto
                    bgcolor: "#f8fafc",
                    overflow: "auto", // si el contenido es grande, que haga scroll interno
                  }}
                >
                  <MapaGrid
                    stands={standsBloque}
                    standSeleccionado={standSeleccionado}
                    loading={loadingStands}
                    error={errorStands}
                    onSelectStand={seleccionarStandBase}
                  />
                </Box>
              </Paper>
            </Fade>
          </Box>

          {/* COLUMNA DERECHA: DETALLES */}
          <Box
            sx={{
              flex: { lg: 1.2 },
              width: "100%",
              minWidth: { lg: 350 },
            }}
          >
            <Box
              sx={{
                position: { lg: "sticky" },
                top: { lg: 100 },
                transition: "all 0.3s ease",
              }}
            >
              <StandDetailsPanel
                stand={standSeleccionado}
                onVerPerfil={handleVerPerfil}
              />

              {!standSeleccionado && !isMobile && (
                <Fade in>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 3,
                      textAlign: "center",
                      bgcolor: "transparent",
                      border: "2px dashed #e2e8f0",
                      borderRadius: 4,
                    }}
                  >
                    <MapIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Selecciona un cuadro en el mapa para ver los detalles
                      aquí.
                    </Typography>
                  </Paper>
                </Fade>
              )}
            </Box>
          </Box>
        </Stack>
      </Container>

      <PublicFooter />
    </Box>
  );
}
