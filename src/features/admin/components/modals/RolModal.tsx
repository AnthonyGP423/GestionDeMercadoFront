import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { RolCreateRequest, RolDto, RolUpdateRequest } from "../../../../api/admin/rolesApi";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: RolDto | null;
  onSubmit: (data: RolCreateRequest | RolUpdateRequest) => void;
}

export default function RolModal({
  open,
  onClose,
  mode,
  initialData,
  onSubmit,
}: Props) {
  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Cuando abro el modal para editar, cargo datos
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setNombreRol(initialData.nombreRol ?? "");
      setDescripcion(initialData.descripcion ?? "");
    } else if (mode === "create" && open) {
      // limpiar al abrir en modo crear
      setNombreRol("");
      setDescripcion("");
    }
  }, [mode, initialData, open]);

  const handleSave = () => {
    if (!nombreRol.trim()) return;

    onSubmit({
      nombreRol: nombreRol.trim(),
      descripcion: descripcion.trim() || undefined,
    });

    // El cierre y limpieza se maneja en el padre después de éxito
  };

  const title =
    mode === "create" ? "Registrar nuevo rol" : "Editar rol";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>{title}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre del Rol"
            fullWidth
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
          />

          <TextField
            label="Descripción (opcional)"
            fullWidth
            multiline
            minRows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}