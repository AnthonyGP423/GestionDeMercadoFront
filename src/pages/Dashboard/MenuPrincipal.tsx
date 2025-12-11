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
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

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

// ---- NUEVOS DTOs PARA MÉTRICAS EXTRA ----
// Ajusta los nombres a lo que devuelva tu backend real
interface UsuarioAdminDto {
  id: number;
  email: string;
  estado: string;      // ACTIVO / BAJA / SUSPENDIDO
  rolNombre?: string;  // ADMIN / SUPERVISOR / SOCIO / etc. (puede venir null)
}

interface ProductoAdminDto {
  idProducto: number;
  nombre: string;
  visible: boolean;        // si tu campo se llama distinto, cámbialo aquí
  estado: string;          // ACTIVO / INACTIVO
  categoriaNombre?: string;
}

interface IncidenciaAdminDto {
  idIncidencia: number;
  titulo: string;
  estado: string;         // ABIERTA / EN_PROCESO / CERRADA
  severidad?: string;     // BAJA / MEDIA / ALTA
  bloque?: string;
  numeroStand?: string;
  fechaRegistro: string;
}

// Helper para asegurarnos de tener siempre un array, aunque el backend devuelva Page<>
function toArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

export default function Principal() {
  const navigate = useNavigate();

  const [indicadores, setIndicadores] = useState<IndicadoresCuotas | null>(null);
  const [morosos, setMorosos] = useState<CuotaDto[]>([]);
  const [ultimosPagos, setUltimosPagos] = useState<CuotaDto[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);

  // NUEVOS ESTADOS
  const [usuariosAdmin, setUsuariosAdmin] = useState<UsuarioAdminDto[]>([]);
  const [productosAdmin, setProductosAdmin] = useState<ProductoAdminDto[]>([]);
  const [incidenciasAdmin, setIncidenciasAdmin] = useState<IncidenciaAdminDto[]>([]);

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

      // CADA REQUEST EN SU PROPIO TRY/CATCH PARA QUE NINGUNO ROMPA EL PANEL
      try {
        const res = await axios.get<IndicadoresCuotas>(
          `${API_BASE_URL}/api/v1/admin/cuotas/indicadores`,
          { headers, params: { periodo: periodoActual } }
        );
        setIndicadores(res.data);
      } catch (err) {
        console.error("Error cargando indicadores de cuotas:", err);
        // si falla, dejamos indicadores en null y seguimos
      }

      try {
        const res = await axios.get<CuotaDto[]>(
          `${API_BASE_URL}/api/v1/admin/cuotas/morosos`,
          { headers, params: { periodo: periodoActual } }
        );
        setMorosos(toArray<CuotaDto>(res.data));
      } catch (err) {
        console.error("Error cargando morosos:", err);
        setMorosos([]);
      }

      try {
        const res = await axios.get<Stand[]>(`${API_BASE_URL}/api/v1/stands`, {
          headers,
        });
        setStands(toArray<Stand>(res.data));
      } catch (err) {
        console.error("Error cargando stands:", err);
        setStands([]);
      }

      try {
        const res = await axios.get<CuotaDto[]>(
          `${API_BASE_URL}/api/v1/admin/cuotas/ultimos-pagos`,
          { headers, params: { limit: 5 } }
        );
        setUltimosPagos(toArray<CuotaDto>(res.data));
      } catch (err) {
        console.error("Error cargando últimos pagos:", err);
        setUltimosPagos([]);
      }

      // ---- NUEVOS: USUARIOS / PRODUCTOS / INCIDENCIAS ----

      try {
        const res = await axios.get<any>(
          `${API_BASE_URL}/api/v1/admin/usuarios`,
          { headers }
        );
        setUsuariosAdmin(toArray<UsuarioAdminDto>(res.data));
      } catch (err) {
        console.error("Error cargando usuarios admin:", err);
        setUsuariosAdmin([]);
      }

      try {
        const res = await axios.get<any>(
          `${API_BASE_URL}/api/v1/admin/productos`,
          { headers }
        );
        setProductosAdmin(toArray<ProductoAdminDto>(res.data));
      } catch (err) {
        console.error("Error cargando productos admin:", err);
        setProductosAdmin([]);
      }

      try {
        const res = await axios.get<any>(
          `${API_BASE_URL}/api/v1/admin/incidencias`,
          { headers }
        );
        setIncidenciasAdmin(toArray<IncidenciaAdminDto>(res.data));
      } catch (err) {
        console.error("Error cargando incidencias admin:", err);
        setIncidenciasAdmin([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [periodoActual]);

  // Derivados base de stands/cuotas
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

  // Derivados financieros
  const deudaTotalMorosos = useMemo(
    () =>
      morosos.reduce((acc, m) => acc + Number(m.saldoPendiente || 0), 0),
    [morosos]
  );

  const totalPagadoUltimos = useMemo(
    () =>
      ultimosPagos.reduce((acc, p) => acc + Number(p.montoPagado || 0), 0),
    [ultimosPagos]
  );

  // ==== NUEVOS DERIVADOS: USUARIOS / PRODUCTOS / INCIDENCIAS ====

  const totalUsuarios = usuariosAdmin.length;
  const usuariosActivos = usuariosAdmin.filter(
    (u) => (u.estado || "").toUpperCase() === "ACTIVO"
  ).length;
  const usuariosNoActivos = totalUsuarios - usuariosActivos;

  const usuariosPorRol = useMemo(() => {
    const mapa: Record<string, number> = {};
    usuariosAdmin.forEach((u) => {
      const rol = (u.rolNombre || "OTRO").toUpperCase();
      mapa[rol] = (mapa[rol] || 0) + 1;
    });
    return mapa;
  }, [usuariosAdmin]);

  const totalProductos = productosAdmin.length;
  const productosVisibles = productosAdmin.filter((p) => p.visible).length;
  const productosOcultos = totalProductos - productosVisibles;

  const categoriasUnicas = useMemo(() => {
    const set = new Set<string>();
    productosAdmin.forEach((p) => {
      if (p.categoriaNombre) set.add(p.categoriaNombre);
    });
    return Array.from(set);
  }, [productosAdmin]);

  const totalIncidencias = incidenciasAdmin.length;
  const incidenciasAbiertas = incidenciasAdmin.filter(
    (i) => (i.estado || "").toUpperCase() !== "CERRADA"
  );
  const incidenciasCerradas = totalIncidencias - incidenciasAbiertas.length;

  const incidenciasRecientes = [...incidenciasAdmin]
    .sort((a, b) =>
      (a.fechaRegistro || "").localeCompare(b.fechaRegistro || "") * -1
    )
    .slice(0, 5);

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
        <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
          Vista ejecutiva del mercado mayorista para el periodo{" "}
          <strong>{periodoActual}</strong>: ocupación, morosidad, usuarios,
          catálogo de productos e incidencias.
        </Typography>
      </Stack>

      {/* TARJETAS DE RESUMEN (fila 1: stands/cuotas) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.3fr 1.3fr 1.2fr 1.2fr",
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        {/* Card 1: Stands registrados */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Stands registrados
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
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
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
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
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
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
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
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

      {/* TARJETAS DE RESUMEN (fila 2: usuarios / productos / incidencias) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.2fr 1.2fr 1.3fr",
          },
          gap: 2.5,
          mb: 4,
        }}
      >
        {/* Card Usuarios */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Usuarios del sistema
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Administradores, supervisores y socios
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                bgcolor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PeopleIcon sx={{ fontSize: 22, color: "#2563eb" }} />
            </Box>
          </Stack>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.1, mb: 0.5 }}
          >
            {totalUsuarios}
          </Typography>

          <Stack direction="row" spacing={1.5} mt={1}>
            <Chip
              label={`${usuariosActivos} activos`}
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
            <Chip
              label={`${usuariosNoActivos} no activos`}
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" mt={1.5}>
            {Object.entries(usuariosPorRol)
              .slice(0, 3)
              .map(([rol, count]) => (
                <Chip
                  key={rol}
                  size="small"
                  label={`${rol}: ${count}`}
                  sx={{
                    bgcolor: "#f3f4f6",
                    color: "#4b5563",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 999,
                  }}
                />
              ))}
          </Stack>
        </Paper>

        {/* Card Productos */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Catálogo de productos
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Productos publicados en el mercado
              </Typography>
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                bgcolor: "#fefce8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 22, color: "#eab308" }} />
            </Box>
          </Stack>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.1, mb: 0.5 }}
          >
            {totalProductos}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {categoriasUnicas.length} categorías distintas.
          </Typography>

          <Stack direction="row" spacing={1.5} mt={1.5}>
            <Chip
              label={`${productosVisibles} visibles`}
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
            <Chip
              label={`${productosOcultos} ocultos`}
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

        {/* Card Incidencias */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Incidencias del mercado
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Operación, seguridad y servicios
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
              <ReportProblemIcon sx={{ fontSize: 22, color: "#f97316" }} />
            </Box>
          </Stack>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.1, mb: 0.5 }}
          >
            {totalIncidencias}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {incidenciasAbiertas.length} abiertas · {incidenciasCerradas} cerradas
          </Typography>

          <Stack direction="row" spacing={1.5} mt={1.5}>
            <Chip
              label="Ver incidencias"
              size="small"
              onClick={() => navigate("/dashboard/incidencias")}
              sx={{
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "#eff6ff",
                color: "#1d4ed8",
                cursor: "pointer",
              }}
            />
          </Stack>
        </Paper>
      </Box>

      {/* SECCIÓN DE TABLAS: Pagos / Morosos */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* IZQUIERDA: Últimos pagos */}
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

        {/* DERECHA: Morosos */}
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

      {/* SECCIÓN EXTRA: Incidencias recientes */}
      <Paper
        sx={{
          ...cardStyle,
          p: 3,
          mb: 4,
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
              Incidencias recientes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Últimos casos registrados en el sistema.
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/dashboard/incidencias")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Ver todas
          </Button>
        </Box>

        {incidenciasRecientes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No se encontraron incidencias para mostrar.
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
                <TableCell>Incidencia</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidenciasRecientes.map((i) => (
                <TableRow key={i.idIncidencia} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, fontSize: 13 }}
                    >
                      {i.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {i.bloque && i.numeroStand
                        ? `${i.bloque}-${i.numeroStand}`
                        : "Sin ubicación"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={i.estado}
                      size="small"
                      sx={{
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        bgcolor:
                          (i.estado || "").toUpperCase() === "CERRADA"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          (i.estado || "").toUpperCase() === "CERRADA"
                            ? "#166534"
                            : "#b91c1c",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {i.fechaRegistro}
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
          * Datos obtenidos desde <code>/api/v1/admin/incidencias</code>.
        </Typography>
      </Paper>
    </Box>
  );
}