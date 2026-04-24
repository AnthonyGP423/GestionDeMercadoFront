import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useToast } from "../../../../components/ui/Toast";
import cuotasApi, { CuotaMasivaRequest } from "../../../../api/admin/cuotasApi";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  periodoDefault: string;
}

const bloques = ["A", "B", "C", "D"];

export default function CuotaMasivaModal({
  open,
  onClose,
  onSuccess,
  periodoDefault,
}: Props) {
  const { showToast } = useToast();

  const [form, setForm] = useState<CuotaMasivaRequest>({
    periodo: periodoDefault,
    fechaVencimiento: "",
    montoCuota: 0,
    bloque: "",
    idCategoriaStand: undefined,
  });

  const [saving, setSaving] = useState(false);

  const handleChange =
    (field: keyof CuotaMasivaRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]:
          field === "montoCuota"
            ? Number(value)
            : value === "" ? undefined : value,
      }));
    };

  const handleSubmit = async () => {
    try {
      if (!form.periodo || !form.montoCuota) {
        showToast("Periodo y monto de cuota son obligatorios.", "warning");
        return;
      }
      setSaving(true);
      await cuotasApi.generarCuotasMasivo(form);
      showToast("Cuotas generadas correctamente.", "success");
      setSaving(false);
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setSaving(false);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudieron generar las cuotas. Revisa los datos.",
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generar cuotas masivo</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={2}>
          <TextField
            label="Periodo (AAAA-MM)"
            value={form.periodo}
            onChange={handleChange("periodo")}
            fullWidth
          />
          <TextField
            label="Fecha de vencimiento"
            type="date"
            value={form.fechaVencimiento || ""}
            onChange={handleChange("fechaVencimiento")}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Monto de la cuota (S/.)"
            type="number"
            value={form.montoCuota}
            onChange={handleChange("montoCuota")}
            fullWidth
          />
          <TextField
            select
            label="Bloque (opcional)"
            value={form.bloque || ""}
            onChange={handleChange("bloque")}
            fullWidth
          >
            <MenuItem value="">Todos los bloques</MenuItem>
            {bloques.map((b) => (
              <MenuItem key={b} value={b}>
                Bloque {b}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Id categoría stand (opcional)"
            type="number"
            value={form.idCategoriaStand || ""}
            onChange={handleChange("idCategoriaStand")}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            borderRadius: "999px",
            px: 3,
            textTransform: "none",
          }}
        >
          Generar cuotas
        </Button>
      </DialogActions>
    </Dialog>
  );
}