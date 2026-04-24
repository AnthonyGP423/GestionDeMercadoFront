import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Skeleton,
  Alert,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaymentsIcon from "@mui/icons-material/Payments";

import { cuotasSocioApi, SocioCuotaDto } from "../../../api/socio/cuotasSocioApi";

const amber = "#b45309";
const amberSoft = "#fffbeb";
const green = "#166534";
const greenSoft = "#ecfdf5";
const red = "#b91c1c";
const redSoft = "#fef2f2";
const cardBorder = "1px solid #e5e7eb";

function parseDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function formatMoney(v?: number) {
  const n = Number(v ?? 0);
  return `S/ ${n.toFixed(2)}`;
}

function formatDate(iso?: string) {
  const d = parseDate(iso);
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-PE", { year: "numeric", month: "short", day: "2-digit" }).format(d);
}

function daysFromToday(iso?: string) {
  const d = parseDate(iso);
  if (!d) return null;
  const a = new Date(d); a.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

type EstadoUI = "" | "PAGADO" | "PENDIENTE" | "VENCIDA";
type OrdenUI = "VENC_ASC" | "VENC_DESC" | "SALDO_DESC";

function estadoDerivado(c: SocioCuotaDto): "PAGADO" | "PENDIENTE" | "VENCIDA" {
  const est = String(c.estado ?? "").toUpperCase().trim();
  if (est === "PAGADO") return "PAGADO";

  const fv = parseDate(c.fechaVencimiento);
  const today = new Date(); today.setHours(0,0,0,0);

  if (est === "VENCIDA") return "VENCIDA";

  if (fv) {
    const v = new Date(fv); v.setHours(0,0,0,0);
    if (v < today) return "VENCIDA";
  }

  return "PENDIENTE";
}

export default function MisCuotas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cuotas, setCuotas] = useState<SocioCuotaDto[]>([]);
  const [periodo, setPeriodo] = useState("");
  const [estadoUI, setEstadoUI] = useState<EstadoUI>("");
  const [q, setQ] = useState("");
  const [orden, setOrden] = useState<OrdenUI>("VENC_ASC");

  // Para colapsables por cuota (detalle pago)
  const [openPay, setOpenPay] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await cuotasSocioApi.listar({
          periodo: periodo || undefined,
          // si tu backend filtra por estado, úsalo. Si no, lo hacemos UI.
          // estado: estadoUI || undefined,
          page: 0,
          size: 50,
        });

        setCuotas(res.data.content ?? []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar tus cuotas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [periodo]);

  const cuotasFiltradas = useMemo(() => {
    const norm = (s?: string) => String(s ?? "").toUpperCase().trim();
    const query = norm(q);

    let arr = [...cuotas];

    // filtro por estado (UI)
    if (estadoUI) {
      arr = arr.filter((c) => estadoDerivado(c) === estadoUI);
    }

    // búsqueda
    if (query) {
      arr = arr.filter((c) => {
        const hay =
          `${c.nombreStand ?? c.stand ?? ""} ${c.bloque ?? ""} ${c.numeroStand ?? ""} ${c.periodo ?? ""}`
            .toUpperCase();
        return hay.includes(query);
      });
    }

    // orden
    arr.sort((a, b) => {
      const da = parseDate(a.fechaVencimiento)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = parseDate(b.fechaVencimiento)?.getTime() ?? Number.MAX_SAFE_INTEGER;

      const sa = Number(a.saldoPendiente ?? 0);
      const sb = Number(b.saldoPendiente ?? 0);

      if (orden === "VENC_ASC") return da - db;
      if (orden === "VENC_DESC") return db - da;
      if (orden === "SALDO_DESC") return sb - sa;
      return 0;
    });

    return arr;
  }, [cuotas, estadoUI, q, orden]);

  const kpis = useMemo(() => {
    let pagadas = 0, pendientes = 0, vencidas = 0;
    let saldoTotal = 0;

    for (const c of cuotas) {
      const ed = estadoDerivado(c);
      if (ed === "PAGADO") pagadas++;
      else if (ed === "VENCIDA") vencidas++;
      else pendientes++;

      saldoTotal += Number(c.saldoPendiente ?? 0);
    }

    return { total: cuotas.length, pagadas, pendientes, vencidas, saldoTotal };
  }, [cuotas]);

  const proxima = useMemo(() => {
    const noPagadas = cuotas
      .filter((c) => estadoDerivado(c) !== "PAGADO")
      .sort((a, b) => {
        const da = parseDate(a.fechaVencimiento)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const db = parseDate(b.fechaVencimiento)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return da - db;
      });

    return noPagadas[0] ?? null;
  }, [cuotas]);

  const cuotasPorStand = useMemo(() => {
    const map = new Map<string, SocioCuotaDto[]>();

    for (const c of cuotasFiltradas) {
      const key =
        String(c.idStand ?? "") ||
        `${c.nombreStand ?? c.stand ?? "Stand"}-${c.bloque ?? ""}-${c.numeroStand ?? ""}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }

    return Array.from(map.values());
  }, [cuotasFiltradas]);

  const chipEstado = (c: SocioCuotaDto) => {
    const ed = estadoDerivado(c);
    if (ed === "PAGADO") return { label: "PAGADO", bg: greenSoft, color: green };
    if (ed === "VENCIDA") return { label: "VENCIDA", bg: redSoft, color: red };
    return { label: "PENDIENTE", bg: amberSoft, color: amber };
  };

  const togglePay = (key: string) => setOpenPay((p) => ({ ...p, [key]: !p[key] }));

  return (
    <Box sx={{ pb: 4 }}>
      <Stack spacing={0.4} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Mis cuotas
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 860 }}>
          Revisa el estado de tus cuotas por puesto. Los pagos se registran por administración.
        </Typography>
      </Stack>

      {/* Próxima a vencer */}
      {!loading && proxima && (
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            border: cardBorder,
            mb: 2,
            bgcolor: estadoDerivado(proxima) === "VENCIDA" ? redSoft : "#f8fafc",
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.25,
                  bgcolor: "#e2e8f0",
                  display: "grid",
                  placeItems: "center",
                  color: "#0f172a",
                }}
              >
                <EventIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900 }} noWrap>
                  Próxima cuota: {proxima.periodo ?? "—"} · {formatMoney(proxima.saldoPendiente ?? proxima.montoCuota ?? proxima.monto)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                  {proxima.nombreStand ?? proxima.stand ?? "Stand"} · Bloque {proxima.bloque ?? "—"} · Puesto {proxima.numeroStand ?? "—"} ·
                  Vence: {formatDate(proxima.fechaVencimiento)}
                </Typography>
              </Box>
            </Stack>

            {(() => {
              const d = daysFromToday(proxima.fechaVencimiento);
              const label =
                d == null ? "Sin fecha"
                : d < 0 ? `Venció hace ${Math.abs(d)} día(s)`
                : d === 0 ? "Vence hoy"
                : `Vence en ${d} día(s)`;

              const ed = estadoDerivado(proxima);
              const bg = ed === "VENCIDA" ? redSoft : amberSoft;
              const color = ed === "VENCIDA" ? red : amber;

              return (
                <Chip
                  label={label}
                  sx={{ bgcolor: bg, color, fontWeight: 900, borderRadius: 999 }}
                />
              );
            })()}
          </Stack>
        </Paper>
      )}

      {/* KPIs */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {[
          { label: "Total", value: kpis.total, bg: "#fff", color: "#0f172a" },
          { label: "Pendientes", value: kpis.pendientes, bg: amberSoft, color: amber },
          { label: "Vencidas", value: kpis.vencidas, bg: redSoft, color: red },
          { label: "Saldo pendiente", value: formatMoney(kpis.saldoTotal), bg: "#fff7ed", color: "#9a3412" },
        ].map((k) => (
          <Paper
            key={k.label}
            sx={{
              flex: "1 1 220px",
              minWidth: 220,
              p: 2,
              borderRadius: 3,
              border: cardBorder,
              bgcolor: k.bg,
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
              {k.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: k.color, mt: 0.5 }}>
              {k.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filtros */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Periodo (ej. 2025-01)"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          sx={{ width: 220 }}
        />

        <TextField
          select
          size="small"
          label="Estado"
          value={estadoUI}
          onChange={(e) => setEstadoUI(e.target.value as EstadoUI)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="PAGADO">Pagada</MenuItem>
          <MenuItem value="PENDIENTE">Pendiente</MenuItem>
          <MenuItem value="VENCIDA">Vencida</MenuItem>
        </TextField>

        <TextField
          size="small"
          label="Buscar (stand / bloque / puesto / periodo)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ width: { xs: "100%", sm: 360 } }}
        />

        <TextField
          select
          size="small"
          label="Orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value as OrdenUI)}
          sx={{ width: 220 }}
        >
          <MenuItem value="VENC_ASC">Vencimiento (próximo primero)</MenuItem>
          <MenuItem value="VENC_DESC">Vencimiento (más lejano primero)</MenuItem>
          <MenuItem value="SALDO_DESC">Saldo (mayor primero)</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Stack spacing={1.25}>
          <Skeleton height={140} />
          <Skeleton height={140} />
        </Stack>
      ) : cuotasPorStand.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3, border: cardBorder }}>
          <Typography sx={{ fontWeight: 900 }}>Sin cuotas</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            No se encontraron cuotas con los filtros aplicados.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {cuotasPorStand.map((grupo, idx) => {
            const s = grupo[0];

            // resumen stand
            const total = grupo.length;
            const pagadas = grupo.filter((c) => estadoDerivado(c) === "PAGADO").length;
            const saldo = grupo.reduce((acc, c) => acc + Number(c.saldoPendiente ?? 0), 0);

            // progreso (si hay montoCuota/montoPagado, si no, aproximamos por cuotas pagadas)
            const sumCuota = grupo.reduce((acc, c) => acc + Number(c.montoCuota ?? c.monto ?? 0), 0);
            const sumPagado = grupo.reduce((acc, c) => acc + Number(c.montoPagado ?? 0), 0);
            const hasMoneyProgress = sumCuota > 0;

            const pct = hasMoneyProgress
              ? Math.min(100, Math.max(0, (sumPagado / sumCuota) * 100))
              : Math.min(100, Math.max(0, (pagadas / Math.max(1, total)) * 100));

            return (
              <Paper
                key={`${s.idStand ?? s.nombreStand ?? "stand"}-${idx}`}
                sx={{ p: 2.25, borderRadius: 3, border: cardBorder }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ gap: 2 }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }} noWrap>
                      {s.nombreStand ?? s.stand ?? "Stand"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                      Bloque {s.bloque ?? "—"} · Puesto {s.numeroStand ?? "—"}
                    </Typography>

                    <Box sx={{ mt: 1.2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
                          Progreso de pagos
                        </Typography>

                        <Typography variant="caption" sx={{ color: "#0f172a", fontWeight: 900 }}>
                          {hasMoneyProgress
                            ? `${formatMoney(sumPagado)} / ${formatMoney(sumCuota)}`
                            : `${pagadas}/${total} cuotas`}
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          mt: 0.6,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            backgroundColor: pct >= 95 ? green : amber,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                    <Chip
                      size="small"
                      label={`${pagadas}/${total} pagadas`}
                      sx={{ bgcolor: greenSoft, color: green, fontWeight: 900, borderRadius: 999 }}
                    />
                    <Chip
                      size="small"
                      label={`Saldo: ${formatMoney(saldo)}`}
                      sx={{ bgcolor: "#fff7ed", color: "#9a3412", fontWeight: 900, borderRadius: 999 }}
                    />
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.25 }} />

                <Stack spacing={1}>
                  {grupo.map((c) => {
                    const ch = chipEstado(c);
                    const key = String(c.idCuota ?? `${c.periodo}-${c.fechaVencimiento}-${c.idStand ?? idx}`);

                    const hasPagoInfo =
                      !!c.medioPago || !!c.referenciaPago || !!c.fechaPago || Number(c.montoPagado ?? 0) > 0;

                    return (
                      <Box key={key} sx={{ border: "1px solid #f1f5f9", borderRadius: 2, p: 1.25 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 2 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 900 }} noWrap>
                              {c.periodo ?? "Periodo"} · {formatMoney(c.montoCuota ?? c.monto)}
                            </Typography>

                            <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                              Vence: {formatDate(c.fechaVencimiento)} · Saldo: {formatMoney(c.saldoPendiente)}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Chip
                              label={ch.label}
                              sx={{
                                fontWeight: 900,
                                bgcolor: ch.bg,
                                color: ch.color,
                                borderRadius: 999,
                              }}
                            />

                            {hasPagoInfo && (
                              <Tooltip title="Ver detalle de pago">
                                <IconButton size="small" onClick={() => togglePay(key)}>
                                  <ExpandMoreIcon
                                    sx={{
                                      transform: openPay[key] ? "rotate(180deg)" : "rotate(0deg)",
                                      transition: "transform .2s ease",
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </Stack>

                        {hasPagoInfo && (
                          <Collapse in={!!openPay[key]} timeout="auto" unmountOnExit>
                            <Divider sx={{ my: 1.1 }} />

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                              <PaymentsIcon sx={{ fontSize: 18, color: "#334155" }} />
                              <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                Detalle de pago
                              </Typography>
                              <Tooltip title="Información registrada por administración">
                                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#64748b" }} />
                              </Tooltip>
                            </Stack>

                            <Stack spacing={0.5}>
                              <Typography variant="caption" sx={{ color: "#475569" }}>
                                Monto pagado: <b>{formatMoney(c.montoPagado)}</b>
                              </Typography>

                              <Typography variant="caption" sx={{ color: "#475569" }}>
                                Fecha de pago: <b>{formatDate(c.fechaPago)}</b>
                              </Typography>

                              <Typography variant="caption" sx={{ color: "#475569" }}>
                                Medio: <b>{c.medioPago ?? "—"}</b> · Referencia: <b>{c.referenciaPago ?? "—"}</b>
                              </Typography>
                            </Stack>
                          </Collapse>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}