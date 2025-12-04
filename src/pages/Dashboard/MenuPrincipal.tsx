import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
} from "@mui/material";

import StoreIcon from "@mui/icons-material/Store";
import PaidIcon from "@mui/icons-material/Paid";
import WarningIcon from "@mui/icons-material/Warning";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

export default function Principal() {
  const navigate = useNavigate();

  // Datos de ejemplo
  const resumen = {
    standsTotales: 120,
    standsOcupados: 97,
    standsLibres: 23,
    pagosMes: 12540,
    morosos: 18,
  };

  const ultimosPagos = [
    {
      stand: "Frutas Don José",
      bloque: "A",
      numero: "101",
      periodo: "2025-01",
      monto: 450.0,
      fechaPago: "2025-01-08",
    },
    {
      stand: "Carnicería La Selecta",
      bloque: "B",
      numero: "204",
      periodo: "2025-01",
      monto: 520.0,
      fechaPago: "2025-01-07",
    },
    {
      stand: "Abarrotes El Ahorro",
      bloque: "A",
      numero: "115",
      periodo: "2024-12",
      monto: 380.0,
      fechaPago: "2024-12-09",
    },
  ];

  const morosos = [
    {
      stand: "Verduras La Ñusta",
      bloque: "C",
      numero: "310",
      periodo: "2025-01",
      deuda: 400.0,
    },
    {
      stand: "Pollos al Carbón Leo",
      bloque: "D",
      numero: "12",
      periodo: "2024-12",
      deuda: 600.0,
    },
  ];

  // Helper para estilos de tarjetas de resumen
  const cardStyle = {
    p: 3,
    borderRadius: 3,
    flex: 1, // Esto hace que todas las tarjetas tengan el mismo ancho
    minWidth: "200px", // Evita que se aplasten demasiado en pantallas pequeñas
  };

  return (
    <Box>
      {/* TÍTULO */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Panel general del mercado
        </Typography>
        <Typography color="text.secondary">
          Resumen operativo del día
        </Typography>
      </Stack>

      {/* --- SECCIÓN 1: TARJETAS DE RESUMEN --- */}
      {/* Usamos Stack direction="row" que cambia a "column" en móviles */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Totales */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <StoreIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Stands Totales
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            {resumen.standsTotales}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {resumen.standsOcupados} ocupados / {resumen.standsLibres} libres
          </Typography>
        </Paper>

        {/* Card 2: Pagos */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PaidIcon sx={{ mr: 1, fontSize: 30 }} color="success" />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Pagos del Mes
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            S/. {resumen.pagosMes.toLocaleString("es-PE")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresos por cuotas
          </Typography>
        </Paper>

        {/* Card 3: Morosos */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <WarningIcon sx={{ mr: 1, fontSize: 30 }} color="warning" />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Morosos
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            {resumen.morosos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cuotas vencidas
          </Typography>
        </Paper>

        {/* Card 4: Cumplimiento */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AssignmentTurnedInIcon sx={{ mr: 1, fontSize: 30 }} color="info" />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Cumplimiento
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            78%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Al día en sus pagos
          </Typography>
        </Paper>
      </Stack>

      {/* --- SECCIÓN 2: TABLAS (Últimos Pagos y Morosos) --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" }, // En pantallas grandes: fila, en chicas: columna
          gap: 3,
        }}
      >
        {/* TABLA IZQUIERDA: Últimos Pagos (Ocupa más espacio, flex: 7) */}
        <Paper sx={{ p: 3, borderRadius: 3, flex: 7 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Últimos pagos registrados
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/dashboard/pagos")}
            >
              Ver todos
            </Button>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Stand</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ultimosPagos.map((p, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{p.stand}</TableCell>
                  <TableCell
                    sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                  >
                    {p.bloque}-{p.numero}
                  </TableCell>
                  <TableCell>{p.periodo}</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: "bold" }}>
                    S/. {p.monto.toFixed(2)}
                  </TableCell>
                  <TableCell>{p.fechaPago}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* TABLA DERECHA: Morosos (Ocupa menos espacio, flex: 5) */}
        <Paper sx={{ p: 3, borderRadius: 3, flex: 5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Stands con deuda
            </Typography>
            <Chip
              label={`${morosos.length} críticos`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Stand</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell align="right">Deuda</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {morosos.map((m, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Box sx={{ fontWeight: 500 }}>{m.stand}</Box>
                    <Typography variant="caption" color="text.secondary">
                      {m.bloque}-{m.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={m.periodo} size="small" color="warning" />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "error.main", fontWeight: "bold" }}
                  >
                    S/. {m.deuda.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              onClick={() => navigate("/dashboard/pagos")}
            >
              Gestionar Deudas
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
