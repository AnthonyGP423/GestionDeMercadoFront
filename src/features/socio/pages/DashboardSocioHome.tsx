import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  Chip,
  Button,
  Skeleton,
  Alert,
  Fade,
  Grow,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";

import { standsSocioApi } from "../../../api/socio/standsSocioApi";
import { cuotasSocioApi } from "../../../api/socio/cuotasSocioApi";
import { incidenciasSocioApi } from "../../../api/socio/incidenciasSocioApi";
import { credencialQrSocioApi } from "../../../api/socio/credencialQrSocioApi";

const amber = "#b45309";
const amberPrimary = "#f59e0b";
const amberSoft = "#fffbeb";
const cardBorder = "1px solid #f5f5f4";

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

export default function DashboardSocioHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [misStands, setMisStands] = useState<any[]>([]);
  const [misCuotas, setMisCuotas] = useState<any[]>([]);
  const [misIncidencias, setMisIncidencias] = useState<any[]>([]);
  const [credencial, setCredencial] = useState<any | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const [standsRes, cuotasRes, incRes, credRes] = await Promise.all([
          standsSocioApi.misStands(),
          cuotasSocioApi.misCuotas(),
          incidenciasSocioApi.listar({ page: 0, size: 20 }),
          credencialQrSocioApi.obtener(),
        ]);

        setMisStands(toArray(standsRes.data));
        setMisCuotas(toArray(cuotasRes.data));
        setMisIncidencias(toArray(incRes.data));
        setCredencial(credRes.data ?? null);
      } catch (e: any) {
        console.error(e);
        setError(
          "No se pudo cargar el panel del socio. Verifica tu sesión o el servidor."
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const cuotasPendientes = useMemo(() => {
    return misCuotas.filter((c) => {
      const estado = String(c.estado ?? "").toUpperCase();
      return estado.includes("PEND") || estado.includes("VENC");
    }).length;
  }, [misCuotas]);

  const incidenciasAbiertas = useMemo(() => {
    return misIncidencias.filter((i) => {
      const estado = String(i.estado ?? "").toUpperCase();
      return !estado.includes("CERR") && !estado.includes("RESUEL");
    }).length;
  }, [misIncidencias]);

  const topStands = useMemo(() => misStands.slice(0, 4), [misStands]);
  const topCuotas = useMemo(() => misCuotas.slice(0, 5), [misCuotas]);
  const topInc = useMemo(() => misIncidencias.slice(0, 5), [misIncidencias]);

  const kpis = [
    {
      label: "Mis puestos",
      value: misStands.length,
      icon: <StoreIcon sx={{ fontSize: 24 }} />,
      hint: "Ver detalle",
      onClick: () => navigate("/socio/mis-stands"),
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      label: "Cuotas pendientes",
      value: cuotasPendientes,
      icon: <PaymentsIcon sx={{ fontSize: 24 }} />,
      hint: "Ir a cuotas",
      onClick: () => navigate("/socio/mis-cuotas"),
      gradient: "linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)",
    },
    {
      label: "Incidencias abiertas",
      value: incidenciasAbiertas,
      icon: <ReportProblemIcon sx={{ fontSize: 24 }} />,
      hint: "Registrar",
      onClick: () => navigate("/socio/incidencias"),
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    },
    {
      label: "Credencial QR",
      value: credencial?.codigoQr || credencial?.codigo ? "Activa" : "—",
      icon: <QrCode2Icon sx={{ fontSize: 24 }} />,
      hint: "Ver QR",
      onClick: () => navigate("/socio/credencial-qr"),
      gradient: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
    },
  ];

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header Mejorado */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "2px solid #f5f5f4",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -2,
            left: 0,
            width: "120px",
            height: "2px",
            background: "linear-gradient(90deg, #f59e0b 0%, transparent 100%)",
          },
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Panel de Socio
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#78716c",
              maxWidth: 760,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Revisa tus puestos, estado de cuotas, gestiona productos, registra
            incidencias y accede a tu credencial QR.
          </Typography>
        </Stack>
      </Box>

      {error && (
        <Fade in>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* KPIs Mejorados */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2.5,
          mb: 4,
        }}
      >
        {kpis.map((kpi, index) => (
          <Grow
            in
            key={kpi.label}
            timeout={300 + index * 100}
            style={{ transformOrigin: "top left" }}
          >
            <Paper
              onClick={kpi.onClick}
              elevation={0}
              sx={{
                flex: "1 1 260px",
                minWidth: 260,
                p: 3,
                borderRadius: 4,
                border: cardBorder,
                bgcolor: "#fff",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "150px",
                  height: "150px",
                  background: kpi.gradient,
                  opacity: 0.05,
                  borderRadius: "50%",
                  transform: "translate(40%, -40%)",
                  transition: "all 0.3s ease",
                },
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(180, 83, 9, 0.12)",
                  borderColor: "#fed7aa",
                  "&::before": {
                    opacity: 0.08,
                    transform: "translate(30%, -30%) scale(1.2)",
                  },
                },
              }}
            >
              {loading ? (
                <>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="text" width="30%" />
                </>
              ) : (
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#78716c",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: 11,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {kpi.label}
                    </Typography>

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        background: kpi.gradient,
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 8px 16px rgba(180, 83, 9, 0.2)",
                      }}
                    >
                      {kpi.icon}
                    </Box>
                  </Stack>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      mb: 1.5,
                      color: "#1c1917",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {kpi.value}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                      color: amber,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {kpi.hint}
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </>
              )}
            </Paper>
          </Grow>
        ))}
      </Box>

      {/* Contenido Principal - Layout Reorganizado */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* Columna Izquierda - Stands y Credencial QR */}
        <Box sx={{ flex: "1 1 560px", minWidth: 320 }}>
          <Stack spacing={3}>
            {/* Mis Puestos */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: cardBorder,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                    Mis puestos
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#78716c" }}>
                    Gestiona tus stands activos
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/socio/mis-stands")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: amber,
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      bgcolor: amberSoft,
                    },
                  }}
                >
                  Ver todos
                </Button>
              </Stack>

              <Divider sx={{ mb: 2.5, borderColor: "#f5f5f4" }} />

              {loading ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={72} sx={{ borderRadius: 3 }} />
                  ))}
                </Stack>
              ) : topStands.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#78716c",
                  }}
                >
                  <StoreIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No tienes puestos asociados aún.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {topStands.map((s: any) => (
                    <Paper
                      key={s.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid #f5f5f4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#fed7aa",
                          boxShadow: "0 4px 12px rgba(180, 83, 9, 0.08)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, mb: 0.5 }} noWrap>
                          {s.nombreComercial ||
                            `Stand ${s.numeroStand ?? s.id}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#78716c", display: "block" }}
                          noWrap
                        >
                          Bloque {s.bloque ?? "—"} · Puesto{" "}
                          {s.numeroStand ?? "—"}
                          {s.rubro || s.nombreCategoriaStand
                            ? ` · ${s.rubro ?? s.nombreCategoriaStand}`
                            : ""}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={String(s.estado ?? "—").toUpperCase()}
                          sx={{
                            bgcolor: amberSoft,
                            color: amber,
                            fontWeight: 700,
                            borderRadius: 2,
                            fontSize: 11,
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            navigate(`/socio/productos?standId=${s.id}`)
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 2,
                            borderColor: "#fed7aa",
                            color: amber,
                            minWidth: 100,
                            "&:hover": {
                              borderColor: amberPrimary,
                              bgcolor: amberSoft,
                            },
                          }}
                        >
                          Productos
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Credencial QR - Ahora en columna izquierda */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: cardBorder,
                background: `linear-gradient(135deg, ${amberSoft} 0%, #ffffff 50%)`,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(180, 83, 9, 0.08)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  background:
                    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  borderRadius: "50%",
                  opacity: 0.08,
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Mi credencial QR
                </Typography>
                <Chip
                  size="small"
                  icon={
                    credencial ? (
                      <TrendingUpIcon sx={{ fontSize: 14 }} />
                    ) : undefined
                  }
                  label={credencial ? "ACTIVA" : "NO DISPONIBLE"}
                  sx={{
                    bgcolor: credencial ? "#fef3c7" : "#f5f5f4",
                    color: credencial ? amber : "#78716c",
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: 11,
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                sx={{ color: "#78716c", mb: 2.5, lineHeight: 1.6 }}
              >
                Accede rápidamente a tu credencial para validación y control en
                el mercado.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                endIcon={<QrCode2Icon />}
                onClick={() => navigate("/socio/credencial-qr")}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 800,
                  py: 1.5,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    boxShadow: "0 12px 28px rgba(217, 119, 6, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Ver mi credencial
              </Button>
            </Paper>
          </Stack>
        </Box>

        {/* Columna Derecha - Cuotas e Incidencias */}
        <Box sx={{ flex: "1 1 400px", minWidth: 320 }}>
          <Stack spacing={3}>
            {/* Cuotas */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: cardBorder,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                    Cuotas recientes
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#78716c" }}>
                    {cuotasPendientes} pendiente
                    {cuotasPendientes !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate("/socio/mis-cuotas")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: amber,
                    minWidth: "auto",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      bgcolor: amberSoft,
                    },
                  }}
                >
                  Ver
                </Button>
              </Stack>

              <Divider sx={{ mb: 2.5, borderColor: "#f5f5f4" }} />

              {loading ? (
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={50} sx={{ borderRadius: 2 }} />
                  ))}
                </Stack>
              ) : topCuotas.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3, color: "#78716c" }}>
                  <PaymentsIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No se encontraron cuotas.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {topCuotas.map((c: any, idx: number) => (
                    <Box
                      key={c.idCuota ?? c.id ?? idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#fafaf9",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, mb: 0.3 }} noWrap>
                          {c.periodo ?? "Cuota"}
                          {c.numeroStand && (
                            <Typography
                              component="span"
                              sx={{
                                color: "#78716c",
                                fontWeight: 600,
                                ml: 0.5,
                              }}
                            >
                              · Stand {c.numeroStand}
                            </Typography>
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#78716c" }}
                          noWrap
                        >
                          Vence: {c.fechaVencimiento ?? "—"}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={String(c.estado ?? "—").toUpperCase()}
                        sx={{
                          bgcolor: String(c.estado ?? "")
                            .toUpperCase()
                            .includes("PAG")
                            ? "#f0fdf4"
                            : amberSoft,
                          color: String(c.estado ?? "")
                            .toUpperCase()
                            .includes("PAG")
                            ? "#15803d"
                            : amber,
                          fontWeight: 700,
                          borderRadius: 2,
                          fontSize: 11,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Incidencias */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: cardBorder,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                    Incidencias
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#78716c" }}>
                    {incidenciasAbiertas} abierta
                    {incidenciasAbiertas !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate("/socio/incidencias")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: amber,
                    minWidth: "auto",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      bgcolor: amberSoft,
                    },
                  }}
                >
                  Gestionar
                </Button>
              </Stack>

              <Divider sx={{ mb: 2.5, borderColor: "#f5f5f4" }} />

              {loading ? (
                <Stack spacing={1.5}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={46} sx={{ borderRadius: 2 }} />
                  ))}
                </Stack>
              ) : topInc.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3, color: "#78716c" }}>
                  <ReportProblemIcon
                    sx={{ fontSize: 40, opacity: 0.3, mb: 1 }}
                  />
                  <Typography variant="body2">
                    Aún no registras incidencias.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {topInc.map((i: any, idx: number) => (
                    <Box
                      key={i.idIncidencia ?? i.id ?? idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#fafaf9",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, mb: 0.3 }} noWrap>
                          {i.titulo ?? "Incidencia"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#78716c" }}
                          noWrap
                        >
                          {i.fechaReporte ?? i.fechaRegistro ?? "—"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={String(i.estado ?? "—").toUpperCase()}
                        sx={{
                          bgcolor: amberSoft,
                          color: amber,
                          fontWeight: 700,
                          borderRadius: 2,
                          fontSize: 11,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}