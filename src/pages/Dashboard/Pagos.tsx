import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";

import { useState } from "react";
import { useToast } from "../../components/ui/Toast";
import PaymentModal from "./components/modals/PagosModal";

type EstadoPago = "Pendiente" | "Pagado" | "Atrasado";

interface PagoRow {
  id: number;
  bloque: string;
  numero: string;
  nombreComercial: string;
  categoria: string;
  periodo: string; // ej: 2025-01
  montoCuota: number;
  fechaVencimiento: string; // YYYY-MM-DD
  estado: EstadoPago;
  fechaPago?: string;
  medioPago?: string;
}

export default function Pagos() {
  const { showToast } = useToast();

  // 🔹 Datos de ejemplo
  const [pagos, setPagos] = useState<PagoRow[]>([
    {
      id: 1,
      bloque: "A",
      numero: "101",
      nombreComercial: "Frutas Don José",
      categoria: "Frutas y Verduras",
      periodo: "2025-01",
      montoCuota: 450.0,
      fechaVencimiento: "2025-01-10",
      estado: "Pagado",
      fechaPago: "2025-01-08",
      medioPago: "Transferencia",
    },
    {
      id: 2,
      bloque: "B",
      numero: "204",
      nombreComercial: "Carnicería La Selecta",
      categoria: "Carnes",
      periodo: "2025-01",
      montoCuota: 520.0,
      fechaVencimiento: "2025-01-10",
      estado: "Pendiente",
    },
    {
      id: 3,
      bloque: "A",
      numero: "115",
      nombreComercial: "Abarrotes El Ahorro",
      categoria: "Abarrotes",
      periodo: "2024-12",
      montoCuota: 380.0,
      fechaVencimiento: "2024-12-10",
      estado: "Atrasado",
    },
  ]);

  // 🔹 Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("Todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // 🔹 Modal de registrar pago
  const [openModal, setOpenModal] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<PagoRow | null>(
    null
  );

  const handleAbrirModal = (row: PagoRow) => {
    setPagoSeleccionado(row);
    setOpenModal(true);
  };

  const handleRegistrarPago = (data: any) => {
    if (!pagoSeleccionado) return;

    setPagos((prev) =>
      prev.map((p) =>
        p.id === pagoSeleccionado.id
          ? {
              ...p,
              estado: "Pagado",
              fechaPago: data.fechaPago,
              medioPago: data.medioPago,
            }
          : p
      )
    );

    showToast("Pago registrado correctamente", "success");
  };

  // 🔹 Filtro real
  const pagosFiltrados = pagos.filter((p) => {
    const coincidePeriodo =
      filtroPeriodo === "Todos" || p.periodo === filtroPeriodo;

    const coincideEstado =
      filtroEstado === "Todos" || p.estado === filtroEstado;

    const texto = `${p.nombreComercial} ${p.bloque} ${p.numero}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    return coincidePeriodo && coincideEstado && coincideBusqueda;
  });

  const renderEstadoChip = (estado: EstadoPago) => {
    const mapColor: Record<EstadoPago, "success" | "warning" | "error"> = {
      Pagado: "success",
      Pendiente: "warning",
      Atrasado: "error",
    };

    return <Chip label={estado} color={mapColor[estado]} size="small" />;
  };

  // Sacamos lista de periodos únicos
  const periodosUnicos = Array.from(new Set(pagos.map((p) => p.periodo)));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Pagos de Stands
      </Typography>

      {/* FILTROS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {/* Buscar */}
        <FormControl sx={{ flex: 1, minWidth: 220 }}>
          <OutlinedInput
            placeholder="Buscar por nombre de stand, bloque o número"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
        </FormControl>

        {/* Periodo */}
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Periodo</InputLabel>
          <Select
            label="Periodo"
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            {periodosUnicos.map((per) => (
              <MenuItem key={per} value={per}>
                {per}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Estado */}
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Pagado">Pagado</MenuItem>
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Atrasado">Atrasado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABLA */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f7f9fb" }}>
                <TableCell>
                  <strong>Bloque</strong>
                </TableCell>
                <TableCell>
                  <strong>Número</strong>
                </TableCell>
                <TableCell>
                  <strong>Nombre comercial</strong>
                </TableCell>
                <TableCell>
                  <strong>Categoría</strong>
                </TableCell>
                <TableCell>
                  <strong>Periodo</strong>
                </TableCell>
                <TableCell>
                  <strong>Cuota (S/.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Vence</strong>
                </TableCell>
                <TableCell>
                  <strong>Estado</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pagosFiltrados.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.bloque}</TableCell>
                  <TableCell>{row.numero}</TableCell>
                  <TableCell>{row.nombreComercial}</TableCell>
                  <TableCell>{row.categoria}</TableCell>
                  <TableCell>{row.periodo}</TableCell>
                  <TableCell>S/. {row.montoCuota.toFixed(2)}</TableCell>
                  <TableCell>{row.fechaVencimiento}</TableCell>
                  <TableCell>{renderEstadoChip(row.estado)}</TableCell>

                  <TableCell align="right">
                    {/* Ver detalle (a futuro podrías llevar a una vista tipo StandDetalle) */}
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>

                    {/* Registrar pago si no está pagado */}
                    {row.estado !== "Pagado" && (
                      <IconButton
                        color="success"
                        onClick={() => handleAbrirModal(row)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {pagosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MODAL REGISTRAR PAGO */}
      <PaymentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleRegistrarPago}
        dataPago={pagoSeleccionado}
      />
    </Box>
  );
}
