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
import { useState, useEffect } from "react";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

interface UsuarioFormData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
  dni: string;
  ruc: string;
  razonSocial: string;
  rol: string;
  foto?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => void;

  /** Datos iniciales para ver/editar */
  initialData?: UsuarioFormData;
  /** Modo del modal */
  mode?: "create" | "edit" | "view";
}

export default function NewUserModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: Props) {
  const [form, setForm] = useState<UsuarioFormData>({
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

  const readOnly = mode === "view";

  // Cargar datos iniciales cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? "",
        apellidos: initialData.apellidos ?? "",
        email: initialData.email ?? "",
        password: "",
        telefono: initialData.telefono ?? "",
        dni: initialData.dni ?? "",
        ruc: initialData.ruc ?? "",
        razonSocial: initialData.razonSocial ?? "",
        rol: initialData.rol ?? "",
        foto: initialData.foto ?? "",
      });

      if (initialData.foto) {
        setPreview(initialData.foto);
      } else {
        setPreview(null);
      }
    } else {
      // Si no hay initialData (modo create), limpiar
      setForm({
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
      setPreview(null);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;

    if (name === "telefono" || name === "dni") {
      if (!/^\d*$/.test(value)) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    // Si más adelante manejas upload real, aquí solo guarda referencia
    setForm((prev) => ({ ...prev, foto: url }));
  };

  const handleSave = () => {
    onSubmit(form);
  };

  const titulo =
    mode === "create"
      ? "Registrar usuario"
      : mode === "edit"
      ? "Editar usuario"
      : "Detalle del usuario";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>{titulo}</DialogTitle>

      <DialogContent dividers>
        {/* FOTO */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            src={preview || ""}
            sx={{ width: 100, height: 100, margin: "0 auto" }}
          />

          {!readOnly && (
            <>
              <IconButton color="primary" component="label" sx={{ mt: 1 }}>
                <PhotoCamera />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFoto}
                />
              </IconButton>

              <Typography variant="body2" color="text.secondary">
                Subir foto
              </Typography>
            </>
          )}
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
              disabled={readOnly}
            />

            <TextField
              fullWidth
              label="Apellidos"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              disabled={readOnly}
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
              disabled={readOnly || mode === "edit"} // no editar email en modo edit
            />

            {!readOnly && (
              <TextField
                fullWidth
                type="password"
                label={mode === "edit" ? "Nueva contraseña" : "Contraseña"}
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              inputProps={{ maxLength: 9 }}
              disabled={readOnly}
            />

            <TextField
              fullWidth
              label="DNI"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              inputProps={{ maxLength: 8 }}
              disabled={readOnly}
            />

            <TextField
              fullWidth
              label="RUC"
              name="ruc"
              value={form.ruc}
              onChange={handleChange}
              disabled={readOnly}
            />
          </Box>

          <TextField
            fullWidth
            label="Razón Social"
            name="razonSocial"
            value={form.razonSocial}
            onChange={handleChange}
            disabled={readOnly}
          />

          <TextField
            select
            fullWidth
            label="Rol"
            name="rol"
            value={form.rol}
            onChange={handleChange}
            disabled={readOnly}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
            <MenuItem value="SOCIO">Socio</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {readOnly ? "Cerrar" : "Cancelar"}
        </Button>

        {!readOnly && (
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}