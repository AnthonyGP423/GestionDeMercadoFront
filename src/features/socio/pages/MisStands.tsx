import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Divider,
  Skeleton,
  Alert,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

import { standsSocioApi } from "../../../api/socio/standsSocioApi";
import { incidenciasSocioApi } from "../../../api/socio/incidenciasSocioApi";
import { productosSocioApi } from "../../../api/socio/productosSocioApi";

const amber = "#b45309";
const amberSoft = "#fffbeb";
const cardBorder = "1px solid #e5e7eb";

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

function httpStatus(err: any): number | null {
  return err?.response?.status ?? err?.status ?? null;
}

export default function MisStands() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [misStands, setMisStands] = useState<any[]>([]);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [productosPorStand, setProductosPorStand] = useState<Record<number, number>>({});

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const [standsRes, incRes] = await Promise.all([
          standsSocioApi.misStands(),
          incidenciasSocioApi.listar({ page: 0, size: 200 }),
        ]);

        const stands = toArray(standsRes.data);
        const incs = toArray(incRes.data); // ✅ FIX

        setMisStands(stands);
        setIncidencias(incs);

        const counts: Record<number, number> = {};
        await Promise.all(
          stands.map(async (s: any) => {
            try {
              const prodRes = await productosSocioApi.listarPorStand(s.id);
              const productos = toArray(prodRes.data);
              counts[s.id] = productos.length;
            } catch {
              counts[s.id] = 0;
            }
          })
        );
        setProductosPorStand(counts);
      } catch (e: any) {
        console.error(e);
        const st = httpStatus(e);
        if (st === 401) setError("Tu sesión expiró. Por favor vuelve a iniciar sesión.");
        else setError("No se pudo cargar tus puestos. Verifica tu sesión o el servidor.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const incidenciasAbiertasPorStand = useMemo(() => {
    const map: Record<number, number> = {};
    for (const i of incidencias) {
      const idStand = Number(i.idStand ?? 0);
      if (!idStand) continue;
      const estado = String(i.estado ?? "").toUpperCase();
      const abierta = !estado.includes("CERR") && !estado.includes("RESUEL");
      if (!abierta) continue;
      map[idStand] = (map[idStand] ?? 0) + 1;
    }
    return map;
  }, [incidencias]);

  const toggleEstado = async (stand: any) => {
    const actual = String(stand.estado ?? "").toUpperCase();

    // ✅ regla: clausurado no se toca
    if (actual === "CLAUSURADO") return;

    // ✅ toggle seguro solo entre ABIERTO y CERRADO
    const isAbierto = actual === "ABIERTO";
    const isCerrado = actual === "CERRADO";

    if (!isAbierto && !isCerrado) {
      setError(`No se puede cambiar estado desde "${actual}".`);
      return;
    }

    const next = isAbierto ? "CERRADO" : "ABIERTO";

    try {
      setBusyId(stand.id);
      setError(null);

      await standsSocioApi.cambiarEstado(stand.id, next);

      setMisStands((prev) =>
        prev.map((s) => (s.id === stand.id ? { ...s, estado: next } : s))
      );
    } catch (e: any) {
      console.error(e);
      const st = httpStatus(e);

      if (st === 401) {
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      } else if (st === 403) {
        setError("No tienes permisos para cambiar el estado de este puesto (Access Denied).");
      } else {
        setError("No se pudo cambiar el estado del stand.");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Stack spacing={0.4} sx={{ mb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
          Mis puestos
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 860 }}>
          Aquí ves únicamente tus stands. Desde cada uno puedes gestionar productos, revisar incidencias y controlar el estado.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack spacing={1.25}>
          <Skeleton height={86} />
          <Skeleton height={86} />
          <Skeleton height={86} />
        </Stack>
      ) : misStands.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3, border: cardBorder }}>
          <Typography sx={{ fontWeight: 900 }}>Sin puestos asociados</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Aún no tienes stands asignados. Si crees que es un error, contacta al administrador.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {misStands.map((s: any) => {
            const productosCount = productosPorStand[s.id] ?? 0;
            const incAbiertas = incidenciasAbiertasPorStand[s.id] ?? 0;

            const estadoUpper = String(s.estado ?? "").toUpperCase();
            const isClausurado = estadoUpper === "CLAUSURADO";

            return (
              <Paper
                key={s.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: cardBorder,
                  display: "flex",
                  alignItems: "center",
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
                        bgcolor: amberSoft,
                        color: amber,
                        display: "grid",
                        placeItems: "center",
                        flex: "0 0 auto",
                      }}
                    >
                      <StoreIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900 }} noWrap>
                        {s.nombreComercial || `Stand ${s.numeroStand ?? s.id}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                        {`Bloque ${s.bloque ?? "—"} · Puesto ${s.numeroStand ?? "—"}`}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.25 }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      size="small"
                      label={estadoUpper || "—"}
                      sx={{
                        bgcolor: amberSoft,
                        color: amber,
                        fontWeight: 900,
                        borderRadius: 999,
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<ShoppingCartIcon />}
                      label={`${productosCount} productos`}
                      sx={{
                        bgcolor: "#fff7ed",
                        color: "#9a3412",
                        fontWeight: 900,
                        borderRadius: 999,
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<ReportProblemIcon />}
                      label={`${incAbiertas} incidencias abiertas`}
                      sx={{
                        bgcolor: "#fef3c7",
                        color: amber,
                        fontWeight: 900,
                        borderRadius: 999,
                      }}
                    />
                  </Stack>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  justifyContent="flex-end"
                >
                  {/* ✅ BOTÓN DE ESTADO: NO mostrar si CLAUSURADO */}
                  {!isClausurado && (
                    <Button
                      variant="outlined"
                      disabled={busyId === s.id}
                      onClick={() => toggleEstado(s)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 900,
                        borderRadius: 999,
                        borderColor: "#f59e0b55",
                        color: amber,
                        "&:hover": { borderColor: "#f59e0b" },
                      }}
                    >
                      {estadoUpper === "ABIERTO" ? "Cerrar puesto" : "Abrir puesto"}
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/socio/productos?standId=${s.id}`)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      borderRadius: 999,
                      borderColor: "#f59e0b55",
                      color: amber,
                      "&:hover": { borderColor: "#f59e0b" },
                    }}
                  >
                    Gestionar productos <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
                  </Button>

                  <Button
                    variant="text"
                    onClick={() => navigate(`/socio/incidencias?standId=${s.id}`)}
                    sx={{ textTransform: "none", fontWeight: 900, color: amber }}
                  >
                    Ver incidencias
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}