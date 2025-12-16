import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import AddCardIcon from "@mui/icons-material/AddCard";

import FiltersBar from "../../../components/shared/FiltersBar";
import { useToast } from "../../../components/ui/Toast";
import PaymentModal from "../components/modals/PagosModal";
import CuotaMasivaModal from "../components/modals/CuotaMasivaModal";
import HistorialCuotasModal from "../components/modals/HistorialCuotasModal";
import CuotaStandModal, {
  StandOption,
} from "../components/modals/CuotaStandModal";

import cuotasApi, {
  CuotaResponseDto,
  IndicadoresCuotasDto,
  PagoCuotaRequest,
} from "../../../api/admin/cuotasApi";

type EstadoUi = "PAGADO" | "PENDIENTE" | "PARCIAL" | "VENCIDO" | string;

const green = "#22c55e";
const greenDark = "#16a34a";

export default function Pagos() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadingIndicadores, setLoadingIndicadores] = useState(false);

  const [cuotas, setCuotas] = useState<CuotaResponseDto[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresCuotasDto | null>(
    null
  );
  const [ultimosPagos, setUltimosPagos] = useState<CuotaResponseDto[]>([]);

  // filtros
  const [periodoFiltro, setPeriodoFiltro] = useState<string>(() => {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");
  const [bloqueFiltro, setBloqueFiltro] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // modal pago
  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] =
    useState<CuotaResponseDto | null>(null);

  // modal masivo
  const [openMasivoModal, setOpenMasivoModal] = useState(false);

  // modal cuota individual
  const [openCuotaStandModal, setOpenCuotaStandModal] = useState(false);

  // modal historial
  const [openHistorialModal, setOpenHistorialModal] = useState(false);
  const [standHistorial, setStandHistorial] = useState<{
    idStand: number;
    nombre: string;
  } | null>(null);

  // =========================
  // CARGA INICIAL
  // =========================
  const cargarDatos = async (periodo: string) => {
    try {
      setLoading(true);

      const [todasLasCuotas, indicadoresResp, ultimos] = await Promise.all([
        // Trae TODAS las cuotas (de todos los periodos)
        cuotasApi.listarCuotasAdmin({}),
        cuotasApi.obtenerIndicadores(periodo),
        cuotasApi.listarUltimosPagos(6),
      ]);

      setCuotas(todasLasCuotas);
      setIndicadores(indicadoresResp);
      setUltimosPagos(ultimos);
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "Ocurrió un error al cargar la información de pagos.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(periodoFiltro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodosDisponibles = useMemo(
    () =>
      Array.from(new Set(cuotas.map((c) => c.periodo)))
        .filter(Boolean)
        .sort()
        .reverse(),
    [cuotas]
  );

  const bloquesDisponibles = useMemo(
    () =>
      Array.from(
        new Set(
          cuotas
            .map((c) => c.bloque)
            .filter((b): b is string => Boolean(b && b.trim()))
        )
      ).sort(),
    [cuotas]
  );

  // Stands para el combo de cuota individual (desde las cuotas existentes)
  const standsOptions: StandOption[] = useMemo(() => {
    const map = new Map<number, StandOption>();
    cuotas.forEach((c) => {
      if (c.idStand && !map.has(c.idStand)) {
        map.set(c.idStand, {
          idStand: c.idStand,
          nombre: c.nombreStand || `Stand ${c.bloque}-${c.numeroStand}`,
          bloque: c.bloque || "",
          numero: c.numeroStand || "",
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [cuotas]);

  // =========================
  // FILTRO LOCAL
  // =========================
  const cuotasFiltradas = useMemo(() => {
    return cuotas.filter((c) => {
      const coincidePeriodo =
        !periodoFiltro ||
        periodoFiltro === "Todos" ||
        c.periodo === periodoFiltro;

      const coincideEstado =
        estadoFiltro === "Todos" ||
        (c.estado || "").toUpperCase() === estadoFiltro.toUpperCase();

      const coincideBloque =
        bloqueFiltro === "Todos" ||
        (c.bloque || "").toUpperCase() === bloqueFiltro.toUpperCase();

      const textoBusqueda = (
        (c.nombreStand || "") +
        " " +
        (c.bloque || "") +
        " " +
        (c.numeroStand || "")
      )
        .toLowerCase()
        .trim();

      const coincideBusqueda = textoBusqueda.includes(
        busqueda.toLowerCase()
      );

      return (
        coincidePeriodo &&
        coincideEstado &&
        coincideBloque &&
        coincideBusqueda
      );
    });
  }, [cuotas, periodoFiltro, estadoFiltro, bloqueFiltro, busqueda]);

  // =========================
  // HELPERS UI
  // =========================
  const renderEstadoChip = (estado: EstadoUi) => {
    const e = (estado || "").toUpperCase();

    let bg = "#e5e7eb";
    let color = "#374151";
    let label = estado;

    if (e === "PAGADO") {
      bg = "#bbf7d0";
      color = "#166534";
      label = "Pagado";
    } else if (e === "PENDIENTE") {
      bg = "#fef3c7";
      color = "#92400e";
      label = "Pendiente";
    } else if (e === "PARCIAL") {
      bg = "#e0f2fe";
      color = "#0369a1";
      label = "Pago parcial";
    } else if (e === "VENCIDO") {
      bg = "#fee2e2";
      color = "#b91c1c";
      label = "Vencido";
    }

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: bg,
          color,
          fontWeight: 600,
          borderRadius: 999,
          fontSize: 12,
        }}
      />
    );
  };

  const handleChangeFiltro = (field: string, value: string) => {
    if (field === "periodo") {
      setPeriodoFiltro(value);
      setLoadingIndicadores(true);
      cargarDatos(value).finally(() => setLoadingIndicadores(false));
    }
    if (field === "estado") setEstadoFiltro(value);
    if (field === "bloque") setBloqueFiltro(value);
  };

  // =========================
  // PAGO
  // =========================
  const handleAbrirPago = (row: CuotaResponseDto) => {
    setCuotaSeleccionada(row);
    setOpenPagoModal(true);
  };

  const handleRegistrarPago = async (payload: PagoCuotaRequest) => {
    if (!cuotaSeleccionada) return;
    try {
      const actualizada = await cuotasApi.registrarPago(
        cuotaSeleccionada.idCuota,
        payload
      );
      setCuotas((prev) =>
        prev.map((c) =>
          c.idCuota === actualizada.idCuota ? actualizada : c
        )
      );
      showToast("Pago registrado correctamente", "success");
      setOpenPagoModal(false);
      setCuotaSeleccionada(null);
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudo registrar el pago. Revisa los datos.",
        "error"
      );
    }
  };

  // =========================
  // MASIVO
  // =========================
  const handleCuotaMasivaOk = async () => {
    await cargarDatos(periodoFiltro);
  };

  // =========================
  // HISTORIAL STAND
  // =========================
  const handleAbrirHistorial = (row: CuotaResponseDto) => {
    if (!row.idStand) return;
    setStandHistorial({
      idStand: row.idStand,
      nombre: row.nombreStand || `Stand ${row.bloque}-${row.numeroStand}`,
    });
    setOpenHistorialModal(true);
  };

  // =========================
  // CUOTA INDIVIDUAL
  // =========================
  const handleCrearCuotaIndividual = async (data: {
    idStand: number;
    periodo: string;
    fechaVencimiento?: string;
    montoCuota: number;
  }) => {
    try {
      await cuotasApi.generarCuotaParaStand(data.idStand, {
        periodo: data.periodo,
        fechaVencimiento: data.fechaVencimiento,
        montoCuota: data.montoCuota,
      });
      showToast("Cuota creada correctamente", "success");
      setOpenCuotaStandModal(false);
      await cargarDatos(periodoFiltro);
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudo crear la cuota para el stand.",
        "error"
      );
    }
  };

  // =========================
  // FILTROS PARA FILTERSBAR
  // =========================
  const filtros = [
    {
      label: "Periodo",
      field: "periodo",
      options:
        periodosDisponibles.length > 0 ? periodosDisponibles : [periodoFiltro],
    },
    {
      label: "Estado",
      field: "estado",
      options: ["PAGADO", "PENDIENTE", "PARCIAL", "VENCIDO"],
    },
    {
      label: "Bloque",
      field: "bloque",
      options: bloquesDisponibles,
    },
  ];

  // =========================
  // RESUMEN PERIODO (contadores de estados)
  // =========================
  const resumenPeriodo = useMemo(() => {
    const cuotasPeriodo = cuotas.filter((c) =>
      !periodoFiltro || periodoFiltro === "Todos"
        ? true
        : c.periodo === periodoFiltro
    );

    let pagados = 0;
    let parciales = 0;
    let vencidos = 0;

    cuotasPeriodo.forEach((c) => {
      const e = (c.estado || "").toUpperCase();
      if (e === "PAGADO") pagados++;
      else if (e === "PARCIAL") parciales++;
      else if (e === "VENCIDO") vencidos++;
    });

    const total = cuotasPeriodo.length;
    const porcentajeVencidos = total > 0 ? (vencidos * 100.0) / total : 0;

    return {
      total,
      pagados,
      parciales,
      vencidos,
      porcentajeVencidos,
    };
  }, [cuotas, periodoFiltro]);

  // =========================
  // KPIs: Proyección, próximos a vencer, distribución por método
  // =========================
  const kpiPeriodo = useMemo(() => {
    const cuotasPeriodo = cuotas.filter((c) =>
      !periodoFiltro || periodoFiltro === "Todos"
        ? true
        : c.periodo === periodoFiltro
    );

    let totalCuota = 0;
    let totalPagado = 0;
    let saldoPendiente = 0;
    let vencidoMonto = 0;
    let proximosAVencer = 0;

    const hoy = new Date();
    const en7dias = new Date();
    en7dias.setDate(hoy.getDate() + 7);

    const pagosPorMetodo: Record<string, number> = {};

    cuotasPeriodo.forEach((c) => {
      const cuota = Number(c.montoCuota || 0);
      const pag = Number(c.montoPagado || 0);
      const saldo = cuota - pag;

      totalCuota += cuota;
      totalPagado += pag;
      if (saldo > 0) saldoPendiente += saldo;

      const estado = (c.estado || "").toUpperCase();
      if (estado === "VENCIDO" && saldo > 0) {
        vencidoMonto += saldo;
      }

      // Próximos a vencer (7 días), solo los que no están pagados
      if (c.fechaVencimiento && estado !== "PAGADO") {
        const fv = new Date(c.fechaVencimiento);
        if (fv >= hoy && fv <= en7dias) {
          proximosAVencer++;
        }
      }

      // Distribución por método de pago (solo cuotas con pago registrado)
      if (c.medioPago && c.fechaPago) {
        const key = c.medioPago.toUpperCase();
        pagosPorMetodo[key] = (pagosPorMetodo[key] || 0) + pag;
      }
    });

    const totalPagosMetodo = Object.values(pagosPorMetodo).reduce(
      (acc, v) => acc + v,
      0
    );

    const distribucionMetodos = Object.entries(pagosPorMetodo).map(
      ([medio, monto]) => ({
        medio,
        monto,
        porcentaje:
          totalPagosMetodo > 0 ? (monto * 100.0) / totalPagosMetodo : 0,
      })
    );

    return {
      totalCuota,
      totalPagado,
      saldoPendiente,
      vencidoMonto,
      proximosAVencer,
      distribucionMetodos,
    };
  }, [cuotas, periodoFiltro]);

  // =========================
  // RENDER
  // =========================

  if (loading && !cuotas.length) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Cargando información de pagos...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* CABECERA */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily:
              '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
          }}
        >
          Pagos de Stands
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 540 }}
        >
          Administra las cuotas mensuales de los stands, registra pagos y
          visualiza indicadores de morosidad.
        </Typography>
      </Box>

      {/* FILTROS + BOTONES */}
      <FiltersBar
        filters={filtros}
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onFilterChange={handleChangeFiltro}
        onAdd={() => setOpenMasivoModal(true)}
        addLabel="Generar cuotas"
        addStartIcon={<AddCardIcon />}
        addButtonSx={{
          borderRadius: "999px",
          px: 3,
          py: 1.1,
          textTransform: "none",
          fontWeight: 700,
          backgroundColor: green,
          boxShadow: "0 6px 14px rgba(34, 197, 94, 0.25)",
          "&:hover": {
            backgroundColor: greenDark,
            boxShadow: "0 8px 18px rgba(22, 163, 74, 0.35)",
          },
        }}
        extraRightContent={
          <Button
            variant="outlined"
            startIcon={<AddCardIcon />}
            onClick={() => setOpenCuotaStandModal(true)}
            sx={{
              borderRadius: "999px",
              px: 3,
              py: 1.1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cuota individual
          </Button>
        }
      />

      {/* CARDS KPI: grid 3 columnas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.4fr 1.2fr 1.2fr",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* 1) Estado de pagos del periodo (morosos vencidos + contadores) */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Estado de pagos del periodo
                </Typography>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  {periodoFiltro === "Todos"
                    ? "Todos los periodos"
                    : `Periodo ${periodoFiltro}`}
                </Typography>
              </Box>
              {loadingIndicadores && <CircularProgress size={18} />}
            </Stack>

            {resumenPeriodo.total > 0 ? (
              <>
                <Box
                  sx={{
                    bgcolor: "#fee2e2",
                    borderRadius: 3,
                    p: 2,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: "uppercase",
                        color: "#b91c1c",
                        fontWeight: 700,
                        letterSpacing: ".08em",
                      }}
                    >
                      Morosos con deuda vencida
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#b91c1c",
                        lineHeight: 1.1,
                      }}
                    >
                      {resumenPeriodo.vencidos}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      {resumenPeriodo.porcentajeVencidos.toFixed(1)}% de las
                      cuotas del periodo
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#9ca3af" }}
                    >
                      Total cuotas
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#111827" }}
                    >
                      {resumenPeriodo.total}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", display: "block", mb: 0.5 }}
                    >
                      Pagos completos
                    </Typography>
                    <Chip
                      label={`${resumenPeriodo.pagados} al día`}
                      size="small"
                      sx={{
                        bgcolor: "#dcfce7",
                        color: "#166534",
                        fontWeight: 600,
                        borderRadius: 999,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", display: "block", mb: 0.5 }}
                    >
                      Pagos parciales
                    </Typography>
                    <Chip
                      label={`${resumenPeriodo.parciales} con saldo`}
                      size="small"
                      sx={{
                        bgcolor: "#e0f2fe",
                        color: "#0369a1",
                        fontWeight: 600,
                        borderRadius: 999,
                      }}
                    />
                  </Box>
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se encontraron cuotas para el periodo seleccionado.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 2) Proyección de ingresos + próximas a vencer */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#6b7280", mb: 1 }}
            >
              Proyección de ingresos del periodo
            </Typography>

            <Stack spacing={1.2} mb={2}>
              <Box>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Total proyectado
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#111827" }}
                >
                  S/. {kpiPeriodo.totalCuota.toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Recaudado
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "#16a34a" }}
                >
                  S/. {kpiPeriodo.totalPagado.toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Saldo pendiente
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "#b45309" }}
                >
                  S/. {kpiPeriodo.saldoPendiente.toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Deuda vencida (monto)
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "#b91c1c" }}
                >
                  S/. {kpiPeriodo.vencidoMonto.toFixed(2)}
                </Typography>
              </Box>
            </Stack>

            {/* Barra de progreso simple: recaudado vs total */}
            {kpiPeriodo.totalCuota > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", display: "block", mb: 0.5 }}
                >
                  Avance de recaudación
                </Typography>
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
                      width: `${
                        (kpiPeriodo.totalPagado * 100) /
                        (kpiPeriodo.totalCuota || 1)
                      }%`,
                      maxWidth: "100%",
                      bgcolor: "#22c55e",
                      transition: "width .3s ease",
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Próximas a vencer */}
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 3,
                bgcolor: "#fef9c3",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  color: "#854d0e",
                  fontWeight: 700,
                  letterSpacing: ".08em",
                }}
              >
                Cuotas próximas a vencerse (7 días)
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#854d0e", mt: 0.5 }}
              >
                {kpiPeriodo.proximosAVencer}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 3) Distribución por método de pago + saldo pendiente acumulado */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#6b7280", mb: 1 }}
            >
              Distribución de pagos por método
            </Typography>

            {kpiPeriodo.distribucionMetodos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aún no hay pagos registrados en este periodo.
              </Typography>
            ) : (
              <Stack spacing={1.2} sx={{ mb: 2 }}>
                {kpiPeriodo.distribucionMetodos.map((m) => (
                  <Box key={m.medio}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#111827" }}
                      >
                        {m.medio}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#6b7280" }}
                      >
                        {m.porcentaje.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        mt: 0.5,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${m.porcentaje}%`,
                          maxWidth: "100%",
                          bgcolor: "#22c55e",
                          opacity: 0.9,
                          transition: "width .3s ease",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            <Box
              sx={{
                mt: 1,
                pt: 1,
                borderTop: "1px dashed #e5e7eb",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af", display: "block" }}
              >
                Saldo pendiente acumulado
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#111827" }}
              >
                S/. {kpiPeriodo.saldoPendiente.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* TABLA PRINCIPAL */}
      <Paper
        elevation={0}
        sx={{
          mt: 1,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#f9fafb",
                  "& th": {
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  },
                }}
              >
                <TableCell>Bloque</TableCell>
                <TableCell>N° stand</TableCell>
                <TableCell>Nombre comercial</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Cuota (S/.)</TableCell>
                <TableCell>Pagado</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Vence</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {cuotasFiltradas.map((row) => (
                <TableRow
                  key={row.idCuota}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 14,
                    },
                  }}
                >
                  <TableCell>{row.bloque}</TableCell>
                  <TableCell>{row.numeroStand}</TableCell>
                  <TableCell>{row.nombreStand}</TableCell>
                  <TableCell>{row.periodo}</TableCell>
                  <TableCell>
                    S/. {Number(row.montoCuota || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    S/. {Number(row.montoPagado || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    S/. {Number(row.saldoPendiente || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{row.fechaVencimiento}</TableCell>
                  <TableCell>{renderEstadoChip(row.estado)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => handleAbrirHistorial(row)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>

                      {row.estado?.toUpperCase() !== "PAGADO" && (
                        <IconButton
                          size="small"
                          onClick={() => handleAbrirPago(row)}
                          sx={{ color: greenDark }}
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {cuotasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Box
                      sx={{
                        py: 5,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      No se encontraron cuotas con los filtros actuales.
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MODAL REGISTRAR PAGO */}
      <PaymentModal
        open={openPagoModal}
        onClose={() => {
          setOpenPagoModal(false);
          setCuotaSeleccionada(null);
        }}
        onSubmit={handleRegistrarPago}
        dataPago={
          cuotaSeleccionada
            ? {
                id: cuotaSeleccionada.idCuota,
                bloque: cuotaSeleccionada.bloque,
                numero: cuotaSeleccionada.numeroStand,
                nombreComercial: cuotaSeleccionada.nombreStand,
                periodo: cuotaSeleccionada.periodo,
                montoCuota: Number(cuotaSeleccionada.montoCuota || 0),
                montoPagado: Number(cuotaSeleccionada.montoPagado || 0),
                fechaVencimiento: cuotaSeleccionada.fechaVencimiento || "",
                estado:
                  (cuotaSeleccionada.estado?.toUpperCase() as any) ||
                  "PENDIENTE",
              }
            : null
        }
      />

      {/* MODAL CUOTAS MASIVO */}
      <CuotaMasivaModal
        open={openMasivoModal}
        onClose={() => setOpenMasivoModal(false)}
        onSuccess={handleCuotaMasivaOk}
        periodoDefault={periodoFiltro}
      />

      {/* MODAL CUOTA INDIVIDUAL */}
      <CuotaStandModal
        open={openCuotaStandModal}
        onClose={() => setOpenCuotaStandModal(false)}
        stands={standsOptions}
        periodoDefault={periodoFiltro}
        onSubmit={handleCrearCuotaIndividual}
      />

      {/* MODAL HISTORIAL POR STAND */}
      {standHistorial && (
        <HistorialCuotasModal
          open={openHistorialModal}
          onClose={() => setOpenHistorialModal(false)}
          stand={standHistorial}
        />
      )}
    </>
  );
}