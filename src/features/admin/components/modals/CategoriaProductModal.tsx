import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";

// 1. Definimos la interfaz de los datos
export interface CategoryData {
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryData) => void;
  initialData?: CategoryData;
}

export default function CategoryProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const defaultState: CategoryData = {
    nombre: "",
    descripcion: "",
    estado: "Activo",
  };

  const [form, setForm] = useState<CategoryData>(defaultState);
  const [error, setError] = useState(false); // Para validar nombre vacío

  // 2. Controlamos la carga de datos y el reset al abrir/cerrar
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm(defaultState); // Limpiar si es nuevo
      }
      setError(false);
    }
  }, [initialData, open]);

  // 3. Tipado correcto del evento
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Quitar error si el usuario escribe
    if (name === "nombre" && value.trim() !== "") {
      setError(false);
    }
  };

  const handleSave = () => {
    // Validación básica
    if (!form.nombre.trim()) {
      setError(true);
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {initialData ? "Editar Categoría" : "Nueva Categoría"}
      </DialogTitle>

      <DialogContent dividers>
        {/* 4. Usamos Stack para un diseño vertical limpio y ordenado */}
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Nombre */}
          <TextField
            fullWidth
            label="Nombre de la categoría"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={error}
            helperText={error ? "El nombre es obligatorio" : ""}
          />

          {/* Descripción */}
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción..."
          />

          {/* Estado */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Estado
            </Typography>

            <RadioGroup
              row
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Activo"
                control={<Radio color="success" />}
                label="Activo"
              />
              <FormControlLabel
                value="Inactivo"
                control={<Radio color="error" />}
                label="Inactivo"
              />
            </RadioGroup>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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
