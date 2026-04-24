// src/features/store/components/mapa/LegendMapa.tsx
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import BlockIcon from "@mui/icons-material/Block";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PaletteIcon from "@mui/icons-material/Palette";

export default function LegendMapa() {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2.5,
        p: 2,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontWeight: 800, letterSpacing: 0.9 }}
          >
            LEYENDA DEL MAPA
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mt: 0.25 }}>
            Los stands <b>ABIERTO</b> usan el color de su categoría.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<CheckCircleIcon />}
            label="ABIERTO"
            size="small"
            sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 900, borderRadius: 999 }}
          />
          <Chip
            icon={<PauseCircleIcon />}
            label="CERRADO"
            size="small"
            sx={{ bgcolor: "#ffedd5", color: "#9a3412", fontWeight: 900, borderRadius: 999 }}
          />
          <Chip
            icon={<BlockIcon />}
            label="CLAUSURADO"
            size="small"
            sx={{ bgcolor: "#ffe4e6", color: "#9f1239", fontWeight: 900, borderRadius: 999 }}
          />
          <Chip
            icon={<HomeWorkIcon />}
            label="DISPONIBLE"
            size="small"
            sx={{ bgcolor: "#f1f5f9", color: "#0f172a", fontWeight: 900, borderRadius: 999 }}
          />
          <Chip
            icon={<PaletteIcon />}
            label="COLOR = CATEGORÍA"
            size="small"
            sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 900, borderRadius: 999 }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}