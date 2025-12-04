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
} from "@mui/material";
import { useState, useEffect } from "react";

// --- Interfaces ---
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  categorias?: { id: number; nombre: string }[];
  propietarios?: { id: number; nombre: string }[];
}

export default function StandModal({
  open,
  onClose,
  onSubmit,
  initialData,
  categorias = [],
  propietarios = [],
}: Props) {
  // --- State ---
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

  // --- Effects ---
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      // Reset form if opening in "New" mode (optional but recommended)
      setForm({
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
    }
  }, [initialData, open]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const err: any = {};
    if (!form.nombre_comercial.trim()) err.nombre_comercial = "Requerido";
    if (!form.numero_stand.trim()) err.numero_stand = "Requerido";
    if (!form.id_categoria_stand)
      err.id_categoria_stand = "Seleccione una categoría";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validar()) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {initialData ? "Editar Stand" : "Registrar Stand"}
      </DialogTitle>

      <DialogContent dividers>
        {/* Use Stack for vertical spacing between rows */}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* ROW 1: Propietario */}
          <TextField
            select
            fullWidth
            name="id_propietario"
            label="Propietario"
            value={form.id_propietario}
            onChange={handleChange}
          >
            {propietarios.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* ROW 2: Categoría */}
          <TextField
            select
            fullWidth
            name="id_categoria_stand"
            label="Categoría del stand"
            value={form.id_categoria_stand}
            onChange={handleChange}
            error={!!errors.id_categoria_stand}
            helperText={errors.id_categoria_stand}
          >
            {categorias.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* ROW 3: Bloque & Número (Side by Side) */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Bloque"
              name="bloque"
              value={form.bloque}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Número de stand"
              name="numero_stand"
              value={form.numero_stand}
              onChange={handleChange}
              error={!!errors.numero_stand}
              helperText={errors.numero_stand}
            />
          </Box>

          {/* ROW 4: Nombre Comercial */}
          <TextField
            fullWidth
            label="Nombre comercial"
            name="nombre_comercial"
            value={form.nombre_comercial}
            onChange={handleChange}
            error={!!errors.nombre_comercial}
            helperText={errors.nombre_comercial}
          />

          {/* ROW 5: Descripción */}
          <TextField
            fullWidth
            label="Descripción del negocio"
            name="descripcion_negocio"
            multiline
            minRows={2}
            maxRows={5}
            value={form.descripcion_negocio}
            onChange={handleChange}
          />

          {/* ROW 6: Coordenadas (Side by Side) */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Latitud"
              name="latitud"
              value={form.latitud}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              type="number"
              label="Longitud"
              name="longitud"
              value={form.longitud}
              onChange={handleChange}
            />
          </Box>

          {/* ROW 7: Estado Switch */}
          <Box>
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
              label={`Estado: ${form.estado}`}
            />
          </Box>
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
