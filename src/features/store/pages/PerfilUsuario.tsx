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
  Rating,
  Tooltip,
  IconButton,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";
import { AppTabs, TabPanel } from "../../../components/shared/AppTabs";
import { useAuth } from "../../../auth/useAuth";

import {
  clienteApi,
  ClienteMeResponseDto,
} from "../../../api/cliente/clienteApi";
import {
  favoritosApi,
  FavoritoResponseDto,
} from "../../../api/cliente/favoritosApi";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAuthenticated, user, logout } = useAuth() as any;

  const rol = String(user?.rol ?? "").toUpperCase();
  const isCliente = Boolean(isAuthenticated && rol === "CLIENTE");

  const [tab, setTab] = useState<TabKey>("perfil");

  // ===== Perfil real =====
  const [me, setMe] = useState<ClienteMeResponseDto | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [errorMe, setErrorMe] = useState<string | null>(null);

  // ===== Favoritos =====
  const [favoritos, setFavoritos] = useState<FavoritoResponseDto[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [errorFav, setErrorFav] = useState<string | null>(null);

  // ===== Comentarios =====
  const [misCal, setMisCal] = useState<CalificacionResponseDto[]>([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [errorCal, setErrorCal] = useState<string | null>(null);

  const [pageCal] = useState(0);
  const [sizeCal] = useState(10);

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
    return (
      user?.nombreCompleto ??
      (correoLocal ? correoLocal.split("@")[0] : "Cliente")
    );
  }, [me, user]);

  const correo = useMemo(() => me?.email ?? user?.email ?? "", [me, user]);

  const stats = useMemo(() => {
    const totalFav = favoritos.length;
    const totalRes = misCal.length;
    const promedio =
      totalRes > 0
        ? misCal.reduce((acc, x) => acc + Number(x.puntuacion ?? 0), 0) /
          totalRes
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
      setFavoritos((prev) =>
        prev.filter((x: any) => Number(x.idStand) !== Number(idStand))
      );
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

  const kpiItems = [
    {
      key: "fav",
      label: "Favoritos",
      value: stats.totalFav,
      icon: <FavoriteIcon />,
      accent: {
        bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
        fg: "#16a34a",
      },
      hoverBorder: "#dcfce7",
      hoverShadow: "0 4px 12px rgba(34,197,94,0.08)",
    },
    {
      key: "com",
      label: "Comentarios",
      value: stats.totalRes,
      icon: <ChatBubbleOutlineIcon />,
      accent: {
        bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        fg: "#2563eb",
      },
      hoverBorder: "#dbeafe",
      hoverShadow: "0 4px 12px rgba(37,99,235,0.08)",
    },
    {
      key: "pro",
      label: "Promedio",
      value: stats.totalRes ? stats.promedio.toFixed(1) : "—",
      icon: <StarRoundedIcon />,
      accent: {
        bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        fg: "#f59e0b",
      },
      hoverBorder: "#fef3c7",
      hoverShadow: "0 4px 12px rgba(245,158,11,0.08)",
    },
  ];

  const infoCards = [
    {
      key: "nombre",
      label: "Nombre completo",
      value: me
        ? `${me.nombres ?? ""} ${me.apellidos ?? ""}`.trim() || "—"
        : "—",
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

      {/* HERO SECTION */}
      <Box
        sx={{
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 8 },
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="lg">
          <Grow in timeout={500}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: 4, md: 5 },
                border: "1px solid rgba(34,197,94,0.15)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, #ffffff 100%)",
                boxShadow: "0 20px 50px rgba(34,197,94,0.12)",
                p: { xs: 3, md: 4 },
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 3, md: 4 }}
                alignItems={{ xs: "center", md: "center" }}
                textAlign={{ xs: "center", md: "left" }}
              >
                {/* AVATAR */}
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    sx={{
                      width: { xs: 80, sm: 96 },
                      height: { xs: 80, sm: 96 },
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      fontWeight: 900,
                      fontSize: { xs: 32, sm: 40 },
                      boxShadow: "0 10px 25px rgba(34,197,94,0.3)",
                    }}
                  >
                    {safeInitial(nombreCompleto)}
                  </Avatar>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "#22c55e",
                      border: "3px solid white",
                    }}
                  />
                </Box>

                {/* INFO */}
                <Box sx={{ flex: 1, width: "100%" }}>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: "0.2em",
                      color: "#16a34a",
                      fontWeight: 800,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    PANEL DE CLIENTE
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      fontSize: { xs: "1.75rem", md: "2.25rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {nombreCompleto}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent={{ xs: "center", md: "flex-start" }}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 3 }}
                  >
                    <Chip
                      icon={<EmailOutlinedIcon sx={{ fontSize: 16 }} />}
                      label={correo}
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}
                    />
                    {me?.telefono && (
                      <Chip
                        icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={me.telefono}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}
                      />
                    )}
                  </Stack>

                  {/* BOTONES DE ACCIÓN - ADAPTADOS PARA CELULAR */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    <Button
                      fullWidth={isMobile}
                      onClick={doLogout}
                      variant="contained"
                      startIcon={<LogoutIcon />}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 800,
                        px: 3,
                        py: 1,
                        bgcolor: "#0f172a",
                        boxShadow: "0 4px 14px rgba(15,23,42,0.3)",
                        "&:hover": { bgcolor: "#000" },
                      }}
                    >
                      Cerrar Sesión
                    </Button>
                    <Button
                      fullWidth={isMobile}
                      onClick={refreshAll}
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      disabled={loadingMe}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#16a34a",
                        borderColor: "#16a34a",
                        borderWidth: 2,
                        "&:hover": { borderWidth: 2, bgcolor: "#f0fdf4" },
                      }}
                    >
                      {loadingMe ? "Cargando..." : "Actualizar Datos"}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grow>
        </Container>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: -2, md: -4 },
          pb: 8,
          flex: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 4, md: 5 },
            border: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
            boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {/* TABS CONTAINER */}
          <Box
            sx={{
              px: { xs: 0, sm: 4 },
              pt: 2,
              bgcolor: "#fff",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {/* Forzamos overflow-x para que en pantallas pequeñas se pueda hacer scroll horizontal */}
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 2,
                  bgcolor: "#cbd5e1",
                },
              }}
            >
              <AppTabs
                value={tab}
                onChange={(v) => setTab(v as TabKey)}
                items={PERFIL_TABS}
              />
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            {(errorMe || errorFav || errorCal) && (
              <Fade in>
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                  {errorMe || errorFav || errorCal}
                </Alert>
              </Fade>
            )}

            {/* TAB PERFIL */}
            <TabPanel current={tab} value="perfil">
              <Typography variant="h6" fontWeight={900} mb={3}>
                Estadísticas y Datos
              </Typography>

              {/* KPIs */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 4 }}
              >
                {kpiItems.map((kpi) => (
                  <Paper
                    key={kpi.key}
                    elevation={0}
                    sx={{
                      flex: 1,
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
                            letterSpacing: "0.1em",
                          }}
                        >
                          {kpi.label}
                        </Typography>
                        <Typography
                          fontWeight={900}
                          fontSize={24}
                          lineHeight={1}
                        >
                          {kpi.value as any}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {/* INFO CARDS */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 3,
                }}
              >
                {infoCards.map((card) => (
                  <Paper
                    key={card.key}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid #f1f5f9",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          bgcolor: card.iconBg,
                          color: card.iconFg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {card.label}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={800}
                          noWrap
                          title={String(card.value)}
                        >
                          {card.value}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </TabPanel>

            {/* TAB FAVORITOS */}
            <TabPanel current={tab} value="favoritos">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h6" fontWeight={900}>
                  Mis Stands Guardados
                </Typography>
                <IconButton
                  onClick={fetchFavoritos}
                  disabled={loadingFav}
                  size="small"
                  sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Stack>

              {loadingFav ? (
                <Box py={5} textAlign="center">
                  <CircularProgress />
                </Box>
              ) : favoritos.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                    borderRadius: 4,
                    border: "2px dashed #e2e8f0",
                  }}
                >
                  <FavoriteIcon
                    sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }}
                  />
                  <Typography fontWeight={700} color="text.secondary">
                    No tienes favoritos guardados.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {favoritos.map((f: any, idx) => {
                    const idStand = Number(f.idStand ?? f.standId ?? 0);
                    const nombreStand =
                      f.nombreStand ?? f.standNombre ?? `Stand #${idStand}`;
                    const categoria =
                      f.categoriaStand ?? f.categoria ?? "Sin categoría";

                    return (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={2}
                        >
                          <Box>
                            <Typography fontWeight={800} fontSize={16}>
                              {nombreStand}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              mt={0.5}
                              alignItems="center"
                            >
                              <Chip
                                label={categoria}
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  bgcolor: "#dcfce7",
                                  color: "#166534",
                                  fontWeight: 700,
                                  height: 24,
                                }}
                              />
                            </Stack>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            width={{ xs: "100%", sm: "auto" }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => goStand(idStand)}
                              fullWidth={isMobile}
                              endIcon={<ArrowForwardIcon />}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "#16a34a",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#15803d" },
                              }}
                            >
                              Ver
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              fullWidth={isMobile}
                              onClick={() => quitarFavorito(idStand)}
                              sx={{
                                borderRadius: 2,
                                minWidth: 40,
                                borderColor: "#fee2e2",
                                bgcolor: "#fef2f2",
                                "&:hover": { borderColor: "#ef4444" },
                              }}
                            >
                              <DeleteOutlineIcon />
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </TabPanel>

            {/* TAB COMENTARIOS */}
            <TabPanel current={tab} value="comentarios">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h6" fontWeight={900}>
                  Historial de Reseñas
                </Typography>
                <IconButton
                  onClick={fetchCalificaciones}
                  disabled={loadingCal}
                  size="small"
                  sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Stack>

              {loadingCal ? (
                <Box py={5} textAlign="center">
                  <CircularProgress />
                </Box>
              ) : misCal.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                    borderRadius: 4,
                    border: "2px dashed #e2e8f0",
                  }}
                >
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }}
                  />
                  <Typography fontWeight={700} color="text.secondary">
                    No has realizado comentarios aún.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {misCal.map((c: any, idx) => {
                    const idStand = Number(c.idStand ?? c.standId ?? 0);
                    const nombreStand =
                      c.nombreStand ?? c.standNombre ?? `Stand #${idStand}`;

                    return (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={2}
                        >
                          <Box flex={1}>
                            <Typography fontWeight={800} fontSize={16}>
                              {nombreStand}
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mt={0.5}
                            >
                              <Rating
                                value={Number(c.puntuacion)}
                                readOnly
                                size="small"
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatFecha(c.fecha)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 1.5,
                                color: "#334155",
                                bgcolor: "#f8fafc",
                                p: 1.5,
                                borderRadius: 2,
                              }}
                            >
                              {c.comentario || "Sin comentario escrito."}
                            </Typography>
                          </Box>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => goStand(idStand)}
                            fullWidth={isMobile}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              borderColor: "#e2e8f0",
                              color: "#64748b",
                              alignSelf: { xs: "stretch", sm: "flex-start" },
                            }}
                          >
                            Ir al stand
                          </Button>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      <PublicFooter />
    </Box>
  );
}
