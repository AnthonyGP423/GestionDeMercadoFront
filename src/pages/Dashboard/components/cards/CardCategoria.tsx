// src/components/cards/CardCategoria.tsx

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircleIcon from "@mui/icons-material/Circle";
import type { EstadoCategoria } from "../../../../api/categoriaStandApi";

export type CardCategoriaProps = {
  nombre: string;
  descripcion: string;
  estado: EstadoCategoria;
  colorHex?: string | null;
  iconoUrl?: string | null;
  onToggleEstado: (nuevoEstado: EstadoCategoria) => void | Promise<void>;
  onEdit: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

const CardCategoria: React.FC<CardCategoriaProps> = ({
  nombre,
  descripcion,
  estado,
  colorHex,
  iconoUrl,
  onToggleEstado,
  onEdit,
  onDelete,
}) => {
  const esActivo = estado === "Activo";

  const handleToggle = () => {
    onToggleEstado(esActivo ? "Inactivo" : "Activo");
  };

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        p: 2.5,
      }}
    >
      {/* Icono + nombre */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* 🔥 Avatar mejorado con tipografía premium y tamaño uniforme */}
<Box
  sx={{
    width: 64,
    height: 64,
    borderRadius: 2.5,
    bgcolor: colorHex || "#4F46E5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontFamily: `"Poppins", "Inter", sans-serif`,
    fontWeight: 800,
    fontSize: "1.3rem",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    userSelect: "none",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)", // 🟦 Sombra suave profesional
  }}
>
  {nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .substring(0, 2)}
</Box>

        <Box>
          <Typography variant="h6" fontWeight={700}>
            {nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descripcion}
          </Typography>
        </Box>
      </Stack>

      <CardContent sx={{ px: 0, pt: 2, pb: 0, flexGrow: 1 }} />

      {/* Estado + acciones */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <CircleIcon
            sx={{
              fontSize: 10,
              color: esActivo ? "success.main" : "error.main",
            }}
          />
          <Chip
            label={esActivo ? "Activo" : "Inactivo"}
            size="small"
            onClick={handleToggle}
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              cursor: "pointer",
              bgcolor: esActivo
                ? "rgba(22,163,74,0.12)"
                : "rgba(239,68,68,0.08)",
              color: esActivo ? "success.main" : "error.main",
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

export default CardCategoria;