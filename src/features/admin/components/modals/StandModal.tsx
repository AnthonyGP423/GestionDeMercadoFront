// src/pages/stand/components/modals/StandModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
  Stack,
  Box,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

interface CategoriaOption {
  id: number;
  nombre: string;
}

interface PropietarioOption {
  id: number;
  nombre: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  categorias?: CategoriaOption[];
  propietarios?: PropietarioOption[];
}

export default function StandModal({
  open,
  onClose,
  onSubmit,
  initialData,
  categorias = [],
  propietarios = [],
}: Props) {
  const [form, setForm] = useState({
    id_propietario: "",
    id_categoria_stand: "",
    bloque: "",
    numero_stand: "",
    nombre_comercial: "",
    descripcion_negocio: "",
    latitud: "",
    longitud: "",
    estado: "Activo",
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const emptyForm = {
      id_propietario: "",
      id_categoria_stand: "",
      bloque: "",
      numero_stand: "",
      nombre_comercial: "",
      descripcion_negocio: "",
      latitud: "",
      longitud: "",
      estado: "Activo",
    };

    if (open) {
      if (initialData) {
        setForm({
          id_propietario:
            initialData.id_propietario != null
              ? String(initialData.id_propietario)
              : "",
          id_categoria_stand:
            initialData.id_categoria_stand != null
              ? String(initialData.id_categoria_stand)
              : "",
          bloque: initialData.bloque ?? "",
          numero_stand: initialData.numero_stand ?? "",
          nombre_comercial: initialData.nombre_comercial ?? "",
          descripcion_negocio: initialData.descripcion_negocio ?? "",
          latitud:
            initialData.latitud != null ? String(initialData.latitud) : "",
          longitud:
            initialData.longitud != null ? String(initialData.longitud) : "",
          estado: initialData.estado ?? "Activo",
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const err: any = {};

    if (!form.id_propietario) {
      err.id_propietario = "Selecciona un propietario / socio";
    }

    // 🔹 Mientras NO tengas categorías implementadas, NO obliguemos este campo
    if (categorias.length > 0 && !form.id_categoria_stand) {
      err.id_categoria_stand = "Selecciona una categoría";
    }

    if (!form.nombre_comercial.trim()) {
      err.nombre_comercial = "El nombre comercial es obligatorio";
    }

    if (!form.numero_stand.trim()) {
      err.numero_stand = "El número de stand es obligatorio";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validar()) return;
    onSubmit(form);
  };

  // 🔹 Evitar “out-of-range” si el valor no existe en las opciones
  const propietarioValue = propietarios.some(
    (p) => String(p.id) === form.id_propietario
  )
    ? form.id_propietario
    : "";

  const categoriaValue = categorias.some(
    (c) => String(c.id) === form.id_categoria_stand
  )
    ? form.id_categoria_stand
    : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {initialData ? "Editar stand" : "Registrar stand"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Asigna el stand a un <strong>socio propietario</strong>, define su
          ubicación y describe el negocio que atiende en este puesto.
        </Typography>

        <Stack spacing={2}>
          {/* PROPIETARIO / SOCIO */}
          <TextField
            select
            fullWidth
            size="small"
            name="id_propietario"
            label="Propietario / socio"
            value={propietarioValue}
            onChange={handleChange}
            error={!!errors.id_propietario}
            helperText={errors.id_propietario}
          >
            {propietarios.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* CATEGORÍA DEL STAND */}
          <TextField
            select
            fullWidth
            size="small"
            name="id_categoria_stand"
            label="Categoría del stand"
            value={categoriaValue}
            onChange={handleChange}
            error={!!errors.id_categoria_stand}
            helperText={
              categorias.length === 0
                ? "Aún no hay categorías configuradas"
                : errors.id_categoria_stand
            }
          >
            {categorias.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* BLOQUE / NÚMERO */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="Bloque"
              name="bloque"
              value={form.bloque}
              onChange={handleChange}
              placeholder="Ej. A, B, C"
            />
            <TextField
              size="small"
              fullWidth
              label="Número de stand"
              name="numero_stand"
              value={form.numero_stand}
              onChange={handleChange}
              error={!!errors.numero_stand}
              helperText={errors.numero_stand}
              placeholder="Ej. 101"
            />
          </Box>

          {/* NOMBRE COMERCIAL */}
          <TextField
            size="small"
            fullWidth
            label="Nombre comercial"
            name="nombre_comercial"
            value={form.nombre_comercial}
            onChange={handleChange}
            error={!!errors.nombre_comercial}
            helperText={errors.nombre_comercial}
            placeholder="Ej. Frutas Don José"
          />

          {/* DESCRIPCIÓN */}
          <TextField
            size="small"
            fullWidth
            label="Descripción del negocio"
            name="descripcion_negocio"
            multiline
            minRows={2}
            maxRows={5}
            value={form.descripcion_negocio}
            onChange={handleChange}
            placeholder="Productos principales, horarios, especialidad..."
          />

          {/* COORDENADAS */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Latitud"
              name="latitud"
              value={form.latitud}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Longitud"
              name="longitud"
              value={form.longitud}
              onChange={handleChange}
            />
          </Box>

          {/* ESTADO ADMINISTRATIVO (solo informativo aquí) */}
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
                color="success"
              />
            }
            label={`Estado administrativo: ${form.estado}`}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disableElevation>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}