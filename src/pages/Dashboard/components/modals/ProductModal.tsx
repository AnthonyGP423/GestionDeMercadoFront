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
  InputAdornment,
  Stack,
  Box,
} from "@mui/material";
import React, { useState, useEffect } from "react";

// --- Interfaces (TypeScript) ---
interface ProductData {
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  precio_actual: string;
  en_oferta: boolean;
  precio_oferta: string;
  visible_directorio: boolean;
  estado: "Activo" | "Inactivo";
  id_stand: string | number;
  id_categoria_producto: string | number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductData) => void;
  initialData?: ProductData;
}

export default function ProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  // --- Estado Inicial ---
  const defaultState: ProductData = {
    nombre: "",
    descripcion: "",
    unidad_medida: "Kg",
    precio_actual: "",
    en_oferta: false,
    precio_oferta: "",
    visible_directorio: true,
    estado: "Activo",
    id_stand: "",
    id_categoria_producto: "",
  };

  const [form, setForm] = useState<ProductData>(defaultState);

  // Cargar datos si es edición
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(defaultState);
    }
  }, [initialData, open]);

  // --- Listas de opciones ---
  const unidades = ["Kg", "Unidad", "Litro", "Caja", "Paquete"];
  const categorias = [
    { id: 1, nombre: "Verduras" },
    { id: 2, nombre: "Carnes" },
    { id: 3, nombre: "Abarrotes" },
  ];
  const stands = [
    { id: 1, codigo: "A-101" },
    { id: 2, codigo: "B-204" },
    { id: 3, codigo: "A-115" },
  ];

  // --- Manejadores ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Validación solo números
    if (name === "precio_actual" || name === "precio_oferta") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSwitch = (field: keyof ProductData) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {initialData ? "Editar producto" : "Nuevo producto"}
      </DialogTitle>

      <DialogContent dividers>
        {/* Usamos Stack para el orden VERTICAL (hacia abajo) con espacio de 2 */}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* FILA 1: Nombre y Unidad */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre del producto"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              sx={{ flex: 1 }} // Ocupa todo el espacio posible
            />
            <TextField
              select
              label="Unidad"
              name="unidad_medida"
              value={form.unidad_medida}
              onChange={handleChange}
              sx={{ width: "150px" }} // Ancho fijo para la unidad
            >
              {unidades.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* FILA 2: Precio, Switch Oferta y Precio Oferta */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              label="Precio (S/.)"
              name="precio_actual"
              value={form.precio_actual}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">S/.</InputAdornment>
                ),
              }}
            />

            {/* Contenedor del Switch para que no se deforme */}
            <Box sx={{ whiteSpace: "nowrap" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.en_oferta}
                    onChange={() => toggleSwitch("en_oferta")}
                    color="warning"
                  />
                }
                label="¿Oferta?"
              />
            </Box>

            {/* Input de Oferta (aparece o desaparece manteniendo el espacio limpio) */}
            {form.en_oferta ? (
              <TextField
                fullWidth
                label="Precio Oferta"
                name="precio_oferta"
                value={form.precio_oferta}
                onChange={handleChange}
                color="warning"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">S/.</InputAdornment>
                  ),
                }}
              />
            ) : (
              // Espacio vacío para mantener el layout si no hay oferta (opcional)
              <Box sx={{ width: "100%" }} />
            )}
          </Box>

          {/* FILA 3: Categoría y Stand */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Categoría"
              name="id_categoria_producto"
              value={form.id_categoria_producto}
              onChange={handleChange}
            >
              {categorias.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Stand"
              name="id_stand"
              value={form.id_stand}
              onChange={handleChange}
            >
              {stands.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.codigo}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* FILA 4: Descripción */}
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={5}
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />

          {/* FILA 5: Configuración final (Visible y Estado) */}
          <Box sx={{ display: "flex", gap: 4, pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.visible_directorio}
                  onChange={() => toggleSwitch("visible_directorio")}
                />
              }
              label="Visible en directorio"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.estado === "Activo"}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      estado: prev.estado === "Activo" ? "Inactivo" : "Activo",
                    }))
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
