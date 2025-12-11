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
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StoreIcon from "@mui/icons-material/Store";
import Inventory2Icon from "@mui/icons-material/Inventory2";

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
  nombreComercial?: string;
  bloque?: string;
  numeroStand?: string;
  estado?: string; // ACTIVO / CLAUSURADO / etc.
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
    estado: "TODOS",
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
        const token = localStorage.getItem("token");
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

      const token = localStorage.getItem("token");
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
      dataMorosidad.reduce(
        (acc, m) => acc + Number(m.saldoPendiente || 0),
        0
      ),
    [dataMorosidad]
  );

  // ======================
  // Generar reporte de Incidencias
  // ======================
  const generarReporteIncidencias = async () => {
    try {
      setLoadingIncidencias(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        setLoadingIncidencias(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get<IncidenciaDto[]>(
        `${API_BASE_URL}/api/v1/admin/incidencias`,
        { headers }
      );
      setIncidencias(res.data || []);
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

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró token de sesión. Inicia sesión nuevamente.");
        setLoadingOcupacion(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get<StandDto[]>(
        `${API_BASE_URL}/api/v1/stands`,
        { headers }
      );
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

      let okEstado =
        estado === "TODOS" ||
        (s.estado || "").toUpperCase() === estado.toUpperCase();

      let okBloque =
        bloque === "Todos" ||
        (s.bloque || "").toUpperCase() === bloque.toUpperCase();

      let okCategoria =
        !idCategoriaStand ||
        s.idCategoriaStand === Number(idCategoriaStand);

      return okEstado && okBloque && okCategoria;
    });
  }, [stands, filtrosOcupacion]);

  const resumenOcupacion = useMemo(() => {
    const total = standsFiltradosOcupacion.length;

    let activos = 0;
    let clausurados = 0;

    const porBloque: Record<string, { activos: number; clausurados: number }> =
      {};
    const porCategoria: Record<string, number> = {};

    standsFiltradosOcupacion.forEach((s) => {
      const est = (s.estado || "").toUpperCase();
      if (est === "ACTIVO") activos++;
      else if (est === "CLAUSURADO") clausurados++;

      const bloque = (s.bloque || "SIN_BLOQUE").toUpperCase();
      if (!porBloque[bloque]) porBloque[bloque] = { activos: 0, clausurados: 0 };
      if (est === "ACTIVO") porBloque[bloque].activos++;
      else if (est === "CLAUSURADO") porBloque[bloque].clausurados++;

      const cat =
        s.nombreCategoriaStand ||
        categoriasStand.find((c) => c.id === s.idCategoriaStand)?.nombre ||
        "Sin categoría";
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;
    });

    const porcentajeOcupacion =
      total > 0 ? (activos * 100.0) / total : 0;

    return { total, activos, clausurados, porcentajeOcupacion, porBloque, porCategoria };
  }, [standsFiltradosOcupacion, categoriasStand]);

  // ======================
  // Generar reporte de Productos
  // ======================
  const generarReporteProductos = async () => {
    try {
      setLoadingProductos(true);
      setError(null);

      const token = localStorage.getItem("token");
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

      let okEstado =
        estado === "TODOS" ||
        (p.estado || "").toUpperCase() === estado.toUpperCase();

      let okCategoria =
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
      const est = (p.estado || "").toUpperCase();
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
                      e.target.value
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
                    handleChangeFiltrosIncidencias("estado", e.target.value)
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
                    handleChangeFiltrosIncidencias("prioridad", e.target.value)
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
                    handleChangeFiltrosOcupacion("estado", e.target.value)
                  }
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ACTIVO">Activo</MenuItem>
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
                      e.target.value
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
                    handleChangeFiltrosProductos("estado", e.target.value)
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
                      e.target.value
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
                label={`Abiertas: ${
                  resumenIncidencias.porEstado["ABIERTA"] || 0
                }`}
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
                label={`Cerradas: ${
                  resumenIncidencias.porEstado["CERRADA"] || 0
                }`}
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

    if (reporteSeleccionado === "ocupacion") {
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
                Ocupación del mercado
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total stands filtrados: {resumenOcupacion.total}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label={`Activos: ${resumenOcupacion.activos}`}
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Clausurados: ${resumenOcupacion.clausurados}`}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
              <Chip
                size="small"
                label={`Ocupación: ${resumenOcupacion.porcentajeOcupacion.toFixed(
                  1
                )}%`}
                sx={{
                  bgcolor: "#e0f2fe",
                  color: "#0369a1",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const rows = standsFiltradosOcupacion.map((s) => ({
                    Id: s.id,
                    Stand: s.nombreComercial,
                    Bloque: s.bloque,
                    NumeroStand: s.numeroStand,
                    Estado: s.estado,
                    Categoria:
                      s.nombreCategoriaStand ||
                      categoriasStand.find(
                        (c) => c.id === s.idCategoriaStand
                      )?.nombre,
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

          {/* Resumen por bloque */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{ color: "#9ca3af", textTransform: "uppercase" }}
            >
              Ocupación por bloque
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {Object.entries(resumenOcupacion.porBloque).map(
                ([bloque, info]) => (
                  <Chip
                    key={bloque}
                    label={`${bloque}: ${info.activos} activos / ${info.clausurados} clausurados`}
                    size="small"
                    sx={{
                      bgcolor: "#f9fafb",
                      color: "#374151",
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                )
              )}
              {Object.keys(resumenOcupacion.porBloque).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay datos para los filtros actuales.
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Tabla por categoría */}
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", textTransform: "uppercase" }}
          >
            Stands por categoría
          </Typography>
          {Object.keys(resumenOcupacion.porCategoria).length === 0 ? (
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
                  <TableCell align="right"># Stands</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(resumenOcupacion.porCategoria).map(
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
                      p.bloque && p.numeroStand
                        ? `${p.bloque}-${p.numeroStand}`
                        : "",
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
                      {p.bloque && p.numeroStand
                        ? `${p.bloque}-${p.numeroStand}`
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {(p.estado || "").toUpperCase()}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {p.precio != null
                        ? `S/. ${Number(p.precio).toFixed(2)}`
                        : "-"}
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
            Stands activos por bloque y categoría.
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