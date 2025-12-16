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

export interface ProductData {
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
  onSubmit?: (data: ProductData) => void;
  initialData?: ProductData;
  // 👇 nuevo: modo del modal
  mode?: "edit" | "view" | "visibilidad";
}

export default function ProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "edit",
}: Props) {
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

  const isView = mode === "view";
  const isVisibilidad = mode === "visibilidad";
  const isEdit = mode === "edit";

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(defaultState);
    }
  }, [initialData, open]);

  const unidades = ["Kg", "Unidad", "Litro", "Caja", "Paquete"];
  // En admin solo mostramos, pero las listas se mantienen por si luego se reutiliza
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isView || isVisibilidad) return; // no editar en esos modos
    const { name, value } = e.target;
    if (name === "precio_actual" || name === "precio_oferta") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSwitch = (field: keyof ProductData) => {
    // Solo se puede cambiar visible_directorio en modo "visibilidad" o en modo "edit"
    if (
      (field === "visible_directorio" && (isVisibilidad || isEdit)) ||
      (field !== "visible_directorio" && isEdit)
    ) {
      setForm((prev) => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const handleSave = () => {
    if (!onSubmit) {
      onClose();
      return;
    }
    onSubmit(form);
    onClose();
  };

  const title =
    mode === "view"
      ? "Detalle de producto"
      : mode === "visibilidad"
      ? "Visibilidad de producto"
      : initialData
      ? "Editar producto"
      : "Nuevo producto";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>{title}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* FILA 1: Nombre y Unidad */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre del producto"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              sx={{ flex: 1 }}
              InputProps={{
                readOnly: !isEdit,
              }}
            />
            <TextField
              select
              label="Unidad"
              name="unidad_medida"
              value={form.unidad_medida}
              onChange={handleChange}
              sx={{ width: "150px" }}
              disabled={!isEdit}
            >
              {unidades.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* FILA 2: Precio, Oferta, Precio Oferta */}
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
                readOnly: !isEdit,
              }}
            />

            <Box sx={{ whiteSpace: "nowrap" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.en_oferta}
                    onChange={() => toggleSwitch("en_oferta")}
                    color="warning"
                    disabled={!isEdit}
                  />
                }
                label="¿Oferta?"
              />
            </Box>

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
                  readOnly: !isEdit,
                }}
              />
            ) : (
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
              disabled={!isEdit}
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
              disabled={!isEdit}
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
            InputProps={{
              readOnly: !isEdit,
            }}
          />

          {/* FILA 5: Configuración final */}
          <Box sx={{ display: "flex", gap: 4, pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.visible_directorio}
                  onChange={() => toggleSwitch("visible_directorio")}
                  // 👇 solo editable en modo visibilidad o edit, no en view
                  disabled={isView}
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
                      estado:
                        prev.estado === "Activo" ? "Inactivo" : "Activo",
                    }))
                  }
                  color="success"
                  disabled={!isEdit}
                />
              }
              label={`Estado: ${form.estado}`}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          {mode === "view" ? "Cerrar" : "Cancelar"}
        </Button>
        {(isEdit || isVisibilidad) && (
          <Button variant="contained" onClick={handleSave} disableElevation>
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}