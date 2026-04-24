import React, { useEffect, useMemo, useState } from "react";
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
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";

import type {
  ProductoResponseDto,
  ProductoRequestDto,
} from "../../../../api/socio/productosSocioApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export interface ProductData {
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  precio_actual: string;
  en_oferta: boolean;
  precio_oferta: string;
  visible_directorio: boolean;
  id_stand: string | number;
  id_categoria_producto: string | number;
  imagen_url?: string;
  nombre_categoria?: string;
  stand_texto?: string;
  stand_nombre_comercial?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;

  // admin: solo cambia visibilidad
  onSubmit?: (
    payload: Partial<ProductoRequestDto> & { visibleDirectorio?: boolean }
  ) => void;


  initialData?: ProductoResponseDto | null;
  loading?: boolean;

  mode?: "edit" | "view" | "visibilidad";
}

// Helpers
function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function buildImgSrc(raw: string) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (v.startsWith("/")) return `${API_BASE_URL}${v}`;
  if (isAbsoluteUrl(v)) return v;
  return `${API_BASE_URL}/${v}`;
}

function numToStr(v: any) {
  if (v == null) return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
}

// Mapper: DTO backend -> Form admin
function toForm(dto: ProductoResponseDto | null | undefined): ProductData {
  if (!dto) {
    return {
      nombre: "",
      descripcion: "",
      unidad_medida: "Kg",
      precio_actual: "",
      en_oferta: false,
      precio_oferta: "",
      visible_directorio: true,
      id_stand: "",
      id_categoria_producto: "",
      imagen_url: "",
      nombre_categoria: "",
      stand_texto: "",
      stand_nombre_comercial: "",
    };
  }

  const bloque = (dto as any).bloqueStand ?? "";
  const numero = (dto as any).numeroStand ?? "";
  const nombreComercial = (dto as any).nombreComercialStand ?? "";

  const standTexto =
    bloque && numero ? `${bloque}-${numero}` : numero ? String(numero) : "";

  return {
    nombre: dto.nombre ?? "",
    descripcion: dto.descripcion ?? "",
    unidad_medida: dto.unidadMedida ?? "Kg",
    precio_actual: numToStr(dto.precioActual),
    en_oferta: Boolean(dto.enOferta),
    precio_oferta: numToStr(dto.precioOferta),
    visible_directorio: Boolean(dto.visibleDirectorio ?? true),

    id_stand: dto.idStand ?? "",
    id_categoria_producto: dto.idCategoriaProducto ?? "",

    imagen_url: dto.imagenUrl ?? "",
    nombre_categoria: dto.nombreCategoriaProducto ?? "",

    stand_texto: standTexto,
    stand_nombre_comercial: nombreComercial,
  };
}

// Mapper: Form admin -> Payload backend
function toPayload(form: ProductData, mode: Props["mode"]) {
  // Admin: por estándar SOLO cambia visibilidad
  if (mode === "visibilidad") {
    return { visibleDirectorio: Boolean(form.visible_directorio) };
  }

  return {
    nombre: form.nombre?.trim() || undefined,
    descripcion: form.descripcion?.trim() || undefined,
    unidadMedida: form.unidad_medida?.trim() || undefined,
    precioActual: Number(form.precio_actual || 0),
    enOferta: Boolean(form.en_oferta),
    precioOferta: form.en_oferta ? Number(form.precio_oferta || 0) : undefined,
    visibleDirectorio: Boolean(form.visible_directorio),
    idCategoriaProducto: form.id_categoria_producto
      ? Number(form.id_categoria_producto)
      : undefined,
  } as Partial<ProductoRequestDto>;
}

export default function ProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  mode = "view",
}: Props) {
  const isView = mode === "view";
  const isVisibilidad = mode === "visibilidad";
  const isEdit = mode === "edit";

  // - view: todo gris, nada editable
  // - visibilidad: todo gris excepto switch visible_directorio
  const lockAllFields = isView || isVisibilidad;

  const [form, setForm] = useState<ProductData>(() => toForm(initialData));

  useEffect(() => {
    if (!open) return;
    setForm(toForm(initialData));
  }, [initialData, open]);

  const unidades = ["Kg", "Unidad", "Litro", "Caja", "Paquete"];

  const title =
    mode === "view"
      ? "Detalle de producto"
      : mode === "visibilidad"
      ? "Visibilidad de producto"
      : initialData
      ? "Editar producto"
      : "Nuevo producto";

  const previewOk = Boolean(
    form.imagen_url && String(form.imagen_url).trim().length > 0
  );
  const previewSrc = previewOk ? buildImgSrc(String(form.imagen_url)) : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit) return; // admin por ahora no edita datos
    const { name, value } = e.target;

    if (name === "precio_actual" || name === "precio_oferta") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisible = () => {
    if (!(isVisibilidad || isEdit)) return;
    setForm((prev) => ({
      ...prev,
      visible_directorio: !prev.visible_directorio,
    }));
  };

  const handleSave = () => {
    if (!onSubmit) {
      onClose();
      return;
    }
    const payload = toPayload(form, mode);
    onSubmit(payload);
    onClose();
  };

  const readonlyFieldSx = useMemo(
    () => ({
      "& .MuiInputBase-root": {
        bgcolor: lockAllFields ? "#f8fafc" : undefined,
      },
    }),
    [lockAllFields]
  );

  const standLabel = useMemo(() => {
    // Preferencia:
    // 1) "A-101"
    // 2) nombre comercial + stand
    const base = form.stand_texto?.trim() || (form.id_stand ? `ID: ${form.id_stand}` : "—");
    const nc = form.stand_nombre_comercial?.trim();
    return nc ? `${nc} · ${base}` : base;
  }, [form.stand_texto, form.id_stand, form.stand_nombre_comercial]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Admin: puedes ver el producto y cambiar su visibilidad.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            {initialData?.idProducto != null && (
              <Chip label={`ID: ${initialData.idProducto}`} sx={{ fontWeight: 900 }} />
            )}
            <Chip
              label={form.visible_directorio ? "VISIBLE" : "OCULTO"}
              sx={{
                fontWeight: 900,
                bgcolor: form.visible_directorio ? "#ecfdf5" : "#fffbeb",
                color: form.visible_directorio ? "#166534" : "#b45309",
              }}
            />
            {Boolean(form.en_oferta) && (
              <Chip
                label="EN OFERTA"
                sx={{ fontWeight: 900, bgcolor: "#fef2f2", color: "#b91c1c" }}
              />
            )}
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* ✅ loading nativo del modal */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
            <CircularProgress size={20} />
            <Typography sx={{ fontWeight: 800, color: "#64748b" }}>
              Cargando detalle del producto...
            </Typography>
          </Box>
        )}

        {/* Layout 2 columnas */}
        <Box
          sx={{
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? "none" : "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* FORM */}
          <Box>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nombre del producto"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  disabled={lockAllFields}
                  sx={readonlyFieldSx}
                />

                <TextField
                  select
                  label="Unidad"
                  name="unidad_medida"
                  value={form.unidad_medida}
                  onChange={handleChange}
                  sx={{ width: 160, ...readonlyFieldSx }}
                  disabled={lockAllFields}
                >
                  {unidades.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  fullWidth
                  label="Precio (S/.)"
                  name="precio_actual"
                  value={form.precio_actual}
                  onChange={handleChange}
                  disabled={lockAllFields}
                  sx={readonlyFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">S/.</InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.en_oferta}
                      color="warning"
                      disabled
                    />
                  }
                  label="¿Oferta?"
                />

                <TextField
                  fullWidth
                  label="Precio Oferta"
                  name="precio_oferta"
                  value={form.precio_oferta}
                  onChange={handleChange}
                  disabled={lockAllFields}
                  sx={readonlyFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">S/.</InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Mostrar categoría */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Categoría"
                  value={
                    form.nombre_categoria?.trim()
                      ? form.nombre_categoria
                      : form.id_categoria_producto
                      ? `ID: ${form.id_categoria_producto}`
                      : "—"
                  }
                  disabled
                  sx={readonlyFieldSx}
                />
                <TextField
                  fullWidth
                  label="Stand"
                  value={standLabel}
                  disabled
                  sx={readonlyFieldSx}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                label="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                disabled={lockAllFields}
                sx={readonlyFieldSx}
              />

              <Divider />

              {/* ✅ Admin: visibilidad */}
              <FormControlLabel
                control={
                  <Switch
                    checked={form.visible_directorio}
                    onChange={toggleVisible}
                    disabled={isView} // en view NO se cambia
                  />
                }
                label="Visible en directorio"
              />
            </Stack>
          </Box>

          {/* PREVIEW */}
          <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
            <Paper
              variant="outlined"
              sx={{
                borderColor: "#e5e7eb",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderBottom: "1px solid #e5e7eb",
                  bgcolor: "#f8fafc",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>Imagen</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Vista previa del producto.
                </Typography>
              </Box>

              <Box sx={{ p: 1.5 }}>
                {previewOk ? (
                  <Box
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      overflow: "hidden",
                      height: { xs: 180, md: 240 },
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <img
                      src={previewSrc}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: { xs: 180, md: 240 },
                      border: "1px dashed #e5e7eb",
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      display: "grid",
                      placeItems: "center",
                      px: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", fontWeight: 700 }}
                    >
                      Sin imagen
                    </Typography>
                  </Box>
                )}

                {form.imagen_url ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", display: "block", mt: 1 }}
                  >
                    {`URL: ${form.imagen_url}`}
                  </Typography>
                ) : null}
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          {mode === "view" ? "Cerrar" : "Cancelar"}
        </Button>

        {(isEdit || isVisibilidad) && (
          <Button
            variant="contained"
            onClick={handleSave}
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 900,
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
            }}
          >
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}