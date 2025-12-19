// src/pages/store/PerfilUsuario.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Avatar,
  Typography,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Rating,
  Tooltip,
  IconButton,
  Fade,
  Grow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import RefreshIcon from "@mui/icons-material/Refresh";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";
import { AppTabs, TabPanel } from "../../../components/shared/AppTabs";
import { useAuth } from "../../../auth/useAuth";

import { clienteApi, ClienteMeResponseDto } from "../../../api/cliente/clienteApi";
import { favoritosApi, FavoritoResponseDto } from "../../../api/cliente/favoritosApi";
import {
  calificacionesClienteApi,
  CalificacionResponseDto,
} from "../../../api/cliente/calificacionesClienteApi";

type TabKey = "perfil" | "favoritos" | "comentarios";

const PERFIL_TABS = [
  { value: "perfil", label: "Mi Perfil" },
  { value: "favoritos", label: "Favoritos" },
  { value: "comentarios", label: "Comentarios" },
];

// helpers UX
function safeInitial(name?: string) {
  const s = String(name ?? "").trim();
  return (s ? s[0] : "C").toUpperCase();
}

function formatFecha(fechaIso?: string | null) {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return String(fechaIso);
  return d.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PerfilUsuario() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth() as any;

  const rol = String(user?.rol ?? "").toUpperCase();
  const isCliente = Boolean(isAuthenticated && rol === "CLIENTE");

  const [tab, setTab] = useState<TabKey>("perfil");

  // ===== Perfil real: /api/v1/cliente/me =====
  const [me, setMe] = useState<ClienteMeResponseDto | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [errorMe, setErrorMe] = useState<string | null>(null);

  // ===== Favoritos real: /api/v1/cliente/favoritos =====
  const [favoritos, setFavoritos] = useState<FavoritoResponseDto[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [errorFav, setErrorFav] = useState<string | null>(null);

  // ===== Comentarios real: /api/v1/cliente/calificaciones =====
  const [misCal, setMisCal] = useState<CalificacionResponseDto[]>([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [errorCal, setErrorCal] = useState<string | null>(null);

  const [pageCal] = useState(0);
  const [sizeCal] = useState(10);

  // ✅ proteger ruta
  useEffect(() => {
    if (!isCliente) {
      navigate("/cliente/login", {
        replace: true,
        state: { from: "/tienda/perfil-usuario" },
      });
    }
  }, [isCliente, navigate]);

  const nombreCompleto = useMemo(() => {
    if (me) {
      const full = `${me.nombres ?? ""} ${me.apellidos ?? ""}`.trim();
      return full || me.email;
    }
    const correoLocal = user?.email ?? "";
    return user?.nombreCompleto ?? (correoLocal ? correoLocal.split("@")[0] : "Cliente");
  }, [me, user]);

  const correo = useMemo(() => me?.email ?? user?.email ?? "", [me, user]);

  const stats = useMemo(() => {
    const totalFav = favoritos.length;
    const totalRes = misCal.length;
    const promedio =
      totalRes > 0
        ? misCal.reduce((acc, x) => acc + Number(x.puntuacion ?? 0), 0) / totalRes
        : 0;
    return { totalFav, totalRes, promedio };
  }, [favoritos, misCal]);

  const fetchMe = async () => {
    try {
      setLoadingMe(true);
      setErrorMe(null);
      const resp = await clienteApi.me();
      setMe(resp.data);
    } catch (e: any) {
      console.error(e);
      setErrorMe(
        e?.response?.data?.mensaje ||
          e?.response?.data?.error ||
          "No se pudo cargar tu perfil."
      );
    } finally {
      setLoadingMe(false);
    }
  };

  const fetchFavoritos = async () => {
    try {
      setLoadingFav(true);
      setErrorFav(null);
      const resp = await favoritosApi.listar();
      setFavoritos(resp.data ?? []);
    } catch (e: any) {
      console.error(e);
      setErrorFav(
        e?.response?.data?.mensaje ||
          e?.response?.data?.error ||
          "No se pudieron cargar tus favoritos."
      );
    } finally {
      setLoadingFav(false);
    }
  };

  const fetchCalificaciones = async () => {
    try {
      setLoadingCal(true);
      setErrorCal(null);
      const resp = await calificacionesClienteApi.listar(pageCal, sizeCal);
      const content = resp.data?.content ?? [];
      setMisCal(content);
    } catch (e: any) {
      console.error(e);
      setErrorCal(
        e?.response?.data?.mensaje ||
          e?.response?.data?.error ||
          "No se pudieron cargar tus comentarios."
      );
    } finally {
      setLoadingCal(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchMe(), fetchFavoritos(), fetchCalificaciones()]);
  };

  useEffect(() => {
    if (!isCliente) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCliente]);

  const goStand = (idStand: number) => navigate(`/tienda/stand/${idStand}`);

  const quitarFavorito = async (idStand: number) => {
    try {
      await favoritosApi.quitar(idStand);
      setFavoritos((prev) => prev.filter((x: any) => Number(x.idStand) !== Number(idStand)));
    } catch (e) {
      console.error(e);
      fetchFavoritos();
    }
  };

  const doLogout = () => {
    logout?.();
    navigate("/tienda", { replace: true });
  };

  if (!isCliente) return null;

  // ====== UI helpers (Box “Gridless”) ======
  const kpiItems = [
    {
      key: "fav",
      label: "Favoritos",
      value: stats.totalFav,
      icon: <FavoriteIcon />,
      accent: { bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", fg: "#16a34a" },
      hoverBorder: "#dcfce7",
      hoverShadow: "0 4px 12px rgba(34,197,94,0.08)",
    },
    {
      key: "com",
      label: "Comentarios",
      value: stats.totalRes,
      icon: <ChatBubbleOutlineIcon />,
      accent: { bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", fg: "#2563eb" },
      hoverBorder: "#dbeafe",
      hoverShadow: "0 4px 12px rgba(37,99,235,0.08)",
    },
    {
      key: "pro",
      label: "Promedio",
      value: stats.totalRes ? stats.promedio.toFixed(1) : "—",
      icon: <StarRoundedIcon />,
      accent: { bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", fg: "#f59e0b" },
      hoverBorder: "#fef3c7",
      hoverShadow: "0 4px 12px rgba(245,158,11,0.08)",
    },
  ];

  const infoCards = [
    {
      key: "nombre",
      label: "Nombre completo",
      value: me ? `${me.nombres ?? ""} ${me.apellidos ?? ""}`.trim() || "—" : "—",
      icon: <PersonOutlineIcon />,
      iconBg: "#dcfce7",
      iconFg: "#16a34a",
    },
    {
      key: "email",
      label: "Email",
      value: me?.email ?? "—",
      icon: <EmailOutlinedIcon />,
      iconBg: "#dbeafe",
      iconFg: "#2563eb",
    },
    {
      key: "tel",
      label: "Teléfono",
      value: me?.telefono ?? "No registrado",
      icon: <PhoneOutlinedIcon />,
      iconBg: "#fef3c7",
      iconFg: "#f59e0b",
    },
    {
      key: "rol",
      label: "Rol",
      value: me?.rol ?? "CLIENTE",
      icon: <BadgeOutlinedIcon />,
      iconBg: "#f3e8ff",
      iconFg: "#9333ea",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 50%, #ffffff 100%)",
      }}
    >
      <PublicHeader />

      {/* Hero Mejorado (VISUAL) */}
      <Box
        sx={{
          pt: 5,
          pb: 4,
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="lg">
          <Grow in timeout={500}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 5,
                border: "1px solid rgba(34,197,94,0.15)",
                background:
                  "linear-gradient(135deg, rgba(236,253,245,0.8) 0%, rgba(255,255,255,0.9) 100%)",
                boxShadow:
                  "0 20px 50px rgba(34,197,94,0.12), 0 0 0 1px rgba(34,197,94,0.05)",
                backdropFilter: "blur(10px)",
                p: 4,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 25px 60px rgba(34,197,94,0.18)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={3} alignItems="center" flex={1}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        fontWeight: 900,
                        fontSize: 32,
                        boxShadow: "0 8px 20px rgba(34,197,94,0.3)",
                      }}
                    >
                      {safeInitial(nombreCompleto)}
                    </Avatar>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        border: "3px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>

                  <Box flex={1}>
                    <Typography
                      variant="overline"
                      sx={{
                        letterSpacing: "0.15em",
                        color: "#16a34a",
                        fontWeight: 800,
                        fontSize: 11,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Cliente
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        mb: 1.5,
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      {nombreCompleto}
                    </Typography>

                    <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                      <Chip
                        size="small"
                        icon={<EmailOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={correo || "—"}
                        sx={{
                          borderRadius: "8px",
                          bgcolor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      />
                      <Chip
                        size="small"
                        icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={me?.telefono || "Sin teléfono"}
                        sx={{
                          borderRadius: "8px",
                          bgcolor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Tooltip title="Actualizar datos" arrow>
                    <span>
                      <IconButton
                        onClick={refreshAll}
                        disabled={loadingMe || loadingFav || loadingCal}
                        sx={{
                          borderRadius: "12px",
                          bgcolor: "#fff",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          "&:hover": {
                            bgcolor: "#f9fafb",
                            borderColor: "#22c55e",
                            transform: "rotate(180deg)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Button
                    onClick={doLogout}
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 800,
                      px: 3,
                      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                      boxShadow: "0 4px 12px rgba(15,23,42,0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
                        boxShadow: "0 6px 16px rgba(15,23,42,0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Salir
                  </Button>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3, borderColor: "#f3f4f6" }} />

              {/* KPIs Mejorados (sin Grid) */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {kpiItems.map((kpi) => (
                  <Box
                    key={kpi.key}
                    sx={{
                      width: { xs: "100%", sm: "calc(33.333% - 16px)" },
                      minWidth: { sm: 220 },
                      flexGrow: 1,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid #f3f4f6",
                        bgcolor: "#ffffff",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: kpi.hoverBorder,
                          boxShadow: kpi.hoverShadow,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            background: kpi.accent.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: kpi.accent.fg,
                          }}
                        >
                          {kpi.icon}
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              fontSize: 11,
                              letterSpacing: "0.1em",
                            }}
                          >
                            {kpi.label}
                          </Typography>
                          <Typography fontWeight={900} fontSize={24}>
                            {kpi.value as any}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grow>
        </Container>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ pb: 6, flex: 1, mt: -2 }}>
        {(errorMe || errorFav || errorCal) && (
          <Fade in>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
              {errorMe || errorFav || errorCal}
            </Alert>
          </Fade>
        )}

        {(loadingMe || loadingFav || loadingCal) && !me && (
          <Fade in>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress size={48} sx={{ color: "#22c55e" }} />
              <Typography sx={{ mt: 2, fontWeight: 600 }} color="text.secondary">
                Preparando tu perfil...
              </Typography>
            </Box>
          </Fade>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            border: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 4, pt: 3 }}>
            <AppTabs
              value={tab}
              onChange={(v) => setTab(v as TabKey)}
              items={PERFIL_TABS}
              aria-label="secciones del perfil de usuario"
            />
          </Box>

          <Divider sx={{ borderColor: "#f3f4f6" }} />

          <Box sx={{ p: 4 }}>
            {/* PERFIL TAB */}
            <TabPanel current={tab} value="perfil">
              <Typography variant="h6" fontWeight={900} mb={3}>
                Información básica
              </Typography>

              {loadingMe ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress size={32} sx={{ color: "#22c55e" }} />
                </Box>
              ) : me ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {infoCards.map((card) => (
                    <Box
                      key={card.key}
                      sx={{
                        width: { xs: "100%", md: "calc(50% - 12px)" },
                        minWidth: { md: 320 },
                        flexGrow: 1,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: "1px solid #f3f4f6",
                          bgcolor: "#fafafa",
                          transition: "all 0.2s ease",
                          "&:hover": { borderColor: "#e5e7eb", bgcolor: "#ffffff" },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: card.iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: card.iconFg,
                            }}
                          >
                            {card.icon}
                          </Box>

                          <Box flex={1}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                fontSize: 11,
                                letterSpacing: "0.1em",
                              }}
                            >
                              {card.label}
                            </Typography>
                            <Typography fontWeight={800} sx={{ mt: 0.5 }}>
                              {card.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px solid #f3f4f6",
                    bgcolor: "#fafafa",
                  }}
                >
                  <Typography fontWeight={700} color="text.secondary">
                    No se pudo cargar tu información.
                  </Typography>
                </Paper>
              )}
            </TabPanel>

            {/* FAVORITOS TAB */}
            <TabPanel current={tab} value="favoritos">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h6" fontWeight={900}>
                  Stands favoritos
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={fetchFavoritos}
                  disabled={loadingFav}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 800,
                    borderColor: "#e5e7eb",
                    color: "#16a34a",
                    "&:hover": { borderColor: "#22c55e", bgcolor: "#dcfce7" },
                  }}
                >
                  Actualizar
                </Button>
              </Stack>

              {loadingFav ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CircularProgress size={32} sx={{ color: "#22c55e" }} />
                  <Typography sx={{ mt: 2, fontWeight: 600 }} color="text.secondary">
                    Cargando favoritos...
                  </Typography>
                </Box>
              ) : favoritos.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: 4,
                    border: "2px dashed #cbd5e1",
                    bgcolor: "#f8fafc",
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
                  <Typography fontWeight={900} fontSize={20} mb={1}>
                    Aún no tienes favoritos
                  </Typography>
                  <Typography color="text.secondary" mb={3}>
                    Ve a un stand y presiona el corazón para guardarlo como favorito
                  </Typography>
                  <Button
                    onClick={() => navigate("/tienda/mapa-stand")}
                    variant="contained"
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 900,
                      px: 4,
                      py: 1.2,
                      bgcolor: "#16a34a",
                      boxShadow: "0 10px 24px rgba(22,163,74,0.25)",
                      "&:hover": {
                        bgcolor: "#15803d",
                        transform: "translateY(-1px)",
                        boxShadow: "0 14px 30px rgba(22,163,74,0.32)",
                      },
                      transition: "all 0.25s ease",
                    }}
                  >
                    Explorar stands
                  </Button>
                </Paper>
              ) : (
                <List sx={{ p: 0 }}>
                  {favoritos.map((f: any, idx) => {
                    const idStand = Number(f.idStand ?? f.standId ?? 0);
                    const nombreStand =
                      f.nombreStand ?? f.standNombre ?? `Stand #${idStand}`;
                    const categoria = f.categoriaStand ?? f.categoria ?? "Sin categoría";
                    const bloque = f.bloque ?? f.bloqueStand ?? "-";
                    const numero = f.numeroStand ?? f.numero ?? "-";

                    return (
                      <Paper
                        key={f.idFavorito ?? `${idStand}-${idx}`}
                        elevation={0}
                        sx={{
                          mb: 1.5,
                          borderRadius: 3,
                          border: "1px solid #e5e7eb",
                          bgcolor: "#ffffff",
                          overflow: "hidden",
                          boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                          transition: "all 0.25s ease",
                          "&:hover": {
                            boxShadow: "0 14px 30px rgba(15,23,42,0.09)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <ListItem
                          sx={{ px: 2.5, py: 2 }}
                          disableGutters
                          secondaryAction={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => goStand(idStand)}
                                sx={{
                                  borderRadius: 999,
                                  textTransform: "none",
                                  fontWeight: 900,
                                  borderColor: "#e5e7eb",
                                  "&:hover": {
                                    borderColor: "#16a34a",
                                    bgcolor: "#dcfce7",
                                  },
                                }}
                              >
                                Ver stand
                              </Button>

                              <Tooltip title="Quitar de favoritos" arrow>
                                <IconButton
                                  onClick={() => quitarFavorito(idStand)}
                                  sx={{
                                    borderRadius: 2,
                                    border: "1px solid #e5e7eb",
                                    bgcolor: "#ffffff",
                                    "&:hover": {
                                      bgcolor: "#fef2f2",
                                      borderColor: "#fecaca",
                                      color: "#dc2626",
                                    },
                                  }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography fontWeight={900}>{nombreStand}</Typography>
                                <Chip
                                  size="small"
                                  label={categoria}
                                  sx={{
                                    borderRadius: 999,
                                    bgcolor: "#dcfce7",
                                    color: "#166534",
                                    fontWeight: 800,
                                    border: "1px solid #bbf7d0",
                                  }}
                                />
                              </Stack>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                sx={{ mt: 0.6, color: "#64748b", fontWeight: 600 }}
                              >
                                📍 Bloque {bloque} · Puesto {numero}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </Paper>
                    );
                  })}
                </List>
              )}
            </TabPanel>

            {/* COMENTARIOS TAB */}
            <TabPanel current={tab} value="comentarios">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h6" fontWeight={900}>
                  Mis comentarios
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={fetchCalificaciones}
                  disabled={loadingCal}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 800,
                    borderColor: "#e5e7eb",
                    color: "#2563eb",
                    "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                  }}
                >
                  Actualizar
                </Button>
              </Stack>

              {loadingCal ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CircularProgress size={32} sx={{ color: "#2563eb" }} />
                  <Typography sx={{ mt: 2, fontWeight: 600 }} color="text.secondary">
                    Cargando comentarios...
                  </Typography>
                </Box>
              ) : misCal.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    borderRadius: 4,
                    border: "2px dashed #cbd5e1",
                    bgcolor: "#f8fafc",
                    textAlign: "center",
                  }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 1.5 }} />
                  <Typography fontWeight={900} fontSize={18} mb={0.5}>
                    Aún no tienes comentarios
                  </Typography>
                  <Typography color="text.secondary">
                    Visita un stand y deja tu calificación para ayudar a otros clientes.
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ p: 0 }}>
                  {misCal.map((c: any, idx) => {
                    const idStand = Number(c.idStand ?? c.standId ?? 0);
                    const nombreStand =
                      c.nombreStand ?? c.standNombre ?? `Stand #${idStand}`;
                    const puntuacion = Number(c.puntuacion ?? c.rating ?? 0);

                    return (
                      <Paper
                        key={c.idCalificacion ?? `${idStand}-${idx}`}
                        elevation={0}
                        sx={{
                          mb: 1.5,
                          borderRadius: 3,
                          border: "1px solid #e5e7eb",
                          bgcolor: "#ffffff",
                          boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                          overflow: "hidden",
                        }}
                      >
                        <ListItem
                          sx={{ px: 2.5, py: 2 }}
                          disableGutters
                          secondaryAction={
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => goStand(idStand)}
                              sx={{
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 900,
                                borderColor: "#e5e7eb",
                                "&:hover": {
                                  borderColor: "#2563eb",
                                  bgcolor: "#eff6ff",
                                },
                              }}
                            >
                              Ver stand
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={1}
                              >
                                <Typography fontWeight={900}>{nombreStand}</Typography>
                                <Chip
                                  size="small"
                                  label={formatFecha(c.fecha)}
                                  sx={{
                                    borderRadius: 999,
                                    bgcolor: "#f8fafc",
                                    border: "1px solid #e5e7eb",
                                    fontWeight: 800,
                                  }}
                                />
                              </Stack>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Rating value={puntuacion} readOnly precision={0.5} size="small" />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mt: 1,
                                    color: "#334155",
                                    fontWeight: 600,
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {c.comentario?.trim()
                                    ? c.comentario
                                    : "Sin comentario (solo puntuación)."}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Paper>
                    );
                  })}
                </List>
              )}
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      <PublicFooter />
    </Box>
  );
}