// src/components/mapa/StandCard.tsx
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

type StandCardProps = {
  stand: Stand;
  selected: boolean;
  onSelect: () => void;
};

export default function StandCard({
  stand,
  selected,
  onSelect,
}: StandCardProps) {
  const theme = useTheme();
  const disponible = stand.estado === "DISPONIBLE";

  return (
    <Tooltip
      title={disponible ? "Disponible para alquiler" : stand.nombreComercial}
      arrow
    >
      <Paper
        onClick={onSelect}
        elevation={selected ? 4 : 0}
        sx={{
          cursor: "pointer",
          borderRadius: 3,
          p: 2,
          border: "2px solid",
          borderColor: selected
            ? theme.palette.success.main // 🔹 verde al seleccionar
            : disponible
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.grey[400], 0.3),
          bgcolor: selected
            ? alpha(theme.palette.success.main, 0.06) // 🔹 fondo verdoso al seleccionar
            : disponible
            ? alpha(theme.palette.success.main, 0.05)
            : "#fff",
          transition: "all 0.2s",
          "&:hover": {
            transform: "translateY(-3px)",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              color={selected ? "success.main" : "text.primary"} // 🔹 número en verde si está seleccionado
            >
              {stand.numero}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                textTransform: "uppercase",
                color: disponible ? "success.main" : "text.secondary",
              }}
            >
              {disponible ? "Disponible" : "Ocupado"}
            </Typography>
          </Box>
          {disponible ? (
            <CheckCircleIcon color="success" />
          ) : (
            <StorefrontIcon color={selected ? "success" : "action"} /> // 🔹 icono verde si está seleccionado
          )}
        </Stack>
      </Paper>
    </Tooltip>
  );
}
