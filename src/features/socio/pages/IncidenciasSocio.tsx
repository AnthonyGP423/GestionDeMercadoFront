import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Divider,
  Skeleton,
  Alert,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

import { standsSocioApi, type SocioStandDto } from "../../../api/socio/standsSocioApi";
import {
  incidenciasSocioApi,
  type IncidenciaSocioDto,
  type IncidenciaCreateRequest,
} from "../../../api/socio/incidenciasSocioApi";

import IncidenciaModal from "../components/modals/IncidenciaModal";

const cardBorder = "1px solid #e5e7eb";
const amber = "#b45309";
const amberSoft = "#fffbeb";
const green = "#166534";
const greenSoft = "#ecfdf5";
const red = "#b91c1c";
const redSoft = "#fef2f2";

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

function fmtDate(s?: string) {
  if (!s) return "—";
  // sin asumir timezone exacto; solo display básico
  return String(s).replace("T", " ").slice(0, 16);
}

export default function IncidenciasSocioPage() {
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stands, setStands] = useState<SocioStandDto[]>([]);
  const [defaultStandId, setDefaultStandId] = useState<number | "">("");

  const [estado, setEstado] = useState<string>(""); // query param
  const [q, setQ] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [data, setData] = useState<{
    content: IncidenciaSocioDto[];
    totalPages: number;
    totalElements: number;
  }>({ content: [], totalPages: 1, totalElements: 0 });

  const [openModal, setOpenModal] = useState(false);

  const cargarStands = async () => {
    const res = await standsSocioApi.misStands();
    const arr = toArray<SocioStandDto>(res.data);
    setStands(arr);
    if (arr.length > 0 && defaultStandId === "") setDefaultStandId(arr[0].id);
  };

  const cargarIncidencias = async (opts?: { keepPage?: boolean }) => {
    setLoadingList(true);
    try {
      setError(null);
      const res = await incidenciasSocioApi.listar({
        estado: estado || undefined,
        page: opts?.keepPage ? page : 0,
        size,
      });
      const pageData = res.data ?? {};
setData({
  content: pageData.content ?? [],
  totalPages: pageData.totalPages ?? 1,
  totalElements: pageData.totalElements ?? 0,
});
if (!opts?.keepPage) setPage(0);
      if (!opts?.keepPage) setPage(0);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar tus incidencias.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        await cargarStands();
        await cargarIncidencias();
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el módulo de incidencias.");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cuando cambian filtros “server-side”
  useEffect(() => {
    if (!loading) cargarIncidencias().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, size]);

  // paginación
  useEffect(() => {
    if (!loading) cargarIncidencias({ keepPage: true }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const listUI = useMemo(() => {
    const query = q.trim().toUpperCase();
    let arr = [...(data.content ?? [])];

    if (query) {
      arr = arr.filter((it) => {
        const blob = `${it.titulo} ${it.descripcion} ${it.nombreStand} ${it.tipo} ${it.prioridad} ${it.estado}`.toUpperCase();
        return blob.includes(query);
      });
    }

    // orden: más reciente arriba (si viene fechaReporte)
    arr.sort((a, b) => String(b.fechaReporte ?? "").localeCompare(String(a.fechaReporte ?? "")));
    return arr;
  }, [data.content, q]);

  const kpis = useMemo(() => {
    const all = data.content ?? [];
    const total = data.totalElements ?? all.length;

    const norm = (s?: string) => String(s ?? "").toUpperCase().trim();
    const abiertas = all.filter((x) => ["ABIERTA", "ABIERTO", "NUEVA"].includes(norm(x.estado))).length;
    const proceso = all.filter((x) => ["EN_PROCESO", "PROCESO", "ASIGNADA"].includes(norm(x.estado))).length;
    const cerradas = all.filter((x) => ["CERRADA", "RESUELTA", "FINALIZADA"].includes(norm(x.estado))).length;

    return { total, abiertas, proceso, cerradas };
  }, [data]);

  const crearIncidencia = async (payload: IncidenciaCreateRequest) => {
    await incidenciasSocioApi.crear(payload);
    setOpenModal(false);
    await cargarIncidencias(); // recarga
  };

  if (loading) {
    return (
      <Stack spacing={1.25}>
        <Skeleton height={90} />
        <Skeleton height={140} />
        <Skeleton height={140} />
      </Stack>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Stack spacing={0.4} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
          Incidencias
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 900 }}>
          Registra y da seguimiento a problemas del mercado asociados a tus stands.
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Barra superior */}
      <Paper sx={{ p: 2, borderRadius: 3, border: cardBorder, mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {/* ✅ No asumo el catálogo real del backend: esto es editable */}
            <MenuItem value="ABIERTA">ABIERTA</MenuItem>
            <MenuItem value="EN_PROCESO">EN_PROCESO</MenuItem>
            <MenuItem value="RESUELTA">RESUELTA</MenuItem>
            <MenuItem value="CERRADA">CERRADA</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="Buscar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ width: { xs: "100%", sm: 360 } }}
          />

          <TextField
            select
            size="small"
            label="Tamaño"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            sx={{ width: 140 }}
          >
            {[5, 10, 20, 50].map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Recargar">
            <span>
              <IconButton onClick={() => cargarIncidencias({ keepPage: true })} disabled={loadingList}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            disabled={loadingList}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 3,
              bgcolor: amber,
              "&:hover": { bgcolor: "#92400e" },
            }}
          >
            Nueva incidencia
          </Button>
        </Stack>
      </Paper>

      {/* KPIs */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {[
          { label: "Total", value: kpis.total, bg: "#fff", color: "#0f172a" },
          { label: "Abiertas", value: kpis.abiertas, bg: amberSoft, color: amber },
          { label: "En proceso", value: kpis.proceso, bg: "#f1f5f9", color: "#0f172a" },
          { label: "Cerradas", value: kpis.cerradas, bg: greenSoft, color: green },
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

      {loadingList ? (
        <Stack spacing={1.25}>
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </Stack>
      ) : listUI.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3, border: cardBorder }}>
          <Typography sx={{ fontWeight: 900 }}>Sin incidencias</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Registra una incidencia para que administración pueda asignarla y resolverla.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {listUI.map((it) => {
            const estadoNorm = String(it.estado ?? "").toUpperCase().trim();
            const estadoStyle =
              estadoNorm.includes("CERR") || estadoNorm.includes("RESUEL")
                ? { bg: greenSoft, color: green }
                : estadoNorm.includes("PROCES") || estadoNorm.includes("ASIGN")
                ? { bg: "#f1f5f9", color: "#0f172a" }
                : { bg: amberSoft, color: amber };

            return (
              <Paper
                key={it.idIncidencia}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: cardBorder,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                  transition: "all .18s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
                    borderColor: "#f59e0b55",
                  },
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.25,
                        bgcolor: redSoft,
                        color: red,
                        display: "grid",
                        placeItems: "center",
                        flex: "0 0 auto",
                      }}
                    >
                      <ReportProblemOutlinedIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography sx={{ fontWeight: 900 }} noWrap>
                          {it.titulo}
                        </Typography>

                        <Chip
                          size="small"
                          label={estadoNorm || "—"}
                          sx={{ fontWeight: 900, bgcolor: estadoStyle.bg, color: estadoStyle.color, borderRadius: 999 }}
                        />
                        <Chip
                          size="small"
                          label={`Prioridad: ${it.prioridad ?? "—"}`}
                          sx={{ fontWeight: 900, bgcolor: "#fefce8", color: "#a16207", borderRadius: 999 }}
                        />
                        <Chip
                          size="small"
                          label={`Tipo: ${it.tipo ?? "—"}`}
                          sx={{ fontWeight: 900, bgcolor: "#f1f5f9", color: "#0f172a", borderRadius: 999 }}
                        />
                      </Stack>

                      <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                        {it.nombreStand ? `${it.nombreStand} · ` : ""}
                        {it.bloque ? `Bloque ${it.bloque} · ` : ""}
                        {it.numeroStand ? `Puesto ${it.numeroStand} · ` : ""}
                        Reportado: {fmtDate(it.fechaReporte)}
                        {it.fechaCierre ? ` · Cierre: ${fmtDate(it.fechaCierre)}` : ""}
                      </Typography>
                    </Box>
                  </Stack>

                  {it.descripcion && (
                    <>
                      <Divider sx={{ my: 1.1 }} />
                      <Typography variant="body2" sx={{ color: "#334155" }}>
                        {it.descripcion}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Paginación simple */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
          Página {page + 1} de {Math.max(1, data.totalPages)}
        </Typography>
        <Button
          variant="outlined"
          disabled={page <= 0 || loadingList}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999, borderColor: "#e5e7eb" }}
        >
          Anterior
        </Button>
        <Button
          variant="outlined"
          disabled={page >= (data.totalPages - 1) || loadingList}
          onClick={() => setPage((p) => p + 1)}
          sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999, borderColor: "#e5e7eb" }}
        >
          Siguiente
        </Button>
      </Stack>

      {/* Modal */}
      <IncidenciaModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        stands={stands}
        defaultStandId={defaultStandId}
        onSave={crearIncidencia}
      />
    </Box>
  );
}