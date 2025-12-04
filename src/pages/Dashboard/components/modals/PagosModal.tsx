import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  dataPago?: any; // Datos del pago a procesar
}

export default function PaymentModal({
  open,
  onClose,
  onSubmit,
  dataPago,
}: Props) {
  const [form, setForm] = useState({
    fechaPago: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
    medioPago: "Efectivo",
    nota: "",
  });

  const medios = ["Efectivo", "Transferencia", "Yape/Plin", "Tarjeta"];

  useEffect(() => {
    if (open) {
      // Reiniciar formulario al abrir
      setForm({
        fechaPago: new Date().toISOString().split("T")[0],
        medioPago: "Efectivo",
        nota: "",
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>Registrar Pago</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Resumen del cobro */}
          <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Stand: <b>{dataPago?.stand}</b> ({dataPago?.bloque}-
              {dataPago?.numero})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Periodo: <b>{dataPago?.periodo}</b>
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: "bold", mt: 1 }}
            >
              Total: S/. {dataPago?.montoCuota.toFixed(2)}
            </Typography>
          </Box>

          {/* Formulario */}
          <TextField
            fullWidth
            type="date"
            label="Fecha de pago"
            name="fechaPago"
            value={form.fechaPago}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            fullWidth
            label="Medio de pago"
            name="medioPago"
            value={form.medioPago}
            onChange={handleChange}
          >
            {medios.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Nota / Nro. Operación (Opcional)"
            name="nota"
            value={form.nota}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(form)}
          color="success"
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
