import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export interface StandOption {
  idStand: number;
  nombre: string;
  bloque: string;
  numero: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  stands: StandOption[];
  periodoDefault?: string;
  onSubmit: (data: {
    idStand: number;
    periodo: string;
    fechaVencimiento?: string;
    montoCuota: number;
  }) => void;
}

function normalizeBloque(b?: string) {
  return String(b ?? "").trim().toUpperCase();
}

// Convierte "503" -> 503 para ordenar numéricamente (si no es número, deja Infinity)
function numeroToInt(n?: string) {
  const v = String(n ?? "").trim();
  const asInt = parseInt(v, 10);
  return Number.isFinite(asInt) ? asInt : Number.POSITIVE_INFINITY;
}

// ✅ Label que quieres: "F-503 — Abarrotes Doña Carmen"
function standLabel(s: StandOption) {
  const bloque = normalizeBloque(s.bloque);
  const numero = String(s.numero ?? "").trim();
  const nombre = String(s.nombre ?? "").trim();
  return `${bloque}-${numero} — ${nombre}`;
}

// 🔎 Búsqueda por nombre, bloque, número, "F-503"
const filterOptions = createFilterOptions<StandOption>({
  stringify: (option) => {
    const bloque = normalizeBloque(option.bloque);
    const numero = String(option.numero ?? "").trim();
    const nombre = String(option.nombre ?? "").trim();
    return `${nombre} ${bloque} ${numero} ${bloque}-${numero}`;
  },
  trim: true,
});

export default function CuotaStandModal({
  open,
  onClose,
  stands,
  periodoDefault,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    idStand: 0,
    periodo: periodoDefault ?? "",
    fechaVencimiento: "",
    montoCuota: "",
  });

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        periodo: periodoDefault ?? prev.periodo ?? "",
      }));
    }
  }, [open, periodoDefault]);

  // ✅ Orden: bloque ASC, número ASC, nombre ASC
  const standsSorted = useMemo(() => {
    const copy = [...(stands ?? [])];

    copy.sort((a, b) => {
      const ba = normalizeBloque(a.bloque);
      const bb = normalizeBloque(b.bloque);

      const cmpBloque = ba.localeCompare(bb, "es", { sensitivity: "base" });
      if (cmpBloque !== 0) return cmpBloque;

      const na = numeroToInt(a.numero);
      const nb = numeroToInt(b.numero);
      if (na !== nb) return na - nb;

      // desempate: nombre
      const an = String(a.nombre ?? "").trim();
      const bn = String(b.nombre ?? "").trim();
      return an.localeCompare(bn, "es", { sensitivity: "base" });
    });

    return copy;
  }, [stands]);

  const selectedStand = useMemo(() => {
    if (!form.idStand) return null;
    return standsSorted.find((s) => s.idStand === Number(form.idStand)) ?? null;
  }, [form.idStand, standsSorted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    const monto = parseFloat(String(form.montoCuota).replace(",", "."));
    if (!form.idStand || !form.periodo || isNaN(monto) || monto <= 0) return;

    onSubmit({
      idStand: Number(form.idStand),
      periodo: form.periodo,
      fechaVencimiento: form.fechaVencimiento || undefined,
      montoCuota: monto,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Crear cuota individual
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* ✅ Stand con búsqueda + label "BLOQUE-NÚMERO — NOMBRE" */}
          <Autocomplete
            options={standsSorted}
            value={selectedStand}
            onChange={(_, newValue) => {
              setForm((prev) => ({
                ...prev,
                idStand: newValue ? newValue.idStand : 0,
              }));
            }}
            filterOptions={filterOptions}
            getOptionLabel={(option) => standLabel(option)}
            isOptionEqualToValue={(option, value) =>
              option.idStand === value.idStand
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Stand"
                placeholder="Escribe para buscar (nombre, bloque, número o F-503)"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.idStand}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  {standLabel(option)}
                </Typography>
              </Box>
            )}
          />

          <TextField
            fullWidth
            label="Periodo (ej. 2025-01)"
            name="periodo"
            value={form.periodo}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            type="date"
            label="Fecha de vencimiento"
            name="fechaVencimiento"
            value={form.fechaVencimiento}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Monto de la cuota (S/)"
            name="montoCuota"
            value={form.montoCuota}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" color="success" onClick={handleConfirm}>
          Guardar cuota
        </Button>
      </DialogActions>
    </Dialog>
  );
}