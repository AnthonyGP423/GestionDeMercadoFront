// src/components/mapa/LegendMapa.tsx
import { Box, Stack, Typography } from "@mui/material";

export default function LegendMapa() {
  return (
    <Stack
      direction="row"
      spacing={3}
      mt={3}
      justifyContent="center"
      sx={{ opacity: 0.8 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "success.main",
          }}
        />
        <Typography variant="caption" fontWeight={600}>
          Disponible
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "grey.500",
          }}
        />
        <Typography variant="caption" fontWeight={600}>
          Ocupado
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: (theme) => `2px solid ${theme.palette.success.main}`, // 🔹 borde verde
          }}
        />
        <Typography variant="caption" fontWeight={600}>
          Seleccionado
        </Typography>
      </Stack>
    </Stack>
  );
}
