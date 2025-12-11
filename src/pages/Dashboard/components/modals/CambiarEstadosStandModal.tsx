import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import { EstadoStand } from "../../../../api/standsAdminApi";
import React from "react";

interface Props {
  open: boolean;
  current: EstadoStand;
  onClose: () => void;
  onSubmit: (estado: EstadoStand) => void;
}

export default function CambiarEstadoStandModal({
  open,
  current,
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = React.useState<EstadoStand>(current);

  React.useEffect(() => {
    setValue(current);
  }, [current, open]);

  const handleSave = () => {
    onSubmit(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cambiar estado del stand</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Elige el estado operativo actual del stand. El estado{" "}
          <strong>CLAUSURADO</strong> se reserva para casos especiales
          (sanidad, deudas, etc.).
        </Typography>

        <Stack>
          <RadioGroup
            value={value}
            onChange={(e) => setValue(e.target.value as EstadoStand)}
          >
            <FormControlLabel
              value="ABIERTO"
              control={<Radio color="success" />}
              label="ABIERTO"
            />
            <FormControlLabel
              value="CERRADO"
              control={<Radio color="primary" />}
              label="CERRADO"
            />
            <FormControlLabel
              value="CLAUSURADO"
              control={<Radio color="error" />}
              label="CLAUSURADO"
            />
          </RadioGroup>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}