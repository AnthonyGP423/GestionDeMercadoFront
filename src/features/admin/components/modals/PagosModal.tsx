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
  // dataPago debería ser el CuotaResponseDto del backend
  dataPago?: any;
  // Enviamos un DTO tipo PagoCuotaRequestDto
  onSubmit: (data: {
    montoPagado: number;
    medioPago: string;
    referenciaPago?: string;
    fechaPago: string;
    observaciones?: string;
  }) => void;
}

export default function PaymentModal({
  open,
  onClose,
  onSubmit,
  dataPago,
}: Props) {
  const total = Number(dataPago?.montoCuota ?? 0);
  const pagado = Number(dataPago?.montoPagado ?? 0);
  const saldo = total - pagado;

  const [form, setForm] = useState({
    fechaPago: new Date().toISOString().split("T")[0],
    medioPago: "EFECTIVO",
    referenciaPago: "",
    observaciones: "",
    montoPagado: saldo > 0 ? saldo.toFixed(2) : "",
  });

  const [montoError, setMontoError] = useState<string | null>(null);

  const medios = ["EFECTIVO", "TRANSFERENCIA", "YAPE/PLIN", "TARJETA"];

  useEffect(() => {
    if (open) {
      const nuevoSaldo = saldo > 0 ? saldo.toFixed(2) : "";
      setForm({
        fechaPago: new Date().toISOString().split("T")[0],
        medioPago: "EFECTIVO",
        referenciaPago: "",
        observaciones: "",
        montoPagado: nuevoSaldo,
      });
      setMontoError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dataPago]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "montoPagado") {
      const num = parseFloat(value.replace(",", "."));
      if (isNaN(num) || num <= 0) {
        setMontoError("Ingresa un monto mayor a 0");
      } else if (num > saldo + 0.001) {
        setMontoError(`El monto no puede superar el saldo S/ ${saldo.toFixed(2)}`);
      } else {
        setMontoError(null);
      }
    }
  };

  const handleConfirm = () => {
    const num = parseFloat(form.montoPagado.replace(",", "."));
    if (isNaN(num) || num <= 0 || num > saldo + 0.001) {
      setMontoError(
        `Monto inválido. El saldo actual es S/ ${saldo.toFixed(2)}`
      );
      return;
    }

    onSubmit({
      montoPagado: num,
      medioPago: form.medioPago,
      referenciaPago: form.referenciaPago || undefined,
      fechaPago: form.fechaPago,
      observaciones: form.observaciones || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>Registrar pago</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Resumen del cobro */}
          <Box sx={{ bgcolor: "#f9fafb", p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Stand:{" "}
              <b>
                {dataPago?.nombreStand ??
                  dataPago?.nombreComercial ??
                  "-"}
              </b>{" "}
              ({dataPago?.bloque}-{dataPago?.numeroStand ?? dataPago?.numero})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Periodo: <b>{dataPago?.periodo}</b>
            </Typography>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Total cuota: <b>S/ {total.toFixed(2)}</b>
              </Typography>
              <Typography variant="body2">
                Pagado: <b>S/ {pagado.toFixed(2)}</b>
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#16a34a", mt: 0.5 }}
              >
                Saldo pendiente: S/ {saldo.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Monto a pagar ahora */}
          <TextField
            fullWidth
            label="Monto a pagar ahora (S/)"
            name="montoPagado"
            value={form.montoPagado}
            onChange={handleChange}
            error={!!montoError}
            helperText={montoError ?? "Puedes pagar el saldo total o una parte."}
          />

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
            label="Nro. operación / referencia"
            name="referenciaPago"
            value={form.referenciaPago}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Observaciones (opcional)"
            name="observaciones"
            value={form.observaciones}
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
          color="success"
          onClick={handleConfirm}
          disabled={!!montoError || saldo <= 0}
        >
          Confirmar pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
