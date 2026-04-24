import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { IncidenciaResponseDto } from "../../../api/admin/incidenciasAdminApi";
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  incidencia: IncidenciaResponseDto | null;
  onSubmit: (nuevoEstado: string) => void;
}

const opcionesEstado = [
  { value: "ABIERTA", label: "ABIERTA" },
  { value: "EN_PROCESO", label: "EN_PROCESO" },
  { value: "RESUELTA", label: "RESUELTA" },
  { value: "CERRADA", label: "CERRADA" },
];

export default function IncidenciaEstadoDialog({
  open,
  onClose,
  incidencia,
  onSubmit,
}: Props) {
  const [estado, setEstado] = React.useState<string>("");

  React.useEffect(() => {
    if (incidencia) {
      setEstado(incidencia.estado || "");
    } else {
      setEstado("");
    }
  }, [incidencia]);

  const handleConfirm = () => {
    if (!estado) return;
    onSubmit(estado);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar estado de incidencia</DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        {incidencia && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Incidencia #{incidencia.idIncidencia}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {incidencia.titulo}
            </Typography>
          </Stack>
        )}

        <TextField
          select
          fullWidth
          label="Nuevo estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          size="small"
        >
          {opcionesEstado.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}