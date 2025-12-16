import { Paper, Typography, Chip, IconButton, Switch } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleEstado?: (nuevoEstado: "Activo" | "Inactivo") => void;
}

export default function CardCategoria({
  nombre,
  descripcion,
  estado,
  onEdit,
  onDelete,
  onToggleEstado,
}: Props) {
  const handleSwitch = (e: any) => {
    const nuevo = e.target.checked ? "Activo" : "Inactivo";
    onToggleEstado?.(nuevo);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        transition: "0.2s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      {/* NOMBRE */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        {nombre}
      </Typography>

      {/* DESCRIPCIÓN */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {descripcion}
      </Typography>

      {/* ESTADO */}
      <Chip
        label={estado}
        color={estado === "Activo" ? "success" : "error"}
        size="small"
        sx={{ mr: 1 }}
      />

      {/* SWITCH */}
      <Switch
        checked={estado === "Activo"}
        onChange={handleSwitch}
        color="success"
      />

      {/* ACCIONES */}
      <IconButton size="small" onClick={onEdit}>
        <EditIcon />
      </IconButton>

      <IconButton size="small" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}
