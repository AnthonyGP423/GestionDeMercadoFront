// src/components/mapa/StandDetailsPanel.tsx
import { Box, Paper, Typography, Chip, Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type StandEstado = "OCUPADO" | "DISPONIBLE";

type Stand = {
  id: number;
  bloque: "A" | "B" | "C" | "D";
  pasillo: 1 | 2;
  orden: number;
  numero: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;
};

type StandDetailsPanelProps = {
  stand: Stand | null;
  onVerPerfil: () => void;
};

export default function StandDetailsPanel({
  stand,
  onVerPerfil,
}: StandDetailsPanelProps) {
  if (!stand) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <MapIcon sx={{ fontSize: 50, mb: 1, color: "success.main" }} />{" "}
        {/* 🔹 icono verde */}
        <Typography variant="h6" fontWeight={700}>
          Ningún stand seleccionado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Haz clic en un cuadro del mapa para ver los detalles del negocio.
        </Typography>
      </Paper>
    );
  }

  const ocupado = stand.estado === "OCUPADO";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box>
        <Chip
          label={ocupado ? "En funcionamiento" : "Espacio libre"}
          color={ocupado ? "default" : "success"}
          size="small"
          sx={{ mb: 1, fontWeight: 700 }}
        />
        <Typography variant="h4" fontWeight={800}>
          {stand.numero}
        </Typography>
        <Typography
          variant="subtitle1"
          color="success.main" // 🔹 subtítulo verde
          fontWeight={600}
        >
          Bloque {stand.bloque}, Pasillo {stand.pasillo}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          textTransform="uppercase"
        >
          Nombre Comercial
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {stand.nombreComercial}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          textTransform="uppercase"
          display="block"
          mt={2}
        >
          Rubro / Categoría
        </Typography>
        <Chip label={stand.rubro} size="small" sx={{ mt: 0.5 }} />
      </Box>

      <Button
        variant={ocupado ? "contained" : "outlined"}
        color="success" // 🔹 botón principal en verde
        fullWidth
        size="large"
        endIcon={ocupado ? <ArrowForwardIcon /> : undefined}
        onClick={ocupado ? onVerPerfil : undefined}
        sx={{ mt: "auto", borderRadius: 2, fontWeight: 700 }}
      >
        {ocupado ? "Ver perfil del stand" : "Solicitar alquiler"}
      </Button>
    </Paper>
  );
}
