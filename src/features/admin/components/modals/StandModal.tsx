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
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";

import http from "../../../../api/httpClient";

interface CategoriaOption {
  id: number;
  nombre: string;
}

interface CategoriaAdminApi {
  id: number;
  nombre: string;
  descripcion?: string;
  colorHex?: string;
  iconoUrl?: string;
  estado?: boolean;
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
    id_propietario: "", // opcional: puede ir vacío
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

  // categorías internas (si el padre no manda)
  const [catsLocal, setCatsLocal] = useState<CategoriaOption[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [errorCats, setErrorCats] = useState<string | null>(null);

  // fuente final: si vienen por props, usa props; si no, usa local
  const categoriasFinal = useMemo(() => {
    return categorias.length > 0 ? categorias : catsLocal;
  }, [categorias, catsLocal]);

  // cargar categorías SOLO si el modal abre y el padre no mandó
  useEffect(() => {
    if (!open) return;
    if (categorias.length > 0) return;

    const loadCats = async () => {
      try {
        setLoadingCats(true);
        setErrorCats(null);

        const res = await http.get<CategoriaAdminApi[]>(
          "/api/v1/admin/categorias-stands"
        );

        const mapped: CategoriaOption[] = (res.data ?? [])
          // opcional: si estado=false no queremos mostrarla
          .filter((c) => c.estado !== false)
          .map((c) => ({
            id: Number(c.id),
            nombre: String(c.nombre ?? "").trim(),
          }))
          .filter((c) => c.id && c.nombre);

        setCatsLocal(mapped);
      } catch (e) {
        console.error(e);
        setErrorCats("No se pudieron cargar las categorías.");
        setCatsLocal([]);
      } finally {
        setLoadingCats(false);
      }
    };

    loadCats();
  }, [open, categorias.length]);

  useEffect(() => {
    const emptyForm = {
      id_propietario: "", // opcional
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
          latitud: initialData.latitud != null ? String(initialData.latitud) : "",
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

    // ✅ id_propietario es OPCIONAL: ya no se valida como obligatorio

    if (!form.id_categoria_stand) {
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

    // convertir ids a número para el backend
    const payload = {
      ...form,
      // ✅ si viene vacío, enviar null (no 0 / no NaN)
      id_propietario: form.id_propietario ? Number(form.id_propietario) : null,
      id_categoria_stand: Number(form.id_categoria_stand),
      // opcional: normalizar bloque
      bloque: String(form.bloque ?? "").toUpperCase().trim(),
      numero_stand: String(form.numero_stand ?? "").trim(),
    };

    onSubmit(payload);
  };

  // 🔹 Evitar “out-of-range” si el valor no existe en las opciones
  const propietarioValue = propietarios.some(
    (p) => String(p.id) === form.id_propietario
  )
    ? form.id_propietario
    : "";

  const categoriaValue = categoriasFinal.some(
    (c) => String(c.id) === form.id_categoria_stand
  )
    ? form.id_categoria_stand
    : "";

  const categoriasDisabled = loadingCats || categoriasFinal.length === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {initialData ? "Editar stand" : "Registrar stand"}
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Asigna el stand a un <strong>socio propietario</strong>, define su
          ubicación y describe el negocio que atiende en este puesto.
        </Typography>

        <Stack spacing={2}>
          {/* PROPIETARIO / SOCIO (OPCIONAL) */}
          <TextField
            select
            fullWidth
            size="small"
            name="id_propietario"
            label="Propietario / socio (opcional)"
            value={propietarioValue}
            onChange={handleChange}
            error={!!errors.id_propietario}
            helperText={errors.id_propietario}
          >
            {/* ✅ Permitir dejar en blanco */}
            <MenuItem value="">
              <em>Sin propietario asignado</em>
            </MenuItem>

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
              errorCats
                ? errorCats
                : loadingCats
                ? "Cargando categorías..."
                : categoriasFinal.length === 0
                ? "No hay categorías configuradas (crea al menos 1)."
                : errors.id_categoria_stand
            }
            disabled={categoriasDisabled}
            InputProps={{
              endAdornment: loadingCats ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
          >
            {categoriasFinal.map((c) => (
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

        <Button
          variant="contained"
          onClick={handleSave}
          disableElevation
          disabled={categoriasFinal.length === 0 || loadingCats}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}