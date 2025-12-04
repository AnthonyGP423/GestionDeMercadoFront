import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Typography,
  Avatar,
  IconButton,
  Box,
} from "@mui/material";

import { useState } from "react";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function NewUserModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    dni: "",
    ruc: "",
    razonSocial: "",
    rol: "",
    foto: "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "telefono" || name === "dni") {
      if (!/^\d*$/.test(value)) return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleFoto = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    setForm({ ...form, foto: file });
  };

  const handleSave = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Registrar nuevo usuario
      </DialogTitle>

      <DialogContent dividers>
        {/* FOTO */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            src={preview || ""}
            sx={{ width: 100, height: 100, margin: "0 auto" }}
          />

          <IconButton color="primary" component="label" sx={{ mt: 1 }}>
            <PhotoCamera />
            <input type="file" hidden accept="image/*" onChange={handleFoto} />
          </IconButton>

          <Typography variant="body2" color="text.secondary">
            Subir foto
          </Typography>
        </Box>

        {/* FORMULARIO */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Apellidos"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              inputProps={{ maxLength: 9 }}
            />

            <TextField
              fullWidth
              label="DNI"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              inputProps={{ maxLength: 8 }}
            />

            <TextField
              fullWidth
              label="RUC"
              name="ruc"
              value={form.ruc}
              onChange={handleChange}
            />
          </Box>

          <TextField
            fullWidth
            label="Razón Social"
            name="razonSocial"
            value={form.razonSocial}
            onChange={handleChange}
          />

          <TextField
            select
            fullWidth
            label="Rol"
            name="rol"
            value={form.rol}
            onChange={handleChange}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
            <MenuItem value="SOCIO">Socio</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar usuario
        </Button>
      </DialogActions>
    </Dialog>
  );
}
