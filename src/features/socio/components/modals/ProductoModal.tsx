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

import type {
  ProductoRequestDto,
  ProductoResponseDto,
} from "../../../../api/socio/productosSocioApi";
import {
  categoriasProductoSocioApi,
  type CategoriaProductoDto,
} from "../../../../api/socio/categoriasProductoSocioApi.ts";

// ✅ NUEVO: api genérico para uploads
import { filesApi } from "../../../../api/filesApi";

export type ProductoFormDraft = ProductoRequestDto;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

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
      precioOferta:
        initial.precioOferta != null ? num(initial.precioOferta, 0) : undefined,
      visibleDirectorio: Boolean(initial.visibleDirectorio ?? true),
    };
  }, [initial]);

  const [form, setForm] = useState<ProductoRequestDto>(defaults);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ NUEVO: estado de subida de imagen
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

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

  // ✅ NUEVO: handler para subir imagen al backend
  const handlePickImage = async (file: File | null) => {
    if (!file) return;
    if (readOnly || busy) return;

    // validación rápida en front
    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(file.type)) {
      setUploadErr("Formato no permitido. Usa PNG, JPG o WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr("La imagen supera 10MB.");
      return;
    }

    try {
      setUploadErr(null);
      setUploading(true);

      const res = await filesApi.upload("productos", file);

      // Guardamos la ruta que devuelve el backend, ej: /media/productos/xxx.jpg
      setForm((p) => ({ ...p, imagenUrl: res.url }));
    } catch (e) {
      console.error(e);
      setUploadErr("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (readOnly) return;

    setErr(null);
    if (uploading) return setErr("Espera a que termine la subida de la imagen.");

    const nombre = form.nombre?.trim();
    if (!nombre) return setErr("El nombre es obligatorio.");

    const precioActual = num(form.precioActual, 0);
    if (precioActual <= 0) return setErr("El precio actual debe ser mayor a 0.");

    const enOferta = Boolean(form.enOferta);
    const precioOferta =
      form.precioOferta == null ? undefined : num(form.precioOferta, 0);

    if (enOferta) {
      if (precioOferta == null || precioOferta <= 0)
        return setErr("Si está en oferta, ingresa el precio de oferta.");
      if (precioOferta >= precioActual)
        return setErr("El precio de oferta debe ser menor al precio actual.");
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

      Object.keys(payload).forEach(
        (k) => (payload as any)[k] === undefined && delete (payload as any)[k]
      );

      await onSave(payload);
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  };

  const previewOk = Boolean(
    form.imagenUrl && String(form.imagenUrl).trim().length > 0
  );

  // ✅ AQUÍ se cambia el preview:
  // - Si imagenUrl es "/media/..." => usa API_BASE_URL + imagenUrl
  // - Si ya viene como "http..." => úsala tal cual
  const previewSrc = previewOk
    ? String(form.imagenUrl).startsWith("http")
      ? String(form.imagenUrl)
      : `${API_BASE_URL}${String(form.imagenUrl)}`
    : "";

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
          height: { xs: "92vh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {isEdit ? "Editar producto" : "Nuevo producto"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Completa los datos. La visibilidad controla si aparece en el
              directorio.
            </Typography>
          </Box>

          {isEdit && initial && (
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
              justifyContent="flex-end"
            >
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
                <Chip
                  label="EN OFERTA"
                  sx={{
                    fontWeight: 900,
                    bgcolor: "#fef2f2",
                    color: "#b91c1c",
                  }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </DialogTitle>

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
                onChange={(e) =>
                  setForm((p) => ({ ...p, nombre: e.target.value }))
                }
                fullWidth
                disabled={readOnly || busy || uploading}
              />

              <TextField
                label="Descripción"
                value={form.descripcion ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descripcion: e.target.value }))
                }
                fullWidth
                multiline
                minRows={4}
                disabled={readOnly || busy || uploading}
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
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unidadMedida: e.target.value }))
                  }
                  fullWidth
                  disabled={readOnly || busy || uploading}
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
                      disabled={readOnly || busy || uploading}
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

              {/* ✅ NUEVO: Subir imagen */}
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={readOnly || busy || uploading}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      borderRadius: 2,
                    }}
                  >
                    {uploading ? "Subiendo..." : "Subir imagen"}
                    <input
                      type="file"
                      hidden
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        e.currentTarget.value = "";
                        handlePickImage(f);
                      }}
                    />
                  </Button>

                  {Boolean(form.imagenUrl) && (
                    <Button
                      variant="text"
                      color="error"
                      disabled={readOnly || busy || uploading}
                      onClick={() => setForm((p) => ({ ...p, imagenUrl: "" }))}
                      sx={{ textTransform: "none", fontWeight: 900 }}
                    >
                      Quitar
                    </Button>
                  )}
                </Box>

                {uploadErr && (
                  <Alert severity="error" sx={{ py: 0.5 }}>
                    {uploadErr}
                  </Alert>
                )}

                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Formatos: PNG/JPG/WEBP. Máx. 10MB. Se guardará como URL en el
                  sistema.
                </Typography>
              </Stack>

              {/* Se mantiene el campo manual (no se rompe) */}
              <TextField
                label="Imagen URL (opcional)"
                value={form.imagenUrl ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, imagenUrl: e.target.value }))
                }
                fullWidth
                disabled={readOnly || busy || uploading}
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
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      precioActual: Number(e.target.value),
                    }))
                  }
                  fullWidth
                  inputProps={{ min: 0, step: "0.10" }}
                  disabled={readOnly || busy || uploading}
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
                          precioOferta: e.target.checked
                            ? p.precioOferta ?? p.precioActual
                            : undefined,
                        }))
                      }
                      disabled={readOnly || busy || uploading}
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
                      precioOferta:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  fullWidth
                  inputProps={{ min: 0, step: "0.10" }}
                  disabled={readOnly || busy || uploading}
                />
              )}

              <FormControlLabel
                label={
                  Boolean(form.visibleDirectorio)
                    ? "Visible en directorio"
                    : "Oculto en directorio"
                }
                control={
                  <Switch
                    checked={Boolean(form.visibleDirectorio)}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        visibleDirectorio: e.target.checked,
                      }))
                    }
                    disabled={readOnly || busy || uploading}
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
              <Box
                sx={{
                  p: 1.5,
                  borderBottom: "1px solid #e5e7eb",
                  bgcolor: "#f8fafc",
                }}
              >
                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Vista previa
                </Typography>
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
                    {/* ✅ PREVIEW CORRECTO (AQUÍ ESTÁ EL CAMBIO) */}
                    <img
                      src={previewSrc}
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
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", fontWeight: 700 }}
                    >
                      Agrega una URL de imagen para ver la vista previa
                    </Typography>
                  </Box>
                )}

                <Stack spacing={1}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", fontWeight: 800 }}
                    >
                      Categoría
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                      {selectedCat?.nombre ?? "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", fontWeight: 800 }}
                    >
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
        <Button
          onClick={onClose}
          disabled={busy || uploading}
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          Cerrar
        </Button>

        {!readOnly && (
          <Button
            variant="contained"
            onClick={submit}
            disabled={busy || uploading}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              minWidth: 140,
            }}
          >
            {busy ? "Guardando..." : uploading ? "Subiendo..." : "Guardar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}