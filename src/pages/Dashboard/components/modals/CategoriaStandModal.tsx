import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    estado: initialData?.estado || "Activo",
  });

  const [errors, setErrors] = useState({
    nombre: "",
    descripcion: "",
  });

  const validate = () => {
    let ok = true;
    const newErrors = { nombre: "", descripcion: "" };

    // Nombre obligatorio
    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
      ok = false;
    }

    // Descripción mínima
    if (form.descripcion.trim().length < 5) {
      newErrors.descripcion = "Debe tener al menos 5 caracteres.";
      ok = false;
    }

    setErrors(newErrors);
    return ok;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    // Auto-limpia errores mientras escribe
    setErrors({ ...errors, [name]: "" });
  };

  const handleSave = () => {
    if (!validate()) return; // ❌ No enviar si hay errores

    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {initialData ? "Editar Categoría" : "Nueva Categoría"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid sx={{ mt: 1 }}>
          {/* Nombre */}
          <Grid sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre de la categoría"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
          </Grid>

          {/* Descripción */}
          <Grid sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              error={!!errors.descripcion}
              helperText={errors.descripcion}
              inputProps={{
                style: {
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                },
              }}
            />
          </Grid>

          {/* Estado */}
          <Grid sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.estado === "Activo"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estado: e.target.checked ? "Activo" : "Inactivo",
                    })
                  }
                />
              }
              label={form.estado === "Activo" ? "Activo" : "Inactivo"}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!form.nombre || form.descripcion.length < 5} // 🔥 Botón deshabilitado
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
