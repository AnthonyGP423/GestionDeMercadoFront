import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StoreIcon from "@mui/icons-material/Store";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type TipoReporte = "morosidad" | "incidencias" | "ocupacion" | "productos";

const green = "#22c55e";
const greenDark = "#16a34a";

// ======================
// DTOs mínimos
// ======================

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

interface CategoriaStandDto {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface StandDto {
  id: number;
  idPropietario?: number | null;
  nombrePropietario?: string | null;

  nombreComercial?: string;
  bloque?: string;
  numeroStand?: string;
  estado?: string; // ABIERTO / CERRADO / CLAUSURADO
  idCategoriaStand?: number;
  nombreCategoriaStand?: string;
}

interface CategoriaProductoDto {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface ProductoDto {
  idProducto: number;
  nombre: string;
  estado?: string; // ACTIVO / INACTIVO
  categoriaNombre?: string;
  idCategoriaProducto?: number;
  standNombre?: string;
  bloque?: string;
  numeroStand?: string;
  precio?: number;
}

interface IncidenciaDto {
  idIncidencia: number;
  titulo: string;
  descripcion?: string;
  estado: string;
  prioridad?: string;
  fechaRegistro: string;
  responsableNombre?: string;
  standNombre?: string;
  bloque?: string;
  numeroStand?: string;
}

// ======================
// Utils export CSV
// ======================
function exportToCsv(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(";")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ======================
// UI helpers (Ocupación)
// ======================
const kpiCardSx = {
  p: 2.25,
  borderRadius: 4,
  border: "1px solid #e5e7eb",
  bgcolor: "#fff",
  boxShadow: "0 10px 25px rgba(15,23,42,0.05)",
};

function fmtPct(n: number) {
  if (!isFinite(n)) return "0.0%";
  return `${n.toFixed(1)}%`;
}

const norm = (v: any) => String(v ?? "").trim().toUpperCase();
const hasOwner = (idPropietario: any) => Number(idPropietario ?? 0) > 0;

// ======================
// Componente principal
// ======================
export default function Reportes() {
  const [reporteSeleccionado, setReporteSeleccionado] =
    useState<TipoReporte>("morosidad");

  // --------- Filtros morosidad ---------
  const periodoActual = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, []);

  const [filtrosMorosidad, setFiltrosMorosidad] = useState({
    periodo: periodoActual,
    bloque: "Todos",
    idCategoriaStand: "",
  });

  const [categoriasStand, setCategoriasStand] = useState<CategoriaStandDto[]>(
    []
  );
  const [dataMorosidad, setDataMorosidad] = useState<CuotaDto[]>([]);
  const [indicadoresMorosidad, setIndicadoresMorosidad] =
    useState<IndicadoresCuotas | null>(null);
  const [loadingMorosidad, setLoadingMorosidad] = useState(false);

  // --------- Filtros incidencias ---------
  const [filtrosIncidencias, setFiltrosIncidencias] = useState({
    fechaInicio: "",
    fechaFin: "",
    estado: "TODAS",
    prioridad: "TODAS",
  });

  const [incidencias, setIncidencias] = useState<IncidenciaDto[]>([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);

  // --------- Ocupación ---------
  const [stands, setStands] = useState<StandDto[]>([]);
  const [loadingOcupacion, setLoadingOcupacion] = useState(false);
  const [filtrosOcupacion, setFiltrosOcupacion] = useState({
    estado: "TODOS", // TODOS | ABIERTO | CERRADO | CLAUSURADO
    bloque: "Todos",
    idCategoriaStand: "",
  });

  // --------- Productos ---------
  const [productos, setProductos] = useState<ProductoDto[]>([]);
  const [categoriasProducto, setCategoriasProducto] = useState<
    CategoriaProductoDto[]
  >([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [filtrosProductos, setFiltrosProductos] = useState({
    estado: "TODOS",
    idCategoriaProducto: "",
  });

  // --------- Estado general ---------
  const [error, setError] = useState<string | null>(null);

  // ======================
  // Carga auxiliar: categorías de stands y productos
  // ======================
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const token = localStorage.getItem("token_intranet");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [catsStandRes, catsProdRes] = await Promise.all([
          axios.get<CategoriaStandDto[]>(
            `${API_BASE_URL}/api/v1/admin/categorias-stands`,
            { headers }
          ),
          axios.get<CategoriaProductoDto[]>(
            `${API_BASE_URL}/api/v1/admin/categorias-productos`,
            { headers }
          ),
        ]);

        setCategoriasStand(catsStandRes.data || []);
        setCategoriasProducto(catsProdRes.data || []);
      } catch (e) {
        console.error("Error cargando categorías", e);
      }
    };

    cargarCategorias();
  }, []);

  // ======================
  // Handlers de cambio de filtros
  // ======================
  const handleChangeFiltrosMorosidad = (field: string, value: string) => {
    setFiltrosMorosidad((prev) => ({ ...prev, [field]: value }));
  };

  const limpiarFiltrosMorosidad = () => {
    setFiltrosMorosidad({
      periodo: periodoActual,
      bloque: "Todos",
      idCategoriaStand: "",
    });
  };

  const handleChangeFiltrosIncidencias = (field: string, value: string) => {
    setFiltrosIncidencias((prev) => ({ ...prev, [field]: value }));
  };

  const limpiarFiltrosIncidencias = () => {
    setFiltrosIncidencias({
      fechaInicio: "",
      fechaFin: "",
      estado: "TODAS",
      prioridad: "TODAS",
    });
  };

  const handleChangeFiltrosOcupacion = (field: string, value: string) => {
    setFiltrosOcupacion((prev) => ({ ...prev, [field]: value }));
  };

  const limpiarFiltrosOcupacion = () => {
    setFiltrosOcupacion({
      estado: "TODOS",
      bloque: "Todos",
      idCategoriaStand: "",
    });
  };

  const handleChangeFiltrosProductos = (field: string, value: string) => {
    setFiltrosProductos((prev) => ({ ...prev, [field]: value }));
  };

  const limpiarFiltrosProductos = () => {
    setFiltrosProductos({
      estado: "TODOS",
      idCategoriaProducto: "",
    });
  };

  // ======================
  // Generar reporte de Morosidad
  // ======================
  const generarReporteMorosidad = async () => {
    try {
      setLoadingMorosidad(true);
      setError(null);

      const token = localStorage.getItem("token_intranet");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        setLoadingMorosidad(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const paramsMorosos: any = {
        periodo: filtrosMorosidad.periodo || undefined,
      };
      if (filtrosMorosidad.bloque !== "Todos") {
        paramsMorosos.bloque = filtrosMorosidad.bloque;
      }
      if (filtrosMorosidad.idCategoriaStand) {
        paramsMorosos.idCategoriaStand = filtrosMorosidad.idCategoriaStand;
      }

      const [morososRes, indicadoresRes] = await Promise.all([
        axios.get<CuotaDto[]>(
          `${API_BASE_URL}/api/v1/admin/cuotas/morosos`,
          { headers, params: paramsMorosos }
        ),
        axios.get<IndicadoresCuotas>(
          `${API_BASE_URL}/api/v1/admin/cuotas/indicadores`,
          {
            headers,
            params: { periodo: filtrosMorosidad.periodo },
          }
        ),
      ]);

      setDataMorosidad(morososRes.data || []);
      setIndicadoresMorosidad(indicadoresRes.data);
    } catch (err: any) {
      console.error("Error generando reporte de morosidad:", err);
      setError(
        err?.response?.data?.mensaje ||
          "Ocurrió un error al generar el reporte de morosidad."
      );
    } finally {
      setLoadingMorosidad(false);
    }
  };

  const deudaTotalMorosos = useMemo(
    () =>
      dataMorosidad.reduce((acc, m) => acc + Number(m.saldoPendiente || 0), 0),
    [dataMorosidad]
  );

  // ======================
  // Generar reporte de Incidencias
  // ======================
  const generarReporteIncidencias = async () => {
    try {
      setLoadingIncidencias(true);
      setError(null);

      const token = localStorage.getItem("token_intranet");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const params: any = {
        page: 0,
        size: 1000,
      };

      if (filtrosIncidencias.estado !== "TODAS")
        params.estado = filtrosIncidencias.estado;
      if (filtrosIncidencias.prioridad !== "TODAS")
        params.prioridad = filtrosIncidencias.prioridad;

      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/incidencias`, {
        headers,
        params,
      });

      const content = Array.isArray(res.data) ? res.data : res.data?.content;

      const normalizadas: IncidenciaDto[] = (content || []).map((x: any) => ({
        idIncidencia: x.idIncidencia,
        titulo: x.titulo,
        descripcion: x.descripcion,
        estado: x.estado,
        prioridad: x.prioridad,
        fechaRegistro: x.fechaReporte ?? x.fechaRegistro ?? "",
        responsableNombre: x.nombreResponsable ?? x.responsableNombre ?? null,
        standNombre: x.nombreStand ?? x.standNombre ?? null,
        bloque: x.bloque ?? null,
        numeroStand: x.numeroStand ?? null,
      }));

      setIncidencias(normalizadas);
    } catch (err: any) {
      console.error("Error generando reporte de incidencias:", err);
      setError(
        err?.response?.data?.mensaje ||
          "Ocurrió un error al generar el reporte de incidencias."
      );
    } finally {
      setLoadingIncidencias(false);
    }
  };

  const incidenciasFiltradas = useMemo(() => {
    return incidencias.filter((i) => {
      const fecha = i.fechaRegistro?.slice(0, 10); // yyyy-MM-dd
      const { fechaInicio, fechaFin, estado, prioridad } = filtrosIncidencias;

      let okFecha = true;
      if (fechaInicio) okFecha = okFecha && fecha >= fechaInicio;
      if (fechaFin) okFecha = okFecha && fecha <= fechaFin;

      let okEstado =
        estado === "TODAS" ||
        (i.estado || "").toUpperCase() === estado.toUpperCase();

      let okPrioridad =
        prioridad === "TODAS" ||
        (i.prioridad || "").toUpperCase() === prioridad.toUpperCase();

      return okFecha && okEstado && okPrioridad;
    });
  }, [incidencias, filtrosIncidencias]);

  const resumenIncidencias = useMemo(() => {
    const total = incidenciasFiltradas.length;
    const porEstado: Record<string, number> = {};
    const porPrioridad: Record<string, number> = {};

    incidenciasFiltradas.forEach((i) => {
      const est = (i.estado || "SIN_ESTADO").toUpperCase();
      porEstado[est] = (porEstado[est] || 0) + 1;

      const prior = (i.prioridad || "SIN_PRIORIDAD").toUpperCase();
      porPrioridad[prior] = (porPrioridad[prior] || 0) + 1;
    });

    return { total, porEstado, porPrioridad };
  }, [incidenciasFiltradas]);

  // ======================
  // Generar reporte de Ocupación
  // ======================
  const generarReporteOcupacion = async () => {
    try {
      setLoadingOcupacion(true);
      setError(null);

      const token = localStorage.getItem("token_intranet");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        setLoadingOcupacion(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Puedes pasar filtros al backend si lo implementas (bloque/idCategoria/estado),
      // pero por ahora traemos todo y filtramos en frontend para no romper nada.
      const res = await axios.get<StandDto[]>(`${API_BASE_URL}/api/v1/stands`, {
        headers,
      });
      setStands(res.data || []);
    } catch (err: any) {
      console.error("Error generando reporte de ocupación:", err);
      setError(
        err?.response?.data?.mensaje ||
          "Ocurrió un error al generar el reporte de ocupación."
      );
    } finally {
      setLoadingOcupacion(false);
    }
  };

  const standsFiltradosOcupacion = useMemo(() => {
    return stands.filter((s) => {
      const { estado, bloque, idCategoriaStand } = filtrosOcupacion;

      const okEstado =
        estado === "TODOS" ||
        norm(s.estado) === norm(estado);

      const okBloque =
        bloque === "Todos" || norm(s.bloque) === norm(bloque);

      const okCategoria =
        !idCategoriaStand || s.idCategoriaStand === Number(idCategoriaStand);

      return okEstado && okBloque && okCategoria;
    });
  }, [stands, filtrosOcupacion]);

  // ===== Resumen Ocupación (Operatividad + Disponibilidad comercial)
  const resumenOcupacion = useMemo(() => {
    const total = standsFiltradosOcupacion.length;

    // Operatividad
    let abiertos = 0;
    let cerrados = 0;
    let clausurados = 0;

    // Disponibilidad comercial
    let disponibles = 0; // sin propietario y NO clausurado
    let ocupados = 0; // con propietario

    const porBloque: Record<
      string,
      {
        abiertos: number;
        cerrados: number;
        clausurados: number;
        disponibles: number;
        ocupados: number;
        pctOperativo: number; // abiertos / total bloque
        pctDisponible: number; // disponibles / total bloque
      }
    > = {};

    const porCategoria: Record<string, number> = {};

    standsFiltradosOcupacion.forEach((s) => {
      const est = norm(s.estado);
      const bloque = norm(s.bloque || "SIN_BLOQUE");
      const owner = hasOwner((s as any).idPropietario);

      if (!porBloque[bloque]) {
        porBloque[bloque] = {
          abiertos: 0,
          cerrados: 0,
          clausurados: 0,
          disponibles: 0,
          ocupados: 0,
          pctOperativo: 0,
          pctDisponible: 0,
        };
      }

      // Operatividad
      if (est === "ABIERTO") {
        abiertos++;
        porBloque[bloque].abiertos++;
      } else if (est === "CERRADO") {
        cerrados++;
        porBloque[bloque].cerrados++;
      } else if (est === "CLAUSURADO") {
        clausurados++;
        porBloque[bloque].clausurados++;
      }

      // Disponibilidad comercial
      if (owner) {
        ocupados++;
        porBloque[bloque].ocupados++;
      } else {
        if (est !== "CLAUSURADO") {
          disponibles++;
          porBloque[bloque].disponibles++;
        }
      }

      const cat =
        s.nombreCategoriaStand ||
        categoriasStand.find((c) => c.id === s.idCategoriaStand)?.nombre ||
        "Sin categoría";
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;
    });

    Object.keys(porBloque).forEach((b) => {
      const info = porBloque[b];
      const totalB = info.abiertos + info.cerrados + info.clausurados;
      info.pctOperativo = totalB > 0 ? (info.abiertos * 100) / totalB : 0;
      info.pctDisponible = totalB > 0 ? (info.disponibles * 100) / totalB : 0;
    });

    const porcentajeOperativo = total > 0 ? (abiertos * 100) / total : 0;
    const porcentajeDisponible = total > 0 ? (disponibles * 100) / total : 0;

    return {
      total,
      // operatividad
      abiertos,
      cerrados,
      clausurados,
      porcentajeOperativo,
      // disponibilidad
      disponibles,
      ocupados,
      porcentajeDisponible,
      // breakdown
      porBloque,
      porCategoria,
    };
  }, [standsFiltradosOcupacion, categoriasStand]);

  // Rankings UX (Ocupación)
  const topBloques = useMemo(() => {
    const entries = Object.entries(resumenOcupacion.porBloque).map(
      ([bloque, v]) => {
        const totalB = v.abiertos + v.cerrados + v.clausurados;
        return {
          bloque,
          abiertos: v.abiertos,
          cerrados: v.cerrados,
          clausurados: v.clausurados,
          total: totalB,
          pctOperativo: v.pctOperativo,
          pctDisponible: v.pctDisponible,
        };
      }
    );

    return entries
      .sort((a, b) => b.clausurados - a.clausurados || b.total - a.total)
      .slice(0, 6);
  }, [resumenOcupacion.porBloque]);

  const topCategorias = useMemo(() => {
    const entries = Object.entries(resumenOcupacion.porCategoria).map(
      ([cat, count]) => ({ cat, count })
    );
    return entries.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [resumenOcupacion.porCategoria]);

  const standsDetalle = useMemo(() => {
    return [...standsFiltradosOcupacion].sort((a, b) => {
      const ea = norm(a.estado);
      const eb = norm(b.estado);

      // CLAUSURADO primero
      if (ea === "CLAUSURADO" && eb !== "CLAUSURADO") return -1;
      if (eb === "CLAUSURADO" && ea !== "CLAUSURADO") return 1;

      // luego ABIERTO, luego CERRADO
      const rank = (e: string) =>
        e === "ABIERTO" ? 0 : e === "CERRADO" ? 1 : e === "CLAUSURADO" ? -1 : 2;

      const ra = rank(ea);
      const rb = rank(eb);
      if (ra !== rb) return ra - rb;

      return (
        String(a.bloque || "").localeCompare(String(b.bloque || "")) ||
        String(a.numeroStand || "").localeCompare(String(b.numeroStand || ""))
      );
    });
  }, [standsFiltradosOcupacion]);

  // ======================
  // Generar reporte de Productos
  // ======================
  const generarReporteProductos = async () => {
    try {
      setLoadingProductos(true);
      setError(null);

      const token = localStorage.getItem("token_intranet");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        setLoadingProductos(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get<ProductoDto[]>(
        `${API_BASE_URL}/api/v1/admin/productos`,
        { headers }
      );
      setProductos(res.data || []);
    } catch (err: any) {
      console.error("Error generando reporte de productos:", err);
      setError(
        err?.response?.data?.mensaje ||
          "Ocurrió un error al generar el reporte de productos."
      );
    } finally {
      setLoadingProductos(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const { estado, idCategoriaProducto } = filtrosProductos;

      const okEstado =
        estado === "TODOS" || norm(p.estado) === norm(estado);

      const okCategoria =
        !idCategoriaProducto ||
        p.idCategoriaProducto === Number(idCategoriaProducto);

      return okEstado && okCategoria;
    });
  }, [productos, filtrosProductos]);

  const resumenProductos = useMemo(() => {
    const total = productosFiltrados.length;
    let activos = 0;
    let inactivos = 0;

    const porCategoria: Record<string, number> = {};

    productosFiltrados.forEach((p) => {
      const est = norm(p.estado);
      if (est === "ACTIVO") activos++;
      else if (est === "INACTIVO") inactivos++;

      const cat =
        p.categoriaNombre ||
        categoriasProducto.find((c) => c.id === p.idCategoriaProducto)?.nombre ||
        "Sin categoría";
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;
    });

    return { total, activos, inactivos, porCategoria };
  }, [productosFiltrados, categoriasProducto]);

  // ======================
  // Render helpers UI
  // ======================
  const getCardStyle = (tipo: TipoReporte) => ({
    p: 3,
    borderRadius: 4,
    cursor: "pointer",
    border:
      reporteSeleccionado === tipo ? `2px solid ${green}` : "1px solid #e5e7eb",
    boxShadow:
      reporteSeleccionado === tipo
        ? "0 14px 30px rgba(34, 197, 94, 0.25)"
        : "0 8px 20px rgba(15, 23, 42, 0.04)",
    transition: "all .2s ease",
    "&:hover": {
      boxShadow:
        reporteSeleccionado === tipo
          ? "0 18px 40px rgba(34, 197, 94, 0.35)"
          : "0 12px 26px rgba(15, 23, 42, 0.08)",
      transform: "translateY(-1px)",
    },
    flex: 1,
    bgcolor: "#ffffff",
  });

  // ======================
  // FILTROS según reporte
  // ======================
  const renderFiltros = () => {
    if (reporteSeleccionado === "morosidad") {
      return (
        <>
          <Typography fontWeight="bold" sx={{ mb: 3 }}>
            Filtros – Reporte de morosidad de cuotas
          </Typography>

          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Periodo (YYYY-MM)"
                value={filtrosMorosidad.periodo}
                onChange={(e) =>
                  handleChangeFiltrosMorosidad("periodo", e.target.value)
                }
                placeholder="2025-12"
              />
              <TextField
                fullWidth
                label="Bloque"
                value={filtrosMorosidad.bloque}
                onChange={(e) =>
                  handleChangeFiltrosMorosidad("bloque", e.target.value)
                }
                placeholder="Todos"
              />
              <FormControl fullWidth>
                <InputLabel>Categoría de stand</InputLabel>
                <Select
                  label="Categoría de stand"
                  value={filtrosMorosidad.idCategoriaStand}
                  onChange={(e) =>
                    handleChangeFiltrosMorosidad(
                      "idCategoriaStand",
                      String(e.target.value)
                    )
                  }
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categoriasStand.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 2,
              }}
            >
              <Button onClick={limpiarFiltrosMorosidad} color="inherit">
                Limpiar filtros
              </Button>

              <Button
                variant="contained"
                onClick={generarReporteMorosidad}
                sx={{
                  backgroundColor: green,
                  borderRadius: "999px",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: greenDark },
                }}
              >
                Generar reporte
              </Button>
            </Box>
          </Stack>
        </>
      );
    }

    if (reporteSeleccionado === "incidencias") {
      return (
        <>
          <Typography fontWeight="bold" sx={{ mb: 3 }}>
            Filtros – Reporte de incidencias y atención
          </Typography>

          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="Fecha inicio"
                InputLabelProps={{ shrink: true }}
                value={filtrosIncidencias.fechaInicio}
                onChange={(e) =>
                  handleChangeFiltrosIncidencias("fechaInicio", e.target.value)
                }
              />
              <TextField
                fullWidth
                type="date"
                label="Fecha fin"
                InputLabelProps={{ shrink: true }}
                value={filtrosIncidencias.fechaFin}
                onChange={(e) =>
                  handleChangeFiltrosIncidencias("fechaFin", e.target.value)
                }
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={filtrosIncidencias.estado}
                  onChange={(e) =>
                    handleChangeFiltrosIncidencias("estado", String(e.target.value))
                  }
                >
                  <MenuItem value="TODAS">Todas</MenuItem>
                  <MenuItem value="ABIERTA">Abierta</MenuItem>
                  <MenuItem value="EN_PROCESO">En proceso</MenuItem>
                  <MenuItem value="CERRADA">Cerrada</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  label="Prioridad"
                  value={filtrosIncidencias.prioridad}
                  onChange={(e) =>
                    handleChangeFiltrosIncidencias("prioridad", String(e.target.value))
                  }
                >
                  <MenuItem value="TODAS">Todas</MenuItem>
                  <MenuItem value="ALTA">Alta</MenuItem>
                  <MenuItem value="MEDIA">Media</MenuItem>
                  <MenuItem value="BAJA">Baja</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 2,
              }}
            >
              <Button onClick={limpiarFiltrosIncidencias} color="inherit">
                Limpiar filtros
              </Button>

              <Button
                variant="contained"
                onClick={generarReporteIncidencias}
                sx={{
                  backgroundColor: green,
                  borderRadius: "999px",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: greenDark },
                }}
              >
                Generar reporte
              </Button>
            </Box>
          </Stack>
        </>
      );
    }

    if (reporteSeleccionado === "ocupacion") {
      return (
        <>
          <Typography fontWeight="bold" sx={{ mb: 3 }}>
            Filtros – Reporte de ocupación del mercado
          </Typography>

          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Estado del stand</InputLabel>
                <Select
                  label="Estado del stand"
                  value={filtrosOcupacion.estado}
                  onChange={(e) =>
                    handleChangeFiltrosOcupacion("estado", String(e.target.value))
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ABIERTO">Abierto</MenuItem>
                  <MenuItem value="CERRADO">Cerrado</MenuItem>
                  <MenuItem value="CLAUSURADO">Clausurado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Bloque"
                value={filtrosOcupacion.bloque}
                onChange={(e) =>
                  handleChangeFiltrosOcupacion("bloque", e.target.value)
                }
                placeholder="Todos"
              />

              <FormControl fullWidth>
                <InputLabel>Categoría de stand</InputLabel>
                <Select
                  label="Categoría de stand"
                  value={filtrosOcupacion.idCategoriaStand}
                  onChange={(e) =>
                    handleChangeFiltrosOcupacion(
                      "idCategoriaStand",
                      String(e.target.value)
                    )
                  }
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categoriasStand.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 2,
              }}
            >
              <Button onClick={limpiarFiltrosOcupacion} color="inherit">
                Limpiar filtros
              </Button>

              <Button
                variant="contained"
                onClick={generarReporteOcupacion}
                sx={{
                  backgroundColor: green,
                  borderRadius: "999px",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: greenDark },
                }}
              >
                Generar reporte
              </Button>
            </Box>
          </Stack>
        </>
      );
    }

    if (reporteSeleccionado === "productos") {
      return (
        <>
          <Typography fontWeight="bold" sx={{ mb: 3 }}>
            Filtros – Reporte de productos y categorías
          </Typography>

          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Estado del producto</InputLabel>
                <Select
                  label="Estado del producto"
                  value={filtrosProductos.estado}
                  onChange={(e) =>
                    handleChangeFiltrosProductos("estado", String(e.target.value))
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Categoría de producto</InputLabel>
                <Select
                  label="Categoría de producto"
                  value={filtrosProductos.idCategoriaProducto}
                  onChange={(e) =>
                    handleChangeFiltrosProductos(
                      "idCategoriaProducto",
                      String(e.target.value)
                    )
                  }
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categoriasProducto.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 2,
              }}
            >
              <Button onClick={limpiarFiltrosProductos} color="inherit">
                Limpiar filtros
              </Button>

              <Button
                variant="contained"
                onClick={generarReporteProductos}
                sx={{
                  backgroundColor: green,
                  borderRadius: "999px",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: greenDark },
                }}
              >
                Generar reporte
              </Button>
            </Box>
          </Stack>
        </>
      );
    }

    return null;
  };

  // ======================
  // RESULTADOS según reporte
  // ======================
  const renderResultados = () => {
    if (reporteSeleccionado === "morosidad") {
      return (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Morosidad de cuotas – Periodo {filtrosMorosidad.periodo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Deuda total: S/. {deudaTotalMorosos.toFixed(2)}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {indicadoresMorosidad && (
                <>
                  <Chip
                    size="small"
                    label={`${indicadoresMorosidad.standsMorosos} stands morosos`}
                    sx={{
                      bgcolor: "#fee2e2",
                      color: "#b91c1c",
                      fontWeight: 600,
                      borderRadius: 999,
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${indicadoresMorosidad.porcentajeMorosos.toFixed(
                      1
                    )}% morosidad`}
                    sx={{
                      bgcolor: "#fef3c7",
                      color: "#92400e",
                      fontWeight: 600,
                      borderRadius: 999,
                    }}
                  />
                </>
              )}

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const rows = dataMorosidad.map((m) => ({
                    Bloque: m.bloque,
                    NumeroStand: m.numeroStand,
                    Stand: m.nombreStand,
                    Periodo: m.periodo,
                    MontoCuota: m.montoCuota,
                    MontoPagado: m.montoPagado,
                    SaldoPendiente: m.saldoPendiente,
                    Estado: m.estado,
                    FechaVencimiento: m.fechaVencimiento,
                  }));
                  exportToCsv(
                    `reporte_morosidad_${filtrosMorosidad.periodo}.csv`,
                    rows
                  );
                }}
              >
                Exportar a Excel
              </Button>
            </Stack>
          </Stack>

          {loadingMorosidad && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {dataMorosidad.length === 0 && !loadingMorosidad ? (
            <Typography variant="body2" color="text.secondary">
              No se encontraron cuotas morosas con los filtros seleccionados.
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
                  <TableCell align="right">Cuota (S/.)</TableCell>
                  <TableCell align="right">Pagado (S/.)</TableCell>
                  <TableCell align="right">Saldo (S/.)</TableCell>
                  <TableCell>Vence</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataMorosidad.map((m) => (
                  <TableRow key={m.idCuota} hover>
                    <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>
                      {m.nombreStand}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                      {m.bloque}-{m.numeroStand}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.periodo}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 13, color: "text.secondary" }}
                    >
                      S/. {Number(m.montoCuota || 0).toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 13, color: "success.main" }}
                    >
                      S/. {Number(m.montoPagado || 0).toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 13, color: "error.main" }}
                    >
                      S/. {Number(m.saldoPendiente || 0).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {m.fechaVencimiento || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {(m.estado || "").toUpperCase()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      );
    }

    if (reporteSeleccionado === "incidencias") {
      return (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Incidencias y atención
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total filtrado: {resumenIncidencias.total}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label={`Abiertas: ${resumenIncidencias.porEstado["ABIERTA"] || 0}`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`En proceso: ${
                  resumenIncidencias.porEstado["EN_PROCESO"] || 0
                }`}
                sx={{
                  bgcolor: "#fef3c7",
                  color: "#92400e",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Cerradas: ${resumenIncidencias.porEstado["CERRADA"] || 0}`}
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const rows = incidenciasFiltradas.map((i) => ({
                    Id: i.idIncidencia,
                    Titulo: i.titulo,
                    Estado: i.estado,
                    Prioridad: i.prioridad,
                    FechaRegistro: i.fechaRegistro,
                    Responsable: i.responsableNombre,
                    Stand: i.standNombre,
                    Ubicacion:
                      i.bloque && i.numeroStand
                        ? `${i.bloque}-${i.numeroStand}`
                        : "",
                  }));
                  exportToCsv("reporte_incidencias.csv", rows);
                }}
              >
                Exportar a Excel
              </Button>
            </Stack>
          </Stack>

          {loadingIncidencias && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {incidenciasFiltradas.length === 0 && !loadingIncidencias ? (
            <Typography variant="body2" color="text.secondary">
              No se encontraron incidencias con los filtros seleccionados.
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
                  <TableCell>Título</TableCell>
                  <TableCell>Stand</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Fecha registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidenciasFiltradas.map((i) => (
                  <TableRow key={i.idIncidencia} hover>
                    <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>
                      {i.titulo}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {i.standNombre || "-"}
                      {i.bloque && i.numeroStand && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {i.bloque}-{i.numeroStand}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {(i.estado || "").toUpperCase()}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {(i.prioridad || "").toUpperCase() || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {i.responsableNombre || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {i.fechaRegistro?.replace("T", " ").slice(0, 16)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      );
    }

    // ======================
    // OCUPACIÓN (Operatividad + Disponibilidad real por propietario)
    // ======================
    if (reporteSeleccionado === "ocupacion") {
      return (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
          }}
        >
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Ocupación del mercado
                </Typography>

                <Tooltip
                  title={
                    "Operatividad: % de stands ABIERTO.\n" +
                    "Disponibilidad: stands sin propietario (idPropietario vacío/0) y NO clausurados."
                  }
                >
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                Total stands en el reporte: {resumenOcupacion.total}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const rows = standsFiltradosOcupacion.map((s) => ({
                    Id: s.id,
                    Stand: s.nombreComercial,
                    Ubicacion:
                      s.bloque && s.numeroStand ? `${s.bloque}-${s.numeroStand}` : "",
                    Estado: s.estado,
                    Categoria:
                      s.nombreCategoriaStand ||
                      categoriasStand.find((c) => c.id === s.idCategoriaStand)
                        ?.nombre ||
                      "Sin categoría",
                    IdPropietario: (s as any).idPropietario ?? "",
                    Propietario: (s as any).nombrePropietario ?? "",
                    Disponible:
                      !hasOwner((s as any).idPropietario) && norm(s.estado) !== "CLAUSURADO"
                        ? "SI"
                        : "NO",
                  }));
                  exportToCsv("reporte_ocupacion.csv", rows);
                }}
              >
                Exportar a Excel
              </Button>
            </Stack>
          </Stack>

          {loadingOcupacion && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {/* KPIs */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{ color: "#9ca3af", textTransform: "uppercase" }}
            >
              Operatividad (hoy)
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                gap: 2,
                mt: 1,
              }}
            >
              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  % Operativo
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {fmtPct(resumenOcupacion.porcentajeOperativo)}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  ABIERTO / Total (según filtros)
                </Typography>
              </Paper>

              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  Abiertos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {resumenOcupacion.abiertos}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Atendiendo ahora
                </Typography>
              </Paper>

              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  Cerrados
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {resumenOcupacion.cerrados}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Puede abrir luego
                </Typography>
              </Paper>

              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  Clausurados
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {resumenOcupacion.clausurados}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Cierre forzoso (admin)
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, resumenOcupacion.porcentajeOperativo))}
                sx={{ height: 10, borderRadius: 999 }}
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                  {resumenOcupacion.abiertos} abiertos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {resumenOcupacion.total - resumenOcupacion.abiertos} no abiertos
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{ color: "#9ca3af", textTransform: "uppercase" }}
            >
              Disponibilidad (asignación a socio)
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
                mt: 1,
              }}
            >
              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  % Disponible
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {fmtPct(resumenOcupacion.porcentajeDisponible)}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Sin propietario y no clausurado
                </Typography>
              </Paper>

              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  Disponibles
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {resumenOcupacion.disponibles}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Listos para asignar
                </Typography>
              </Paper>

              <Paper sx={kpiCardSx}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  Ocupados
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {resumenOcupacion.ocupados}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Con propietario asignado
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Insights rápidos */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Paper sx={kpiCardSx}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Bloques con más clausurados
                </Typography>

                {topBloques.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay datos para los filtros actuales.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {topBloques.map((b) => (
                      <Box
                        key={b.bloque}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700 }}>{b.bloque}</Typography>
                        <Typography color="text.secondary">
                          {b.clausurados} clausurados • {b.abiertos} abiertos •{" "}
                          {fmtPct(b.pctOperativo)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper sx={kpiCardSx}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Categorías con más stands
                </Typography>

                {topCategorias.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay información de categorías con los filtros actuales.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {topCategorias.map((c) => (
                      <Chip
                        key={c.cat}
                        label={`${c.cat}: ${c.count}`}
                        size="small"
                        sx={{
                          bgcolor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 999,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Detalle */}
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", textTransform: "uppercase" }}
          >
            Detalle de stands (clausurados primero)
          </Typography>

          {standsDetalle.length === 0 && !loadingOcupacion ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No hay stands para los filtros seleccionados.
            </Typography>
          ) : (
            <Table size="small" sx={{ mt: 1 }}>
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
                  <TableCell>Categoría</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Disponibilidad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standsDetalle.map((s) => {
                  const cat =
                    s.nombreCategoriaStand ||
                    categoriasStand.find((c) => c.id === s.idCategoriaStand)
                      ?.nombre ||
                    "Sin categoría";

                  const estado = norm(s.estado);
                  const owner = hasOwner((s as any).idPropietario);
                  const disponible = !owner && estado !== "CLAUSURADO";

                  const estadoChip = (() => {
                    if (estado === "ABIERTO")
                      return { bg: "#dcfce7", fg: "#166534" };
                    if (estado === "CERRADO")
                      return { bg: "#fef3c7", fg: "#92400e" };
                    if (estado === "CLAUSURADO")
                      return { bg: "#fee2e2", fg: "#b91c1c" };
                    return { bg: "#f3f4f6", fg: "#374151" };
                  })();

                  return (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                        {s.nombreComercial || `Stand #${s.id}`}
                      </TableCell>

                      <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                        {s.bloque && s.numeroStand ? `${s.bloque}-${s.numeroStand}` : "-"}
                      </TableCell>

                      <TableCell sx={{ fontSize: 12 }}>{cat}</TableCell>

                      <TableCell sx={{ fontSize: 12 }}>
                        <Chip
                          size="small"
                          label={estado || "-"}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 800,
                            bgcolor: estadoChip.bg,
                            color: estadoChip.fg,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontSize: 12 }}>
                        <Chip
                          size="small"
                          label={
                            estado === "CLAUSURADO"
                              ? "No disponible"
                              : disponible
                              ? "Disponible"
                              : "Ocupado"
                          }
                          sx={{
                            borderRadius: 999,
                            fontWeight: 800,
                            bgcolor:
                              estado === "CLAUSURADO"
                                ? "#fee2e2"
                                : disponible
                                ? "#e0f2fe"
                                : "#f3f4f6",
                            color:
                              estado === "CLAUSURADO"
                                ? "#b91c1c"
                                : disponible
                                ? "#0369a1"
                                : "#374151",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>
      );
    }

    if (reporteSeleccionado === "productos") {
      return (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Productos y categorías
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total productos filtrados: {resumenProductos.total}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label={`Activos: ${resumenProductos.activos}`}
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Inactivos: ${resumenProductos.inactivos}`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const rows = productosFiltrados.map((p) => ({
                    IdProducto: p.idProducto,
                    Nombre: p.nombre,
                    Estado: p.estado,
                    Categoria:
                      p.categoriaNombre ||
                      categoriasProducto.find(
                        (c) => c.id === p.idCategoriaProducto
                      )?.nombre,
                    Stand: p.standNombre,
                    Ubicacion:
                      p.bloque && p.numeroStand ? `${p.bloque}-${p.numeroStand}` : "",
                    Precio: p.precio,
                  }));
                  exportToCsv("reporte_productos.csv", rows);
                }}
              >
                Exportar a Excel
              </Button>
            </Stack>
          </Stack>

          {loadingProductos && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Resumen por categoría */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{ color: "#9ca3af", textTransform: "uppercase" }}
            >
              Número de productos por categoría
            </Typography>
            {Object.keys(resumenProductos.porCategoria).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No hay información de categorías para los filtros seleccionados.
              </Typography>
            ) : (
              <Table size="small" sx={{ mt: 1 }}>
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
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right"># Productos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(resumenProductos.porCategoria).map(
                    ([cat, count]) => (
                      <TableRow key={cat} hover>
                        <TableCell sx={{ fontSize: 13 }}>{cat}</TableCell>
                        <TableCell align="right" sx={{ fontSize: 13 }}>
                          {count}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </Box>

          {/* Tabla detallada de productos */}
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", textTransform: "uppercase" }}
          >
            Detalle de productos
          </Typography>
          {productosFiltrados.length === 0 && !loadingProductos ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No se encontraron productos con los filtros seleccionados.
            </Typography>
          ) : (
            <Table size="small" sx={{ mt: 1 }}>
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
                  <TableCell>Producto</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Stand</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Precio referencial</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosFiltrados.map((p) => (
                  <TableRow key={p.idProducto} hover>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>
                      {p.nombre}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {p.categoriaNombre ||
                        categoriasProducto.find(
                          (c) => c.id === p.idCategoriaProducto
                        )?.nombre ||
                        "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {p.standNombre || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {p.bloque && p.numeroStand ? `${p.bloque}-${p.numeroStand}` : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {(p.estado || "").toUpperCase()}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {p.precio != null ? `S/. ${Number(p.precio).toFixed(2)}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      );
    }

    return null;
  };

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
          Reportes y análisis
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 520 }}>
          Genera informes ejecutivos sobre morosidad, incidencias, ocupación del
          mercado y mix de productos.
        </Typography>
      </Stack>

      {/* CARDS DE TIPOS DE REPORTE */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        {/* Morosidad */}
        <Paper
          onClick={() => setReporteSeleccionado("morosidad")}
          sx={getCardStyle("morosidad")}
        >
          <AssessmentIcon sx={{ color: greenDark, fontSize: 32 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Morosidad de cuotas
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Deuda por stand, bloque y periodo. Ideal para gestión financiera.
          </Typography>
        </Paper>

        {/* Incidencias */}
        <Paper
          onClick={() => setReporteSeleccionado("incidencias")}
          sx={getCardStyle("incidencias")}
        >
          <ReportProblemIcon sx={{ color: "#f97316", fontSize: 32 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Incidencias y atención
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Trazabilidad de problemas, estados y responsables.
          </Typography>
        </Paper>

        {/* Ocupación */}
        <Paper
          onClick={() => setReporteSeleccionado("ocupacion")}
          sx={getCardStyle("ocupacion")}
        >
          <StoreIcon sx={{ color: "#0ea5e9", fontSize: 32 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Ocupación del mercado
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Operatividad (abierto/cerrado/clausurado) y disponibilidad real por
            propietario.
          </Typography>
        </Paper>

        {/* Productos */}
        <Paper
          onClick={() => setReporteSeleccionado("productos")}
          sx={getCardStyle("productos")}
        >
          <Inventory2Icon sx={{ color: "#a855f7", fontSize: 32 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Productos y categorías
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Mix de productos por categoría y estado.
          </Typography>
        </Paper>
      </Box>

      {/* PANEL DE FILTROS */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 3,
          boxShadow: "0 18px 40px rgba(15,23,42,0.04)",
        }}
      >
        {renderFiltros()}
      </Paper>

      {/* ERRORES */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* RESULTADOS */}
      {renderResultados()}
    </Box>
  );
}