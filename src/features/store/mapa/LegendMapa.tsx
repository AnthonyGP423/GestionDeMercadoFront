// src/features/store/components/mapa/LegendMapa.tsx
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import BlockIcon from "@mui/icons-material/Block";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

export default function LegendMapa() {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2.5,
        p: 1.75,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.8 }}
        >
          LEYENDA DEL MAPA
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<CheckCircleIcon />}
            label="ABIERTO"
            size="small"
            sx={{
              bgcolor: "#dcfce7",
              color: "#166534",
              fontWeight: 800,
              borderRadius: 999,
            }}
          />
          <Chip
            icon={<PauseCircleIcon />}
            label="CERRADO"
            size="small"
            sx={{
              bgcolor: "#ffedd5",
              color: "#9a3412",
              fontWeight: 800,
              borderRadius: 999,
            }}
          />
          <Chip
            icon={<BlockIcon />}
            label="CLAUSURADO"
            size="small"
            sx={{
              bgcolor: "#ffe4e6",
              color: "#9f1239",
              fontWeight: 800,
              borderRadius: 999,
            }}
          />
          <Chip
            icon={<HomeWorkIcon />}
            label="DISPONIBLE"
            size="small"
            sx={{
              bgcolor: "#f1f5f9",
              color: "#0f172a",
              fontWeight: 800,
              borderRadius: 999,
            }}
          />

          {/* Opcional: seleccionado */}
          <Chip
            icon={<RadioButtonCheckedIcon />}
            label="SELECCIONADO"
            size="small"
            sx={{
              bgcolor: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 800,
              borderRadius: 999,
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}