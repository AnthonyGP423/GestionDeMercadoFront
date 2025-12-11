import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import cuotasApi, { CuotaResponseDto } from "../../../../api/cuotasApi";
import { useToast } from "../../../../components/ui/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  stand: {
    idStand: number;
    nombre: string;
  };
}

export default function HistorialCuotasModal({
  open,
  onClose,
  stand,
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cuotas, setCuotas] = useState<CuotaResponseDto[]>([]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const list = await cuotasApi.listarCuotasPorStandAdmin(
          stand.idStand,
          0,
          50
        );
        setCuotas(list);
      } catch (err: any) {
        console.error(err);
        showToast(
          err?.response?.data?.mensaje ||
            "No se pudo cargar el historial de cuotas.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, stand, showToast]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Historial de cuotas — {stand.nombre}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Periodo</TableCell>
                <TableCell>Cuota (S/.)</TableCell>
                <TableCell>Pagado</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Vence</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cuotas.map((c) => (
                <TableRow key={c.idCuota}>
                  <TableCell>{c.periodo}</TableCell>
                  <TableCell>
                    S/. {Number(c.montoCuota || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    S/. {Number(c.montoPagado || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    S/. {Number(c.saldoPendiente || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{c.fechaVencimiento}</TableCell>
                  <TableCell>{c.estado}</TableCell>
                </TableRow>
              ))}
              {cuotas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Sin cuotas registradas para este stand.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}