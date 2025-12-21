// src/pages/Store/TiendaHome.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  alpha,
  Fade,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import { useAuthContext } from "../../../auth/AuthContext";
import { clienteApi } from "../../../api/cliente/clienteApi";

// --- ICONOS ---
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import EcoIcon from "@mui/icons-material/EnergySavingsLeafOutlined";
import KebabDiningIcon from "@mui/icons-material/KebabDining";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EggAltIcon from "@mui/icons-material/EggAlt";
import SetMealIcon from "@mui/icons-material/SetMeal";
import LiquorIcon from "@mui/icons-material/Liquor";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import ExploreIcon from "@mui/icons-material/Explore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function normalizeRole(rol?: string) {
  return String(rol ?? "").toUpperCase();
}
function isClienteRole(rol?: string) {
  const r = normalizeRole(rol);
  return r === "CLIENTE" || r === "ROLE_CLIENTE";
}

export default function TiendaHome() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, login, logout } = useAuthContext();

  const clienteLogueado = isAuthenticated && isClienteRole(user?.rol);

  // --- LÓGICA DE USUARIO ---
  const displayName = useMemo(() => {
    const nombreCompleto = user?.nombreCompleto?.trim();
    if (nombreCompleto) return nombreCompleto;
    const email = user?.email?.trim();
    return email || "Cliente";
  }, [user]);

  const [loadingMe, setLoadingMe] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const needsMe =
      clienteLogueado &&
      !!token &&
      (!user?.nombreCompleto || user.nombreCompleto.trim().length < 2);

    if (!needsMe || loadingMe) return;

    (async () => {
      try {
        setLoadingMe(true);
        const { data } = await clienteApi.me();
        if (cancelled) return;
        const nombreCompleto = `${data.nombres ?? ""} ${
          data.apellidos ?? ""
        }`.trim();

        login(token!, {
          email: data.email,
          nombreCompleto: nombreCompleto || data.email,
          rol: data.rol ?? "CLIENTE",
        });
      } catch (e) {
        console.warn("No se pudo obtener /cliente/me:", e);
      } finally {
        if (!cancelled) setLoadingMe(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteLogueado, token, user?.nombreCompleto]);

  // --- NAVEGACIÓN ---
  const irAProductos = (categoriaFiltro?: string) => {
    if (categoriaFiltro) {
      navigate("/tienda/precios-productos", {
        state: { initialCategory: categoriaFiltro },
      });
    } else {
      navigate("/tienda/precios-productos");
    }
  };

  const irAMapaStands = () => navigate("/tienda/mapa-stand");
  const irLoginCliente = () => navigate("/cliente/login");
  const irRegistroCliente = () => navigate("/cliente/registro");
  const irMiCuenta = () => navigate("/tienda/perfil-usuario");
  const irFavoritos = () => navigate("/tienda/favoritos");

  const cerrarSesion = () => {
    logout();
    navigate("/tienda", { replace: true });
  };

  // --- DATOS ESTÁTICOS ---
  const bloques = [
    {
      id: "A",
      nombre: "Bloque A",
      detalle: "Frutas y Verduras",
      count: "42 Puestos",
      icon: <LocalFloristIcon />,
      color: "#10b981", // Emerald
      bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    },
    {
      id: "B",
      nombre: "Bloque B",
      detalle: "Hortalizas y Tubérculos",
      count: "38 Puestos",
      icon: <EcoIcon />,
      color: "#0ea5e9", // Sky
      bgGradient: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    },
    {
      id: "C",
      nombre: "Bloque C",
      detalle: "Carnes y Aves",
      count: "25 Puestos",
      icon: <KebabDiningIcon />,
      color: "#ef4444", // Red
      bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    },
    {
      id: "D",
      nombre: "Bloque D",
      detalle: "Abarrotes y Lácteos",
      count: "50 Puestos",
      icon: <StorefrontIcon />,
      color: "#8b5cf6", // Violet
      bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    },
  ];

  const categorias = [
    {
      nombre: "Frutas",
      icon: <LocalFloristIcon />,
      value: "frutas",
      color: "#22c55e",
    },
    {
      nombre: "Verduras",
      icon: <EcoIcon />,
      value: "verduras",
      color: "#10b981",
    },
    {
      nombre: "Carnes",
      icon: <KebabDiningIcon />,
      value: "carnes",
      color: "#ef4444",
    },
    { nombre: "Aves", icon: <EggAltIcon />, value: "aves", color: "#f59e0b" },
    {
      nombre: "Pescados",
      icon: <SetMealIcon />,
      value: "pescados",
      color: "#3b82f6",
    },
    {
      nombre: "Abarrotes",
      icon: <ShoppingBasketIcon />,
      value: "abarrotes",
      color: "#8b5cf6",
    },
    {
      nombre: "Lácteos",
      icon: <LocalDrinkIcon />,
      value: "lacteos",
      color: "#06b6d4",
    },
    {
      nombre: "Bebidas",
      icon: <LiquorIcon />,
      value: "bebidas",
      color: "#6366f1",
    },
    {
      nombre: "Empacados",
      icon: <AllInboxIcon />,
      value: "empacados",
      color: "#64748b",
    },
    {
      nombre: "Otros",
      icon: <MoreHorizIcon />,
      value: "otros",
      color: "#94a3b8",
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

      {/* --- HERO SECTION --- */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 50%, rgba(22,163,74,0.05) 0%, transparent 70%)",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={800}>
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Chip
                label="Mercado Mayorista de Santa Anita"
                sx={{
                  bgcolor: "rgba(22,163,74,0.1)",
                  color: "#15803d",
                  fontWeight: 700,
                  border: "1px solid rgba(22,163,74,0.2)",
                  px: 1,
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                  lineHeight: 1.1,
                  background:
                    "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                Calidad y frescura <br />
                <Box
                  component="span"
                  sx={{ color: "#16a34a", WebkitTextFillColor: "#16a34a" }}
                >
                  al mejor precio
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  maxWidth: 700,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                Conecta directamente con los puestos del mercado. Consulta
                precios, ubica stands y gestiona tus pedidos mayoristas en un
                solo lugar.
              </Typography>

              {/* BOTONES HERO */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                pt={2}
                width={{ xs: "100%", sm: "auto" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ExploreIcon />}
                  onClick={irAMapaStands}
                  fullWidth
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    boxShadow: "0 8px 20px rgba(22,163,74,0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #15803d 0%, #14532d 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 25px rgba(22,163,74,0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Explorar Mapa
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => irAProductos()}
                  fullWidth
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderColor: "#e2e8f0",
                    color: "#0f172a",
                    bgcolor: "#fff",
                    "&:hover": {
                      borderColor: "#cbd5e1",
                      bgcolor: "#f8fafc",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Ver Productos
                </Button>
              </Stack>

              {/* TARJETA DE ESTADO DE USUARIO */}
              <Paper
                elevation={0}
                sx={{
                  mt: 6,
                  p: 1,
                  pr: 3,
                  pl: 3,
                  display: "inline-flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: { xs: 2, sm: 3 },
                  borderRadius: 999, // Pill shape
                  border: "1px solid rgba(22,163,74,0.15)",
                  bgcolor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                }}
              >
                {!clienteLogueado ? (
                  <>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      ¿Eres cliente frecuente?
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<LoginIcon />}
                        onClick={irLoginCliente}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#16a34a",
                        }}
                      >
                        Ingresar
                      </Button>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ height: 20, my: "auto" }}
                      />
                      <Button
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={irRegistroCliente}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        Registrarse
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "#16a34a",
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box textAlign="left">
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          lineHeight={1.2}
                        >
                          Hola, {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sesión activa
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ display: { xs: "none", sm: "block" } }}
                    />
                    <Divider
                      flexItem
                      sx={{
                        display: { xs: "block", sm: "none" },
                        width: "100%",
                      }}
                    />

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Mi Perfil">
                        <IconButton size="small" onClick={irMiCuenta}>
                          <AccountCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mis Favoritos">
                        <IconButton size="small" onClick={irFavoritos}>
                          <FavoriteBorderIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Salir">
                        <IconButton
                          size="small"
                          onClick={cerrarSesion}
                          color="error"
                        >
                          <LogoutIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </>
                )}
              </Paper>
            </Stack>
          </Fade>
        </Container>
      </Box>

      {/* --- BLOQUES --- */}
      <Container maxWidth="lg" sx={{ mb: 10, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ mb: 1, color: "#0f172a" }}
          >
            Navega por Bloques
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
            El mercado está organizado para que encuentres rápidamente lo que
            buscas.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {bloques.map((b) => (
            <Paper
              key={b.id}
              elevation={0}
              onClick={() =>
                navigate("/tienda/mapa-stand", {
                  state: { initialBlock: b.id },
                })
              }
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "#ffffff",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                  borderColor: alpha(b.color, 0.3),
                },
              }}
            >
              {/* Fondo decorativo sutil */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "60%",
                  height: "60%",
                  background: b.bgGradient,
                  filter: "blur(40px)",
                  opacity: 0.5,
                  zIndex: 0,
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    mb: 2,
                    bgcolor: alpha(b.color, 0.1),
                    color: b.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {b.icon}
                </Box>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  {b.nombre}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ mb: 0.5 }}
                >
                  {b.detalle}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {b.count}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* --- CATEGORÍAS --- */}
      <Box sx={{ bgcolor: "#fff", py: 10, borderTop: "1px solid #f1f5f9" }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="end"
            mb={6}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ mb: 1, color: "#0f172a" }}
              >
                Categorías Populares
              </Typography>
              <Typography color="text.secondary">
                Todo lo que necesitas para tu negocio o tu hogar.
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => irAProductos()}
              sx={{ fontWeight: 700, color: "#16a34a" }}
            >
              Ver todo el catálogo
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(5, 1fr)",
              },
              gap: 3,
            }}
          >
            {categorias.map((cat, i) => (
              <Paper
                key={i}
                elevation={0}
                onClick={() => irAProductos(cat.value)}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "#fff",
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                    borderColor: alpha(cat.color, 0.3),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 2,
                    bgcolor: alpha(cat.color, 0.1),
                    color: cat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s",
                    ".MuiPaper-root:hover &": { transform: "scale(1.1)" },
                  }}
                >
                  {cat.icon}
                </Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="text.primary"
                >
                  {cat.nombre}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
