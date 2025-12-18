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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import RefreshIcon from "@mui/icons-material/Refresh";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
  { value: "perfil", label: "Perfil" },
  { value: "favoritos", label: "Stands favoritos" },
  { value: "comentarios", label: "Mis comentarios" },
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
      navigate("/cliente/login", { replace: true, state: { from: "/tienda/perfil-usuario" } });
    }
  }, [isCliente, navigate]);

  const nombreCompleto = useMemo(() => {
    if (me) return `${me.nombres ?? ""} ${me.apellidos ?? ""}`.trim() || me.email;
    const correo = user?.email ?? "";
    return user?.nombreCompleto ?? (correo ? correo.split("@")[0] : "Cliente");
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
      setFavoritos((prev) => prev.filter((x) => x.idStand !== idStand));
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "linear-gradient(180deg, #ecfdf3 0%, #f8fafc 45%, #ffffff 100%)",
      }}
    >
      <PublicHeader />

      {/* Hero */}
      <Box
        sx={{
          pt: 4,
          pb: 3,
          background:
            "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 55%), radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 55%)",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid #d1fae5",
              background:
                "linear-gradient(135deg, #ecfdf3 0%, #ffffff 45%, #eff6ff 100%)",
              boxShadow:
                "0 18px 45px rgba(15,23,42,0.16), 0 0 0 1px rgba(148,163,184,0.10)",
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#16a34a",
                    fontWeight: 900,
                    boxShadow: "0 12px 25px rgba(22,163,74,0.25)",
                  }}
                >
                  {safeInitial(nombreCompleto)}
                </Avatar>

                <Box>
                  <Typography variant="overline" sx={{ letterSpacing: 2, color: "#16a34a", fontWeight: 800 }}>
                    Cliente
                  </Typography>

                  <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.03em" }}>
                    {nombreCompleto}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      icon={<EmailOutlinedIcon />}
                      label={correo || "—"}
                      sx={{ borderRadius: 999, bgcolor: "#ffffff", border: "1px solid #e5e7eb" }}
                    />
                    <Chip
                      size="small"
                      icon={<PhoneOutlinedIcon />}
                      label={me?.telefono ? me.telefono : "Teléfono no registrado"}
                      sx={{ borderRadius: 999, bgcolor: "#ffffff", border: "1px solid #e5e7eb" }}
                    />
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Actualizar datos">
                  <span>
                    <IconButton
                      onClick={refreshAll}
                      disabled={loadingMe || loadingFav || loadingCal}
                      sx={{ borderRadius: 999, border: "1px solid #e5e7eb", bgcolor: "#ffffff" }}
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
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    bgcolor: "#0f172a",
                    "&:hover": { bgcolor: "#020617" },
                  }}
                >
                  Salir
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* KPIs */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FavoriteIcon sx={{ color: "#16a34a" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Favoritos
                    </Typography>
                    <Typography fontWeight={900} fontSize={18}>
                      {stats.totalFav}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StorefrontIcon sx={{ color: "#2563eb" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Comentarios
                    </Typography>
                    <Typography fontWeight={900} fontSize={18}>
                      {stats.totalRes}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Rating value={stats.promedio} precision={0.5} readOnly size="small" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Promedio
                    </Typography>
                    <Typography fontWeight={900} fontSize={18}>
                      {stats.totalRes ? stats.promedio.toFixed(1) : "—"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Contenido */}
      <Container maxWidth="md" sx={{ pb: 5, flex: 1 }}>
        {(errorMe || errorFav || errorCal) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMe || errorFav || errorCal}
          </Alert>
        )}

        {(loadingMe || loadingFav || loadingCal) && !me && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 1 }} color="text.secondary">
              Preparando tu perfil...
            </Typography>
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 3, pt: 2 }}>
            <AppTabs
              value={tab}
              onChange={(v) => setTab(v as TabKey)}
              items={PERFIL_TABS}
              aria-label="secciones del perfil de usuario"
            />
          </Box>
          <Divider />

          <Box sx={{ p: 3 }}>
            {/* PERFIL */}
            <TabPanel current={tab} value="perfil">
              <Typography variant="subtitle1" fontWeight={900}>
                Información básica
              </Typography>
              <Divider sx={{ my: 2 }} />

              {loadingMe ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : me ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nombre completo
                    </Typography>
                    <Typography fontWeight={700}>
                      {`${me.nombres ?? ""} ${me.apellidos ?? ""}`.trim() || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography fontWeight={700}>{me.email ?? "—"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography fontWeight={700}>{me.telefono ?? "—"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Rol
                    </Typography>
                    <Typography fontWeight={700}>{me.rol ?? "CLIENTE"}</Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">No se pudo cargar tu información.</Typography>
              )}
            </TabPanel>

            {/* FAVORITOS */}
            <TabPanel current={tab} value="favoritos">
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight={900}>
                  Stands favoritos
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={fetchFavoritos}
                  disabled={loadingFav}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}
                >
                  Actualizar
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {loadingFav ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    Cargando favoritos...
                  </Typography>
                </Box>
              ) : favoritos.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{ p: 3, borderRadius: 3, border: "1px dashed #cbd5e1", bgcolor: "#f8fafc" }}
                >
                  <Typography fontWeight={800}>Aún no tienes favoritos</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Ve a un stand y presiona “Guardar en favoritos ❤️”.
                  </Typography>
                  <Button
                    onClick={() => navigate("/tienda/mapa-stand")}
                    variant="contained"
                    sx={{
                      mt: 2,
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      bgcolor: "#16a34a",
                      "&:hover": { bgcolor: "#15803d" },
                    }}
                  >
                    Explorar stands
                  </Button>
                </Paper>
              ) : (
                <List sx={{ p: 0 }}>
                  {favoritos.map((f) => (
                    <Paper
                      key={f.idFavorito}
                      elevation={0}
                      sx={{
                        mb: 1.5,
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                        transition: "all 0.2s ease",
                        "&:hover": { boxShadow: "0 10px 25px rgba(15,23,42,0.08)" },
                      }}
                    >
                      <ListItem
                        disableGutters
                        secondaryAction={
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => goStand(f.idStand)}
                              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}
                            >
                              Ver stand
                            </Button>

                            <Tooltip title="Quitar de favoritos">
                              <IconButton
                                onClick={() => quitarFavorito(f.idStand)}
                                sx={{ border: "1px solid #e5e7eb", borderRadius: 999 }}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography fontWeight={900}>{f.nombreStand ?? "Stand"}</Typography>
                              <Chip
                                size="small"
                                label={f.categoriaStand ?? "Sin categoría"}
                                sx={{ borderRadius: 999, bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 }}
                              />
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              📍 Bloque {f.bloque ?? "-"} · Puesto {f.numeroStand ?? "-"}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* COMENTARIOS */}
            <TabPanel current={tab} value="comentarios">
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight={900}>
                  Mis comentarios a stands
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={fetchCalificaciones}
                  disabled={loadingCal}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}
                >
                  Actualizar
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {loadingCal ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    Cargando comentarios...
                  </Typography>
                </Box>
              ) : misCal.length === 0 ? (
                <Typography color="text.secondary">
                  Aún no has dejado comentarios. Ve a un stand y agrega tu reseña.
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {misCal.map((c) => (
                    <Paper
                      key={c.idCalificacion}
                      elevation={0}
                      sx={{ mb: 1.5, p: 2, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}
                    >
                      <ListItem
                        disableGutters
                        secondaryAction={
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => goStand(c.idStand)}
                            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800 }}
                          >
                            Ver stand
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight={900}>
                                {c.nombreStand ?? `Stand #${c.idStand}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatFecha(c.fecha)}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ mt: 0.75 }}>
                              <Rating value={Number(c.puntuacion ?? 0)} readOnly size="small" />
                              <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
                                {c.comentario?.trim()
                                  ? c.comentario
                                  : "Sin comentario (solo puntuación)."}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
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