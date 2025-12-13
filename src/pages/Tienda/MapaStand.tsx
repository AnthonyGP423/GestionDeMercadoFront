// src/pages/store/MapaMercado.tsx
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import MapIcon from "@mui/icons-material/Map";
import GridViewIcon from "@mui/icons-material/GridView";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

import StandCard from "../../components/cards/CardStand";
import StandDetailsPanel from "../../components/layout/mapa/StandDetailsPanel";
import LegendMapa from "../../components/layout/mapa/LegendMapa";

type Bloque = "A" | "B" | "C" | "D";
type Pasillo = 1 | 2;
type StandEstado = "OCUPADO" | "DISPONIBLE";

type Stand = {
  id: number;
  bloque: Bloque;
  pasillo: Pasillo;
  orden: number;
  numero: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;
};

// Mock de stands (luego lo puedes traer del backend)
const STANDS: Stand[] = [
  {
    id: 1,
    bloque: "A",
    pasillo: 1,
    orden: 1,
    numero: "A-01",
    nombreComercial: "Frutas del Sol",
    rubro: "Frutas",
    estado: "OCUPADO",
  },
  {
    id: 2,
    bloque: "A",
    pasillo: 1,
    orden: 2,
    numero: "A-02",
    nombreComercial: "Verduras Anita",
    rubro: "Verduras",
    estado: "OCUPADO",
  },
  {
    id: 3,
    bloque: "A",
    pasillo: 2,
    orden: 1,
    numero: "A-03",
    nombreComercial: "Disponible A-03",
    rubro: "---",
    estado: "DISPONIBLE",
  },
  {
    id: 4,
    bloque: "A",
    pasillo: 2,
    orden: 2,
    numero: "A-04",
    nombreComercial: "Disponible A-04",
    rubro: "---",
    estado: "DISPONIBLE",
  },
  {
    id: 5,
    bloque: "B",
    pasillo: 1,
    orden: 1,
    numero: "B-01",
    nombreComercial: "Carnes El Ganadero",
    rubro: "Carnes",
    estado: "OCUPADO",
  },
  {
    id: 6,
    bloque: "B",
    pasillo: 1,
    orden: 2,
    numero: "B-02",
    nombreComercial: "Pollos Central",
    rubro: "Aves",
    estado: "OCUPADO",
  },
];

export default function MapaMercado() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialBlockFromState = (location.state as any)?.initialBlock as
    | Bloque
    | undefined;

  const [bloqueActual, setBloqueActual] = useState<Bloque>(
    initialBlockFromState || "A" // si no viene nada, por defecto A
  );
  const [pasilloActual, setPasilloActual] = useState<Pasillo>(1);
  const [standSeleccionado, setStandSeleccionado] = useState<Stand | null>(
    null
  );

  const standsDelBloque = useMemo(
    () => STANDS.filter((s) => s.bloque === bloqueActual),
    [bloqueActual]
  );

  const standsDelPasillo = useMemo(
    () =>
      standsDelBloque
        .filter((s) => s.pasillo === pasilloActual)
        .sort((a, b) => a.orden - b.orden),
    [standsDelBloque, pasilloActual]
  );

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
        {/* Título */}
        <Box mb={5} textAlign={{ xs: "center", md: "left" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            justifyContent={{ xs: "center", md: "flex-start" }}
            mb={1}
          >
            <MapIcon color="success" fontSize="large" />
            <Typography variant="h4" fontWeight={800}>
              Mapa del Mercado
            </Typography>
          </Stack>
          <Typography color="text.secondary" maxWidth={600}>
            Navega por nuestros bloques y pasillos para encontrar la ubicación
            exacta de tus stands favoritos.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="flex-start"
        >
          {/* IZQUIERDA: controles + mapa */}
          <Box sx={{ flex: 2 }}>
            {/* Bloques */}
            <Paper
              sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
                mb={1}
              >
                SELECCIONA UN BLOQUE:
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {(["A", "B", "C", "D"] as Bloque[]).map((b) => (
                  <Button
                    key={b}
                    variant={bloqueActual === b ? "contained" : "outlined"}
                    onClick={() => {
                      setBloqueActual(b);
                      setPasilloActual(1);
                      setStandSeleccionado(null);
                    }}
                    sx={{ borderRadius: 2, minWidth: 60, fontWeight: 800 }}
                    color="success"
                  >
                    {b}
                  </Button>
                ))}
              </Stack>
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
                  <GridViewIcon color="action" /> Bloque {bloqueActual}
                </Typography>

                <Tabs
                  value={pasilloActual}
                  onChange={(_, value) => {
                    setPasilloActual(value);
                    setStandSeleccionado(null);
                  }}
                >
                  <Tab value={1} label="Pasillo 1" />
                  <Tab value={2} label="Pasillo 2" />
                </Tabs>
              </Stack>

              {standsDelPasillo.length === 0 ? (
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
                    No hay stands registrados en este pasillo.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  {standsDelPasillo.map((s) => (
                    <StandCard
                      key={s.id}
                      stand={s}
                      selected={standSeleccionado?.id === s.id}
                      onSelect={() => setStandSeleccionado(s)}
                    />
                  ))}
                </Box>
              )}

              <LegendMapa />
            </Paper>
          </Box>

          {/* DERECHA: panel detalles */}
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
