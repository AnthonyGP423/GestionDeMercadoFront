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
  LinearProgress,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import PaidIcon from "@mui/icons-material/Paid";
import WarningIcon from "@mui/icons-material/Warning";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ----- Tipados según tu backend -----
interface IndicadoresCuotas {
  periodo: string;
  totalStandsConCuota: number;
  standsAlDia: number;
  standsMorosos: number;
  porcentajeAlDia: number;
  porcentajeMorosos: number;
  morosidadPorBloque: {
    bloque: string;
    standsAlDia: number;
    standsMorosos: number;
  }[];
}

// Este DTO aplica tanto para morosos como para últimos pagos
interface CuotaDto {
  idCuota: number;
  idStand: number;
  nombreStand: string;
  bloque: string;
  numeroStand: string;
  periodo: string;
  fechaVencimiento: string | null;
  montoCuota: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
  medioPago: string | null;
  referenciaPago: string | null;
  fechaPago: string | null;
}

interface Stand {
  id: number;
  idPropietario: number;
  nombrePropietario: string;
  idCategoriaStand: number;
  nombreCategoriaStand: string;
  bloque: string;
  numeroStand: string;
  nombreComercial: string;
  descripcionNegocio: string;
  latitud: number;
  longitud: number;
  estado: string; // ACTIVO / CLAUSURADO / etc.
}

export default function Principal() {
  const navigate = useNavigate();

  const [indicadores, setIndicadores] = useState<IndicadoresCuotas | null>(
    null
  );
  const [morosos, setMorosos] = useState<CuotaDto[]>([]);
  const [ultimosPagos, setUltimosPagos] = useState<CuotaDto[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Periodo actual en formato YYYY-MM
  const periodoActual = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró token de sesión. Inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Llamadas paralelas (ahora 4)
        const [indicadoresRes, morososRes, standsRes, ultimosPagosRes] =
          await Promise.all([
            axios.get<IndicadoresCuotas>(
              `${API_BASE_URL}/api/v1/admin/cuotas/indicadores`,
              {
                headers,
                params: { periodo: periodoActual },
              }
            ),
            axios.get<CuotaDto[]>(
              `${API_BASE_URL}/api/v1/admin/cuotas/morosos`,
              {
                headers,
                params: { periodo: periodoActual },
              }
            ),
            axios.get<Stand[]>(`${API_BASE_URL}/api/v1/stands`, { headers }),
            axios.get<CuotaDto[]>(
              `${API_BASE_URL}/api/v1/admin/cuotas/ultimos-pagos`,
              {
                headers,
                params: { limit: 5 },
              }
            ),
          ]);

        setIndicadores(indicadoresRes.data);
        setMorosos(morososRes.data || []);
        setStands(standsRes.data || []);
        setUltimosPagos(ultimosPagosRes.data || []);
      } catch (err: any) {
        console.error("Error cargando dashboard:", err);
        setError(
          err.response?.data?.message ||
            "Ocurrió un error al cargar los datos del panel."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodoActual]);

  // Derivados
  const totalStandsRegistrados = stands.length;
  const totalStandsConCuota = indicadores?.totalStandsConCuota ?? 0;
  const porcentajeAlDia = indicadores?.porcentajeAlDia ?? 0;
  const porcentajeMorosos = indicadores?.porcentajeMorosos ?? 0;
  const standsAlDia = indicadores?.standsAlDia ?? 0;
  const standsMorosos = indicadores?.standsMorosos ?? 0;

  const cardStyle = {
    p: 3,
    borderRadius: 3,
    flex: 1,
    minWidth: "220px",
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Cargando panel general del mercado...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Verifica que el backend esté arriba y que el token sea válido.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* TÍTULO */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Panel general del mercado
        </Typography>
        <Typography color="text.secondary">
          Resumen operativo del periodo <strong>{periodoActual}</strong>
        </Typography>
      </Stack>

      {/* TARJETAS DE RESUMEN */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Stands registrados */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <StoreIcon sx={{ mr: 1, fontSize: 30, color: "#166534" }} />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Stands registrados
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            {totalStandsRegistrados}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stands activos y clausurados dentro del mercado.
          </Typography>
        </Paper>

        {/* Card 2: Stands con cuota */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PaidIcon sx={{ mr: 1, fontSize: 30, color: "#22c55e" }} />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Stands con cuota ({periodoActual})
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            {totalStandsConCuota}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {standsAlDia} al día / {standsMorosos} morosos
          </Typography>
        </Paper>

        {/* Card 3: Cumplimiento */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AssessmentIcon sx={{ mr: 1, fontSize: 30, color: "#0ea5e9" }} />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Cumplimiento de pagos
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            {porcentajeAlDia.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Morosidad: {porcentajeMorosos.toFixed(1)}%
          </Typography>
        </Paper>

        {/* Card 4: Bloques con morosidad */}
        <Paper sx={cardStyle}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <WarningIcon sx={{ mr: 1, fontSize: 30, color: "#f97316" }} />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight="bold"
            >
              Bloques con morosidad
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            {indicadores?.morosidadPorBloque.filter(
              (b) => b.standsMorosos > 0
            ).length ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Distribución por bloque según cuotas pendientes.
          </Typography>
        </Paper>
      </Stack>

      {/* SECCIÓN DE TABLAS */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        {/* IZQUIERDA: Últimos pagos (datos reales) */}
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

          {ultimosPagos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no se registran pagos para mostrar en esta sección.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stand</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Periodo</TableCell>
                  <TableCell>Monto pagado</TableCell>
                  <TableCell>Fecha de pago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ultimosPagos.map((p) => (
                  <TableRow key={p.idCuota} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {p.nombreStand || `Stand #${p.idStand}`}
                    </TableCell>
                    <TableCell
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      {p.bloque}-{p.numeroStand}
                    </TableCell>
                    <TableCell>{p.periodo}</TableCell>
                    <TableCell
                      sx={{ color: "success.main", fontWeight: "bold" }}
                    >
                      S/. {Number(p.montoPagado || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{p.fechaPago ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            * Datos obtenidos en tiempo real desde{" "}
            <code>/api/v1/admin/cuotas/ultimos-pagos</code>.
          </Typography>
        </Paper>

        {/* DERECHA: Morosos reales del backend */}
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
              Stands con deuda ({periodoActual})
            </Typography>
            <Chip
              label={`${morosos.length} con saldo pendiente`}
              size="small"
              color={morosos.length > 0 ? "error" : "success"}
              variant="outlined"
            />
          </Box>

          {morosos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No se encontraron stands morosos para el periodo {periodoActual}.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stand</TableCell>
                  <TableCell>Periodo</TableCell>
                  <TableCell align="right">Deuda</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {morosos.map((m) => (
                  <TableRow key={m.idCuota} hover>
                    <TableCell>
                      <Box sx={{ fontWeight: 500 }}>{m.nombreStand}</Box>
                      <Typography variant="caption" color="text.secondary">
                        {m.bloque}-{m.numeroStand}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={m.periodo} size="small" color="warning" />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "error.main", fontWeight: "bold" }}
                    >
                      S/. {m.saldoPendiente.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              onClick={() => navigate("/dashboard/pagos")}
            >
              Gestionar deudas
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}