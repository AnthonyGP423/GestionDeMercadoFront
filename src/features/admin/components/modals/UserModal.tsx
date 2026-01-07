// src/pages/usuario/components/modals/UserModal.tsx
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
  Paper,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";

import type { RolDto } from "../../../../api/admin/rolesApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// base pública (servidor), sin /api/v1
function getPublicBaseUrl() {
  const api = String(API_BASE_URL || "").replace(/\/+$/, "");
  // elimina /api, /api/v1, /api/v1/...
  return api.replace(/\/api(\/v\d+)?$/i, "");
}

const PUBLIC_BASE_URL = getPublicBaseUrl();

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function buildImgSrc(raw: string) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (isAbsoluteUrl(v)) return v;
  if (v.startsWith("/")) return `${PUBLIC_BASE_URL}${v}`; 
  return `${PUBLIC_BASE_URL}/${v}`;
}

export interface UsuarioFormData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
  dni: string;
  ruc: string;
  razonSocial: string;

  // idRol como string: "1", "2", "3", ...
  rol: string;

  // url guardada en BD (ej: "/media/usuarios/xxx.webp")
  foto?: string;

  // archivo real seleccionado para subir
  fotoFile?: File | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => void;

  initialData?: UsuarioFormData;
  mode?: "create" | "edit" | "view";
  roles: RolDto[];
}

export default function NewUserModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
  roles,
}: Props) {
  const readOnly = mode === "view";

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
    fotoFile: null,
  });

  // preview: puede ser URL backend o objectURL
  const [preview, setPreview] = useState<string>("");

  const rolesActivos = useMemo(
    () => (roles || []).filter((r) => (r.estadoRegistro ?? 1) === 1),
    [roles]
  );

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? "",
        apellidos: initialData.apellidos ?? "",
        email: initialData.email ?? "",
        password: "", // nunca precargar password
        telefono: initialData.telefono ?? "",
        dni: initialData.dni ?? "",
        ruc: initialData.ruc ?? "",
        razonSocial: initialData.razonSocial ?? "",
        rol: initialData.rol ?? "",
        foto: initialData.foto ?? "",
        fotoFile: null,
      });

      const fotoUrl = initialData.foto ? buildImgSrc(initialData.foto) : "";
      setPreview(fotoUrl);
    } else {
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
        fotoFile: null,
      });
      setPreview("");
    }
  }, [initialData, open]);

  // limpiar objectURL
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const rolLabel = useMemo(() => {
    const id = Number(form.rol || 0);
    const found = rolesActivos.find((r) => r.idRol === id);
    return found?.nombreRol ?? "";
  }, [form.rol, rolesActivos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;

    if (name === "telefono" || name === "dni" || name === "ruc") {
      if (!/^\d*$/.test(value)) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);

    setPreview(url);
    setForm((prev) => ({
      ...prev,
      fotoFile: file,
    }));
  };

  const handleRemovePhoto = () => {
    if (readOnly) return;

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    setForm((prev) => ({
      ...prev,
      foto: "",
      fotoFile: null,
    }));
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              {titulo}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
              {rolLabel ? (
                <Chip
                  label={rolLabel}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    bgcolor: "#f1f5f9",
                  }}
                />
              ) : null}

              {mode === "edit" && (
                <Chip
                  label="Email bloqueado en edición"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    bgcolor: "#fff7ed",
                    color: "#9a3412",
                  }}
                />
              )}
            </Stack>
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
            gap: 2,
          }}
        >
          {/* FOTO */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                bgcolor: "#f8fafc",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>Foto</Typography>
            </Box>

            <Box sx={{ p: 2, display: "grid", placeItems: "center", gap: 1.25 }}>
              <Avatar
                src={preview || ""}
                sx={{
                  width: 112,
                  height: 112,
                  bgcolor: "#e5e7eb",
                  boxShadow: "0 10px 20px rgba(2,6,23,0.08)",
                }}
              />

              {!readOnly && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton color="primary" component="label">
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFoto}
                    />
                  </IconButton>

                  <Button
                    onClick={handleRemovePhoto}
                    disabled={!preview}
                    color="inherit"
                    sx={{ textTransform: "none", fontWeight: 900 }}
                  >
                    Quitar
                  </Button>
                </Stack>
              )}

              {!readOnly && (
                <Typography variant="caption" color="text.secondary">
                  Sube o cambia la foto del usuario.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* FORM */}
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
                disabled={readOnly || mode === "edit"}
              />

              {!readOnly && (
                <TextField
                  fullWidth
                  type="password"
                  label={
                    mode === "edit"
                      ? "Nueva contraseña (opcional)"
                      : "Contraseña"
                  }
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
                inputProps={{ maxLength: 11 }}
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

            <Divider />

            <TextField
              select
              fullWidth
              label="Rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
              disabled={readOnly}
            >
              {rolesActivos.map((r) => (
                <MenuItem key={r.idRol} value={String(r.idRol)}>
                  {r.nombreRol}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          {readOnly ? "Cerrar" : "Cancelar"}
        </Button>

        {!readOnly && (
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 999,
            }}
          >
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}