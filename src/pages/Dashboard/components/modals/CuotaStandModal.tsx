import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    const monto = parseFloat(form.montoCuota.replace(",", "."));
    if (!form.idStand || !form.periodo || isNaN(monto) || monto <= 0) {
      return;
    }

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
          <TextField
            select
            fullWidth
            label="Stand"
            name="idStand"
            value={form.idStand}
            onChange={handleChange}
          >
            {stands.map((s) => (
              <MenuItem key={s.idStand} value={s.idStand}>
                {s.nombre} ({s.bloque}-{s.numero})
              </MenuItem>
            ))}
          </TextField>

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
