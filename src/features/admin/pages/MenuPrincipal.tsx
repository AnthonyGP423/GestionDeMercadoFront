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
  estado: string; // ABIERTO / CERRADO / CLAUSURADO
}

// ==== DTOs ajustados a lo que devuelve tu backend ====

interface UsuarioAdminDto {
  idUsuario: number;
  email: string;
  estado: string; // ACTIVO / BAJA / SUSPENDIDO
  rol: string; // ADMIN / CLIENTE / ...
}

interface ProductoAdminDto {
  idProducto: number;
  nombre: string;
  visibleDirectorio: boolean;
  nombreCategoriaProducto: string | null;
}

interface IncidenciaAdminDto {
  idIncidencia: number;
  titulo: string;
  estado: string; // ABIERTA / EN_PROCESO / CERRADA
  severidad?: string;
  bloque?: string;
  numeroStand?: string;
  fechaRegistro: string;
}

// Helper array/Page
function toArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

// Helper texto categorías
function categoriasPorTexto(count: number): string {
  if (count === 0) return "Sin categorías registradas";
  if (count === 1) return "1 categoría";
  return `${count} categorías`;
}

// Normalizar rol para que no quede en 0
function normalizarRol(raw?: string): string {
  if (!raw) return "OTRO";
  let r = raw.toUpperCase().trim();
  if (r.startsWith("ROLE_")) r = r.replace("ROLE_", "");
  if (r.includes("ADMIN")) return "ADMIN";
  if (r.includes("SUPERVISOR")) return "SUPERVISOR";
  if (r.includes("SOCIO")) return "SOCIO";
  if (r.includes("CLIENTE")) return "CLIENTE";
  if (r.includes("TRABAJADOR") || r.includes("EMPLEADO")) return "TRABAJADOR";
  return r;
}

export default function Principal() {
  const navigate = useNavigate();

  const [indicadores, setIndicadores] = useState<IndicadoresCuotas | null>(null);
  const [morosos, setMorosos] = useState<CuotaDto[]>([]);
  const [ultimosPagos, setUltimosPagos] = useState<CuotaDto[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);

  const [usuariosAdmin, setUsuariosAdmin] = useState<UsuarioAdminDto[]>([]);
  const [productosAdmin, setProductosAdmin] = useState<ProductoAdminDto[]>([]);
  const [incidenciasAdmin, setIncidenciasAdmin] = useState<IncidenciaAdminDto[]>(
    []
  );

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

      const token = localStorage.getItem("token_intranet");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const res = await axios.get<IndicadoresCuotas>(
          `${API_BASE_URL}/api/v1/admin/cuotas/indicadores`,
          { headers, params: { periodo: periodoActual } }
        );
        setIndicadores(res.data);
      } catch (err) {
        console.error("Error cargando indicadores de cuotas:", err);
      }

      try {
        const res = await axios.get<CuotaDto[]>(
          `${API_BASE_URL}/api/v1/admin/cuotas/morosos`,
          { headers, params: { periodo: periodoActual } }
        );
        setMorosos(toArray<CuotaDto>(res.data));
      } catch (err) {
        console.error("Error cargando cuotas con deuda:", err);
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

  // ===== Derivados STANDS / CUOTAS =====
  const totalStandsRegistrados = stands.length;

  const standsAbiertos = useMemo(
    () =>
      stands.filter(
        (s) => (s.estado || "").toUpperCase() === "ABIERTO"
      ).length,
    [stands]
  );
  const standsCerrados = useMemo(
    () =>
      stands.filter(
        (s) => (s.estado || "").toUpperCase() === "CERRADO"
      ).length,
    [stands]
  );
  const standsClausurados = useMemo(
    () =>
      stands.filter(
        (s) => (s.estado || "").toUpperCase() === "CLAUSURADO"
      ).length,
    [stands]
  );
  const otrosStands =
    totalStandsRegistrados -
    standsAbiertos -
    standsCerrados -
    standsClausurados;

  const porcentajeOcupacion =
    totalStandsRegistrados === 0
      ? 0
      : (standsAbiertos / totalStandsRegistrados) * 100;

  const totalStandsConCuota = indicadores?.totalStandsConCuota ?? 0;
  const porcentajeAlDia = indicadores?.porcentajeAlDia ?? 0;
  const porcentajeConDeuda = indicadores?.porcentajeMorosos ?? 0;
  const standsAlDia = indicadores?.standsAlDia ?? 0;
  const standsConDeuda = indicadores?.standsMorosos ?? 0;

  const bloquesConDeuda =
    indicadores?.morosidadPorBloque.filter((b) => b.standsMorosos > 0) ?? [];

  // Derivados financieros
  const deudaTotal = useMemo(
    () =>
      morosos.reduce((acc, m) => acc + Number(m.saldoPendiente || 0), 0),
    [morosos]
  );
  const totalPagadoUltimos = useMemo(
    () =>
      ultimosPagos.reduce((acc, p) => acc + Number(p.montoPagado || 0), 0),
    [ultimosPagos]
  );

  // ===== Derivados USUARIOS / PRODUCTOS / INCIDENCIAS =====

  const totalUsuarios = usuariosAdmin.length;
  const usuariosActivos = usuariosAdmin.filter(
    (u) => (u.estado || "").toUpperCase() === "ACTIVO"
  ).length;
  const usuariosNoActivos = totalUsuarios - usuariosActivos;

  const countRol = (rol: string) =>
    usuariosAdmin.filter((u) => normalizarRol(u.rol) === rol).length;

  const totalAdmin = countRol("ADMIN");
  const totalSupervisor = countRol("SUPERVISOR");
  const totalSocio = countRol("SOCIO");
  const totalCliente = countRol("CLIENTE");
  const totalTrabajador = countRol("TRABAJADOR");

  const totalProductos = productosAdmin.length;
  const productosVisibles = productosAdmin.filter(
    (p) => p.visibleDirectorio === true
  ).length;
  const productosOcultos = totalProductos - productosVisibles;
  const porcentajeProductosVisibles =
    totalProductos === 0 ? 0 : (productosVisibles / totalProductos) * 100;

  const productosPorCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    productosAdmin.forEach((p) => {
      const cat = p.nombreCategoriaProducto || "Sin categoría";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [productosAdmin]);

  const totalIncidencias = incidenciasAdmin.length;
  const incidenciasAbiertas = incidenciasAdmin.filter(
    (i) => (i.estado || "").toUpperCase() !== "CERRADA"
  );
  const incidenciasCerradas = totalIncidencias - incidenciasAbiertas.length;

  const incidenciasRecientes = [...incidenciasAdmin]
    .sort(
      (a, b) =>
        (a.fechaRegistro || "").localeCompare(b.fechaRegistro || "") * -1
    )
    .slice(0, 5);

  const cardStyle = {
    p: 3,
    borderRadius: 4,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    bgcolor: "#ffffff",
  } as const;

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
          <strong>{periodoActual}</strong>: ocupación, estado de pagos,
          usuarios, catálogo de productos e incidencias.
        </Typography>
      </Stack>

      {/* FILA 1: stands/cuotas, cumplimiento, bloques */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "2fr 1.5fr 1.5fr",
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        {/* Card 1: Stands y cuotas del periodo (dona central) */}
        <Paper sx={{ ...cardStyle, minHeight: 280 }}>
          <Stack spacing={2} alignItems="center">
            {/* encabezado pequeño */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "999px",
                  bgcolor: "#ecfdf3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StoreIcon sx={{ fontSize: 20, color: "#16a34a" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Stands totales del mercado
                </Typography>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Ocupación del mercado
                </Typography>
              </Box>
            </Stack>

            {/* DONA con gradiente y hover */}
            <Box
              sx={{
                position: "relative",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: `conic-gradient(
                  #22c55e 0% ${Math.max(porcentajeOcupacion - 5, 0)}%,
                  #4ade80 ${Math.max(porcentajeOcupacion - 5, 0)}% ${porcentajeOcupacion}%,
                  #e5e7eb ${porcentajeOcupacion}% 100%
                )`,
                boxShadow: "0 18px 40px rgba(34, 197, 94, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: "0 22px 50px rgba(34, 197, 94, 0.35)",
                },
              }}
            >
              {/* inner circle */}
              <Box
                sx={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: "#ffffff",
                  boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.18)",
                }}
              />
              {/* texto central */}
              <Box sx={{ position: "relative", textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.1,
                  }}
                >
                  {porcentajeOcupacion.toFixed(1)}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", fontSize: 11 }}
                >
                  Stands abiertos
                </Typography>
              </Box>
            </Box>

            {/* texto bajo la dona */}
            <Typography variant="body2" color="text.secondary">
              {standsAbiertos} de {totalStandsRegistrados} stands abiertos
            </Typography>

            {/* Cerrados / Clausurados / Otros con color */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`Cerrados: ${standsCerrados}`}
                sx={{
                  bgcolor: "#fef3c7",
                  color: "#92400e",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Clausurados: ${standsClausurados}`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
              {otrosStands > 0 && (
                <Chip
                  size="small"
                  label={`Otros: ${otrosStands}`}
                  sx={{
                    bgcolor: "#e5e7eb",
                    color: "#374151",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 999,
                  }}
                />
              )}
            </Stack>

            
          </Stack>
        </Paper>

        {/* Card 2: Cumplimiento de pagos */}
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
                Stands al día vs con deuda
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
            Con deuda: {porcentajeConDeuda.toFixed(1)}%
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

          {/* chips con cantidades al día / con deuda */}
          <Stack direction="row" spacing={2.5} mt={3.5}>
            <Chip
                label={`Con cuota: ${totalStandsConCuota}`}
                size="small"
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
            <Chip
              label={`Al día: ${standsAlDia}`}
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
            <Chip
              label={`Con deuda: ${standsConDeuda}`}
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

        {/* Card 3: Bloques con deuda pendiente */}
        <Paper sx={cardStyle}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#6b7280" }}
              >
                Bloques con deuda pendiente
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
            S/. {deudaTotal.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {bloquesConDeuda.length} bloques con stands con deuda.
          </Typography>

          {/* listado vertical de bloques */}
          <Stack
            direction="column"
            spacing={0.5}
            alignItems="flex-start"
            sx={{ mt: 0.5 }}
          >
            {bloquesConDeuda.slice(0, 3).map((b) => (
              <Chip
                key={b.bloque}
                size="small"
                label={`${b.bloque}: ${b.standsMorosos} con deuda`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
            ))}
            {bloquesConDeuda.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Sin deuda por bloque.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* FILA 2: usuarios / productos / incidencias */}
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
        {/* Usuarios */}
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
                Administradores, supervisores, socios y otros
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
              label={`${usuariosNoActivos} en otros estados`}
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#6b7280",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Distribución por rol
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
              <Chip
                size="small"
                label={`Admin: ${totalAdmin}`}
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Supervisor: ${totalSupervisor}`}
                sx={{
                  bgcolor: "#e0f2fe",
                  color: "#0369a1",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Socio: ${totalSocio}`}
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Cliente: ${totalCliente}`}
                sx={{
                  bgcolor: "#fefce8",
                  color: "#a16207",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Trabajador: ${totalTrabajador}`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Productos */}
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
                Visibilidad y principales categorías
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
            {totalProductos} productos
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {categoriasPorTexto(productosPorCategoria.length)}
          </Typography>

          <Stack direction="row" spacing={1.5} mt={1.5}>
            <Chip
              label={`Visibles: ${productosVisibles} (${porcentajeProductosVisibles.toFixed(
                1
              )}%)`}
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
            <Chip
              label={`Ocultos: ${productosOcultos}`}
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              Categorías con más productos:
            </Typography>

            {productosPorCategoria.slice(0, 3).map(([cat, count]) => (
              <Stack
                key={cat}
                direction="row"
                justifyContent="space-between"
                sx={{ fontSize: 12, mb: 0.3 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#4b5563", maxWidth: "70%" }}
                >
                  {cat}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#111827" }}
                >
                  {count} prod.
                </Typography>
              </Stack>
            ))}

            {productosPorCategoria.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Aún no hay productos registrados.
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Incidencias */}
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

      {/* FILA 3: pagos recientes + incidencias recientes / stands con deuda */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* IZQUIERDA: pagos + incidencias recientes */}
        <Box
          sx={{
            flex: 7,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Últimos pagos */}
          <Paper sx={{ ...cardStyle, p: 3 }}>
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

          {/* Incidencias recientes */}
          <Paper sx={{ ...cardStyle, p: 3 }}>
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

        {/* DERECHA: Stands con deuda */}
        <Paper sx={{ ...cardStyle, flex: 5, p: 3 }}>
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
                Deuda total: S/. {deudaTotal.toFixed(2)}
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
              No se encontraron stands con deuda para el periodo {periodoActual}.
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