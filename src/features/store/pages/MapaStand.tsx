// src/features/store/pages/MapaStand.tsx
import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import MapIcon from "@mui/icons-material/Map";
import GridViewIcon from "@mui/icons-material/GridView";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import StandDetailsPanel from "../../../features/store/mapa/StandDetailsPanel";
import LegendMapa from "../../../features/store/mapa//LegendMapa";

import MapaGrid from "../components/mapa/MapaGrid";
import { useMapaMercado } from "../hooks/useMapaMercado";

export default function MapaMercado() {
  const navigate = useNavigate();

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
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mt: 0.5 }}
                  >
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
                        onClick={() => setBloqueActual(b.bloque)}
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

              <MapaGrid
                stands={standsBloque}
                standSeleccionado={standSeleccionado}
                loading={loadingStands}
                error={errorStands}
                onSelectStand={seleccionarStandBase}
              />

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