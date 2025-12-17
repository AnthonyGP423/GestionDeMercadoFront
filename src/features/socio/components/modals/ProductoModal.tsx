import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Autocomplete,
  Paper,
} from "@mui/material";

import type { ProductoRequestDto, ProductoResponseDto } from "../../../../api/socio/productosSocioApi";
import { categoriasProductoSocioApi, type CategoriaProductoDto } from "../../../../api/socio/categoriasProductoSocioApi.ts";

export type ProductoFormDraft = ProductoRequestDto;

function num(v: any, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

export default function ProductoModal({
  open,
  onClose,
  initial,
  onSave,
  readOnly = false,
}: {
  open: boolean;
  onClose: () => void;
  initial: ProductoResponseDto | null;
  onSave: (draft: ProductoRequestDto) => Promise<void> | void;
  readOnly?: boolean;
}) {
  const isEdit = !!initial;

  const defaults = useMemo<ProductoRequestDto>(() => {
    if (!initial) {
      return {
        idCategoriaProducto: undefined,
        nombre: "",
        descripcion: "",
        unidadMedida: "",
        imagenUrl: "",
        precioActual: 0,
        enOferta: false,
        precioOferta: undefined,
        visibleDirectorio: true,
      };
    }

    return {
      idCategoriaProducto: initial.idCategoriaProducto ?? undefined,
      nombre: initial.nombre ?? "",
      descripcion: initial.descripcion ?? "",
      unidadMedida: initial.unidadMedida ?? "",
      imagenUrl: initial.imagenUrl ?? "",
      precioActual: num(initial.precioActual, 0),
      enOferta: Boolean(initial.enOferta),
      precioOferta: initial.precioOferta != null ? num(initial.precioOferta, 0) : undefined,
      visibleDirectorio: Boolean(initial.visibleDirectorio ?? true),
    };
  }, [initial]);

  const [form, setForm] = useState<ProductoRequestDto>(defaults);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // categorías (combo escribir/filtrar)
  const [cats, setCats] = useState<CategoriaProductoDto[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  useEffect(() => setForm(defaults), [defaults]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setCatsLoading(true);
        setCatsError(null);
        const res = await categoriasProductoSocioApi.listar();
        setCats(res);
      } catch (e) {
        console.error(e);
        setCatsError("No se pudieron cargar las categorías.");
      } finally {
        setCatsLoading(false);
      }
    };

    load();
  }, [open]);

  const selectedCat = useMemo(() => {
    const id = form.idCategoriaProducto;
    if (!id) return null;
    return cats.find((c) => Number(c.id) === Number(id)) ?? null;
  }, [cats, form.idCategoriaProducto]);

  const submit = async () => {
    if (readOnly) return;

    setErr(null);

    const nombre = form.nombre?.trim();
    if (!nombre) return setErr("El nombre es obligatorio.");

    const precioActual = num(form.precioActual, 0);
    if (precioActual <= 0) return setErr("El precio actual debe ser mayor a 0.");

    const enOferta = Boolean(form.enOferta);
    const precioOferta = form.precioOferta == null ? undefined : num(form.precioOferta, 0);

    if (enOferta) {
      if (precioOferta == null || precioOferta <= 0) return setErr("Si está en oferta, ingresa el precio de oferta.");
      if (precioOferta >= precioActual) return setErr("El precio de oferta debe ser menor al precio actual.");
    }

    try {
      setBusy(true);

      const payload: ProductoRequestDto = {
        ...form,
        nombre,
        descripcion: form.descripcion?.trim() || undefined,
        unidadMedida: form.unidadMedida?.trim() || undefined,
        imagenUrl: form.imagenUrl?.trim() || undefined,
        precioActual,
        enOferta,
        precioOferta: enOferta ? precioOferta : undefined,
        visibleDirectorio: Boolean(form.visibleDirectorio),
      };

      Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

      await onSave(payload);
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  };

  const previewOk = Boolean(form.imagenUrl && String(form.imagenUrl).trim().length > 0);

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          // modal grande y usable
          height: { xs: "92vh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header sticky (se mantiene visible) */}
      <DialogTitle
        sx={{
          fontWeight: 900,
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {isEdit ? "Editar producto" : "Nuevo producto"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Completa los datos. La visibilidad controla si aparece en el directorio.
            </Typography>
          </Box>

          {isEdit && initial && (
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" justifyContent="flex-end">
              <Chip label={`ID: ${initial.idProducto}`} sx={{ fontWeight: 900 }} />
              <Chip
                label={Boolean(form.visibleDirectorio) ? "VISIBLE" : "OCULTO"}
                sx={{
                  fontWeight: 900,
                  bgcolor: Boolean(form.visibleDirectorio) ? "#ecfdf5" : "#fffbeb",
                  color: Boolean(form.visibleDirectorio) ? "#166534" : "#b45309",
                }}
              />
              {Boolean(form.enOferta) && (
                <Chip label="EN OFERTA" sx={{ fontWeight: 900, bgcolor: "#fef2f2", color: "#b91c1c" }} />
              )}
            </Stack>
          )}
        </Stack>
      </DialogTitle>

      {/* Content con scroll interno */}
      <DialogContent
        sx={{
          flex: 1,
          overflow: "auto",
          py: 2,
        }}
      >
        {readOnly && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este stand está clausurado/cerrado. Solo puedes visualizar.
          </Alert>
        )}

        {(err || catsError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err ?? catsError}
          </Alert>
        )}

        {/* Layout 2 columnas (form + preview) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* Columna izquierda: formulario */}
          <Box>
            <Stack spacing={1.6}>
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                fullWidth
                disabled={readOnly || busy}
              />

              <TextField
                label="Descripción"
                value={form.descripcion ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                fullWidth
                multiline
                minRows={4}
                disabled={readOnly || busy}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                <TextField
                  label="Unidad de medida (ej. Kg, Und, Lt)"
                  value={form.unidadMedida ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, unidadMedida: e.target.value }))}
                  fullWidth
                  disabled={readOnly || busy}
                />

                <Autocomplete
                  options={cats}
                  value={selectedCat}
                  loading={catsLoading}
                  getOptionLabel={(o) => String(o?.nombre ?? "")}
                  isOptionEqualToValue={(a, b) => Number(a?.id) === Number(b?.id)}
                  onChange={(_, v) => {
                    setForm((p) => ({
                      ...p,
                      idCategoriaProducto: v?.id ? Number(v.id) : undefined,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categoría (opcional)"
                      fullWidth
                      disabled={readOnly || busy}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {catsLoading ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              <TextField
                label="Imagen URL (opcional)"
                value={form.imagenUrl ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, imagenUrl: e.target.value }))}
                fullWidth
                disabled={readOnly || busy}
              />

              <Divider sx={{ my: 0.5 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Precio actual (S/)"
                  type="number"
                  value={form.precioActual ?? 0}
                  onChange={(e) => setForm((p) => ({ ...p, precioActual: Number(e.target.value) }))}
                  fullWidth
                  inputProps={{ min: 0, step: "0.10" }}
                  disabled={readOnly || busy}
                />

                <FormControlLabel
                  label="En oferta"
                  control={
                    <Switch
                      checked={Boolean(form.enOferta)}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          enOferta: e.target.checked,
                          precioOferta: e.target.checked ? (p.precioOferta ?? p.precioActual) : undefined,
                        }))
                      }
                      disabled={readOnly || busy}
                    />
                  }
                  sx={{ m: 0, justifyContent: "space-between" }}
                />
              </Box>

              {Boolean(form.enOferta) && (
                <TextField
                  label="Precio oferta (S/)"
                  type="number"
                  value={form.precioOferta ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      precioOferta: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  fullWidth
                  inputProps={{ min: 0, step: "0.10" }}
                  disabled={readOnly || busy}
                />
              )}

              <FormControlLabel
                label={Boolean(form.visibleDirectorio) ? "Visible en directorio" : "Oculto en directorio"}
                control={
                  <Switch
                    checked={Boolean(form.visibleDirectorio)}
                    onChange={(e) => setForm((p) => ({ ...p, visibleDirectorio: e.target.checked }))}
                    disabled={readOnly || busy}
                  />
                }
                sx={{ m: 0 }}
              />
            </Stack>
          </Box>

          {/* Columna derecha: preview + resumen */}
          <Box sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
            <Paper
              variant="outlined"
              sx={{
                borderColor: "#e5e7eb",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Vista previa</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Revisa cómo se verá la imagen y datos clave.
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
                      mb: 1.5,
                    }}
                  >
                    <img
                      src={String(form.imagenUrl)}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
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
                      mb: 1.5,
                      px: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                      Agrega una URL de imagen para ver la vista previa
                    </Typography>
                  </Box>
                )}

                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
                      Categoría
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                      {selectedCat?.nombre ?? "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
                      Precio
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                      S/ {num(form.precioActual, 0).toFixed(2)}
                      {Boolean(form.enOferta) && form.precioOferta != null
                        ? `  →  S/ ${num(form.precioOferta, 0).toFixed(2)}`
                        : ""}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      label={Boolean(form.visibleDirectorio) ? "VISIBLE" : "OCULTO"}
                      sx={{
                        fontWeight: 900,
                        bgcolor: Boolean(form.visibleDirectorio) ? "#ecfdf5" : "#fffbeb",
                        color: Boolean(form.visibleDirectorio) ? "#166534" : "#b45309",
                        borderRadius: 999,
                      }}
                    />
                    {Boolean(form.enOferta) && (
                      <Chip
                        size="small"
                        label="OFERTA"
                        sx={{
                          fontWeight: 900,
                          bgcolor: "#fef2f2",
                          color: "#b91c1c",
                          borderRadius: 999,
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer sticky */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          bgcolor: "#fff",
          position: "sticky",
          bottom: 0,
          zIndex: 2,
        }}
      >
        <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none", fontWeight: 900 }}>
          Cerrar
        </Button>

        {!readOnly && (
          <Button
            variant="contained"
            onClick={submit}
            disabled={busy}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              minWidth: 140,
            }}
          >
            {busy ? "Guardando..." : "Guardar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}