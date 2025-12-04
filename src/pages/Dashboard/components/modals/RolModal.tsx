import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function RolModal({ open, onClose, onSubmit }: Props) {
  const [nombreRol, setNombreRol] = useState("");

  const handleSave = () => {
    if (!nombreRol.trim()) return;
    onSubmit({ nombre: nombreRol.trim() });
    setNombreRol("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Registrar nuevo rol</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre del Rol"
            fullWidth
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar rol
        </Button>
      </DialogActions>
    </Dialog>
  );
}
