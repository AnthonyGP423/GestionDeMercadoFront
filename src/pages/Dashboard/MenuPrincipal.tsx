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

        // Llamadas paralelas (4)
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

  // Derivados base
  const totalStandsRegistrados = stands.length;
  const standsActivos = useMemo(
    () => stands.filter((s) => s.estado === "ACTIVO").length,
    [stands]
  );
  const standsNoActivos = totalStandsRegistrados - standsActivos;

  const totalStandsConCuota = indicadores?.totalStandsConCuota ?? 0;
  const porcentajeAlDia = indicadores?.porcentajeAlDia ?? 0;
  const porcentajeMorosos = indicadores?.porcentajeMorosos ?? 0;
  const standsAlDia = indicadores?.standsAlDia ?? 0;
  const standsMorosos = indicadores?.standsMorosos ?? 0;

  const bloquesConMorosidad =
    indicadores?.morosidadPorBloque.filter((b) => b.standsMorosos > 0) ?? [];

  // Derivados financieros simples
  const deudaTotalMorosos = useMemo(
    () =>
      morosos.reduce(
        (acc, m) => acc + Number(m.saldoPendiente || 0),
        0
      ),
    [morosos]
  );

  const totalPagadoUltimos = useMemo(
    () =>
      ultimosPagos.reduce(
        (acc, p) => acc + Number(p.montoPagado || 0),
        0
      ),
    [ultimosPagos]
  );

  const cardStyle = {
    p: 3,
    borderRadius: 4,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    bgcolor: "#ffffff",
  };

  if (loading) {
    return (
      <Box
        sx={{
          mt: 6,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 480,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily:
              '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
          }}
        >
          Cargando panel general del mercado...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" sx={{ mb: 1, fontWeight: 600 }}>
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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily:
              '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
          }}
        >
          Panel general del mercado
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
          Vista ejecutiva del mercado mayorista para el periodo{" "}
          <strong>{periodoActual}</strong>: ocupación, morosidad y flujo de
          pagos.
        </Typography>
      </Stack>

      {/* TARJETAS DE RESUMEN (grid) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.3fr 1.3fr 1.2fr 1.2fr",
          },
          gap: 2.5,
          mb: 4,
        }}
      >
        {/* Card 1: Stands registrados / activos */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Stands registrados
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af" }}
              >
                Totales en el mercado
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                bgcolor: "#ecfdf3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StoreIcon sx={{ fontSize: 22, color: "#16a34a" }} />
            </Box>
          </Stack>

          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.1, mb: 0.5 }}
          >
            {totalStandsRegistrados}
          </Typography>

          <Stack direction="row" spacing={2} mt={1}>
            <Chip
              label={`${standsActivos} activos`}
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
            <Chip
              label={`${standsNoActivos} no activos`}
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
          </Stack>
        </Paper>

        {/* Card 2: Stands con cuota */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Stands con cuota
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af" }}
              >
                Periodo {periodoActual}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                bgcolor: "#ecfdf3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PaidIcon sx={{ fontSize: 22, color: "#22c55e" }} />
            </Box>
          </Stack>

          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.1, mb: 0.5 }}
          >
            {totalStandsConCuota}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {standsAlDia} al día · {standsMorosos} morosos
          </Typography>
        </Paper>

        {/* Card 3: Cumplimiento de pagos */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Cumplimiento de pagos
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af" }}
              >
                Morosidad vs al día
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                bgcolor: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AssessmentIcon sx={{ fontSize: 22, color: "#0ea5e9" }} />
            </Box>
          </Stack>

          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "#16a34a", lineHeight: 1.1, mb: 0.5 }}
          >
            {porcentajeAlDia.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Morosidad: {porcentajeMorosos.toFixed(1)}%
          </Typography>

          {/* Barrita de proporción simple */}
          <Box sx={{ mt: 1.5 }}>
            <Box
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${porcentajeAlDia}%`,
                  maxWidth: "100%",
                  bgcolor: "#22c55e",
                  transition: "width .3s ease",
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Card 4: Morosidad por bloques / deuda total */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Bloques con morosidad
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af" }}
              >
                Deuda total visible en el periodo
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                bgcolor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon sx={{ fontSize: 22, color: "#f97316" }} />
            </Box>
          </Stack>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#b91c1c", mb: 0.5 }}
          >
            S/. {deudaTotalMorosos.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {bloquesConMorosidad.length} bloques con stands morosos.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {bloquesConMorosidad.slice(0, 3).map((b) => (
              <Chip
                key={b.bloque}
                size="small"
                label={`${b.bloque}: ${b.standsMorosos} morosos`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
            ))}
            {bloquesConMorosidad.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Sin morosidad por bloque.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* SECCIÓN DE TABLAS */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        {/* IZQUIERDA: Últimos pagos (datos reales) */}
        <Paper
          sx={{
            ...cardStyle,
            flex: 7,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Últimos pagos registrados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total mostrado: S/. {totalPagadoUltimos.toFixed(2)}
              </Typography>
            </Box>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/dashboard/pagos")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Ver módulo de pagos
            </Button>
          </Box>

          {ultimosPagos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no se registran pagos para mostrar en esta sección.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontSize: 12,
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    },
                  }}
                >
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
                    <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>
                      {p.nombreStand || `Stand #${p.idStand}`}
                    </TableCell>
                    <TableCell
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      {p.bloque}-{p.numeroStand}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{p.periodo}</TableCell>
                    <TableCell
                      sx={{
                        color: "success.main",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      S/. {Number(p.montoPagado || 0).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {p.fechaPago ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.5, display: "block" }}
          >
            * Datos obtenidos desde{" "}
            <code>/api/v1/admin/cuotas/ultimos-pagos</code>.
          </Typography>
        </Paper>

        {/* DERECHA: Morosos reales del backend */}
        <Paper
          sx={{
            ...cardStyle,
            flex: 5,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Stands con deuda ({periodoActual})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Deuda total: S/. {deudaTotalMorosos.toFixed(2)}
              </Typography>
            </Box>
            <Chip
              label={`${morosos.length} con saldo pendiente`}
              size="small"
              color={morosos.length > 0 ? "error" : "success"}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {morosos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No se encontraron stands morosos para el periodo {periodoActual}.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontSize: 12,
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    },
                  }}
                >
                  <TableCell>Stand</TableCell>
                  <TableCell>Periodo</TableCell>
                  <TableCell align="right">Deuda</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {morosos.map((m) => (
                  <TableRow key={m.idCuota} hover>
                    <TableCell>
                      <Box sx={{ fontWeight: 500, fontSize: 13 }}>
                        {m.nombreStand}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {m.bloque}-{m.numeroStand}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.periodo}
                        size="small"
                        color="warning"
                        sx={{ fontSize: 11, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: "error.main",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      S/. {m.saldoPendiente.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              onClick={() => navigate("/dashboard/pagos")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Gestionar deudas en módulo de pagos
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}