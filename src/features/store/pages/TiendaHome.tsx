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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpeedIcon from "@mui/icons-material/Speed";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SavingsIcon from "@mui/icons-material/Savings";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

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
        const nombreCompleto = `${data.nombres ?? ""} ${data.apellidos ?? ""}`.trim();

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
  const categorias = [
    { nombre: "Frutas", icon: <LocalFloristIcon />, value: "frutas", color: "#22c55e" },
    { nombre: "Verduras", icon: <EcoIcon />, value: "verduras", color: "#10b981" },
    { nombre: "Carnes", icon: <KebabDiningIcon />, value: "carnes", color: "#ef4444" },
    { nombre: "Aves", icon: <EggAltIcon />, value: "aves", color: "#f59e0b" },
    { nombre: "Pescados", icon: <SetMealIcon />, value: "pescados", color: "#3b82f6" },
    { nombre: "Abarrotes", icon: <ShoppingBasketIcon />, value: "abarrotes", color: "#8b5cf6" },
    { nombre: "Lácteos", icon: <LocalDrinkIcon />, value: "lacteos", color: "#06b6d4" },
    { nombre: "Bebidas", icon: <LiquorIcon />, value: "bebidas", color: "#6366f1" },
    { nombre: "Empacados", icon: <AllInboxIcon />, value: "empacados", color: "#64748b" },
    { nombre: "Otros", icon: <MoreHorizIcon />, value: "otros", color: "#94a3b8" },
  ];

  const estadisticas = [
    { numero: "155+", label: "Puestos Activos", icon: <StorefrontIcon /> },
    { numero: "2,500+", label: "Productos Disponibles", icon: <ShoppingBasketIcon /> },
    { numero: "98%", label: "Satisfacción", icon: <CheckCircleIcon /> },
    { numero: "24/7", label: "Actualización Precios", icon: <SpeedIcon /> },
  ];

  const comoFunciona = [
    {
      numero: "1",
      titulo: "Explora el Catálogo",
      descripcion:
        "Navega por categorías o busca productos específicos con precios actualizados en tiempo real.",
      icon: <SearchIcon />,
      color: "#10b981",
    },
    {
      numero: "2",
      titulo: "Ubica el Puesto",
      descripcion:
        "Usa nuestro mapa interactivo para encontrar la ubicación exacta del vendedor en el mercado.",
      icon: <ExploreIcon />,
      color: "#3b82f6",
    },
    {
      numero: "3",
      titulo: "Realiza tu Compra",
      descripcion:
        "Visita el puesto directamente o contacta al vendedor para coordinar tu pedido mayorista.",
      icon: <ShoppingCartIcon />,
      color: "#f59e0b",
    },
  ];

  const beneficios = [
    {
      icon: <SavingsIcon />,
      titulo: "Precios Mayoristas",
      descripcion: "Accede a precios competitivos directamente de los comerciantes del mercado.",
      color: "#16a34a",
    },
    {
      icon: <VerifiedUserIcon />,
      titulo: "Vendedores Verificados",
      descripcion: "Todos los puestos están registrados y verificados por la administración del mercado.",
      color: "#3b82f6",
    },
    {
      icon: <SpeedIcon />,
      titulo: "Información Actualizada",
      descripcion: "Precios y disponibilidad actualizados constantemente por los propios vendedores.",
      color: "#f59e0b",
    },
    {
      icon: <LocalShippingIcon />,
      titulo: "Compra Directa",
      descripcion: "Sin intermediarios. Conecta directamente con los comerciantes del mercado.",
      color: "#8b5cf6",
    },
  ];

  const testimonios = [
    {
      nombre: "María González",
      negocio: "Restaurante El Sabor",
      comentario:
        "Desde que uso la plataforma, ahorro tiempo y siempre encuentro los mejores precios. Es muy fácil ubicar los puestos en el mapa.",
      avatar: "M",
    },
    {
      nombre: "Carlos Rojas",
      negocio: "Bodega San Martín",
      comentario:
        "Excelente herramienta para comparar precios. Me ha ayudado a optimizar mis compras mayoristas y conocer nuevos proveedores.",
      avatar: "C",
    },
    {
      nombre: "Ana Pérez",
      negocio: "Comedor Popular",
      comentario:
        "La actualización de precios en tiempo real es lo mejor. Ya no tengo que llamar a cada puesto, todo está en un solo lugar.",
      avatar: "A",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
      }}
    >
      <PublicHeader />

      {/* --- HERO SECTION (VIDEO FULL BLEED) --- */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          overflow: "hidden",

          // ✅ full-bleed (sin bordes laterales)
          width: "100vw",
          ml: "calc(50% - 50vw)",
          left: 0,
          right: 0,
        }}
      >
        {/* ✅ VIDEO FONDO */}
        <Box
          component="video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            zIndex: 0,
            transform: "translateZ(0)",
            filter: "saturate(1.05) contrast(1.02)",
          }}
        >
          <source src="/hero-santa-anita.mp4" type="video/mp4" />
        </Box>

        {/* ✅ overlay oscuro */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to bottom, rgba(2, 6, 23, 0.72) 0%, rgba(2, 6, 23, 0.58) 40%, rgba(2, 6, 23, 0.78) 100%)",
          }}
        />

        {/* ✅ glow verde */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.18) 0%, transparent 70%)",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Fade in timeout={1000}>
            <Stack spacing={{ xs: 3.5, md: 4.5 }} alignItems="center" textAlign="center">
              <Chip
                label="Mercado Mayorista de Santa Anita"
                sx={{
                  bgcolor: "rgba(52, 211, 153, 0.20)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  border: "1.5px solid rgba(52, 211, 153, 0.6)",
                  px: 2,
                  py: 0.5,
                  height: "auto",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 15px rgba(52, 211, 153, 0.25)",
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2.25rem", sm: "3.5rem", md: "4.75rem" },
                  lineHeight: 1.08,
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                  textShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)",
                  maxWidth: { xs: "100%", md: "900px" },
                }}
              >
                Calidad y frescura{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#6ee7b7",
                    textShadow:
                      "0 0 35px rgba(110, 231, 183, 0.5), 0 0 20px rgba(52, 211, 153, 0.4), 0 4px 20px rgba(0, 0, 0, 0.4)",
                    fontWeight: 900,
                  }}
                >
                  al mejor precio
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#f0fdf4",
                  maxWidth: 680,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  fontSize: { xs: "1rem", sm: "1.125rem", md: "1.2rem" },
                  textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
                  px: { xs: 2, sm: 0 },
                }}
              >
                Conecta directamente con los puestos del mercado. Consulta precios, ubica stands y
                gestiona tus pedidos mayoristas en un solo lugar.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                pt={{ xs: 1, md: 2 }}
                width={{ xs: "100%", sm: "auto" }}
                px={{ xs: 2, sm: 0 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ExploreIcon />}
                  onClick={irAMapaStands}
                  sx={{
                    borderRadius: "12px",
                    px: { xs: 3.5, md: 5 },
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                    fontWeight: 700,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                    boxShadow: "0 8px 28px rgba(22, 163, 74, 0.45)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 36px rgba(22, 163, 74, 0.55)",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Explorar Mapa
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => irAProductos()}
                  sx={{
                    borderRadius: "12px",
                    px: { xs: 3.5, md: 5 },
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                    fontWeight: 700,
                    textTransform: "none",
                    borderWidth: "2px",
                    borderColor: "#ffffff",
                    color: "#ffffff",
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(12px)",
                    "&:hover": {
                      borderWidth: "2px",
                      borderColor: "#ffffff",
                      bgcolor: "rgba(255, 255, 255, 0.22)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(255, 255, 255, 0.2)",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Ver Productos
                </Button>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  mt: { xs: 4, md: 6 },
                  p: { xs: 2, sm: 2.5 },
                  display: "inline-flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: { xs: 2, sm: 2.5 },
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                  maxWidth: { xs: "calc(100% - 32px)", sm: "auto" },
                }}
              >
                {!clienteLogueado ? (
                  <>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.875rem", sm: "0.95rem" } }}
                    >
                      ¿Eres cliente frecuente?
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button
                        size="small"
                        startIcon={<LoginIcon fontSize="small" />}
                        onClick={irLoginCliente}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#16a34a",
                          px: 2,
                          "&:hover": { bgcolor: alpha("#16a34a", 0.1) },
                        }}
                      >
                        Ingresar
                      </Button>
                      <Divider orientation="vertical" flexItem sx={{ height: 24, my: "auto" }} />
                      <Button
                        size="small"
                        startIcon={<PersonAddIcon fontSize="small" />}
                        onClick={irRegistroCliente}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#0f172a",
                          px: 2,
                          "&:hover": { bgcolor: alpha("#0f172a", 0.05) },
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
                          width: 36,
                          height: 36,
                          bgcolor: "#16a34a",
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box textAlign="left">
                        <Typography variant="body2" fontWeight={700} lineHeight={1.3} color="text.primary">
                          Hola, {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                          Sesión activa
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ display: { xs: "none", sm: "block" }, height: 40 }}
                    />
                    <Divider
                      flexItem
                      sx={{
                        display: { xs: "block", sm: "none" },
                        width: "100%",
                      }}
                    />

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Mi Perfil" arrow>
                        <IconButton
                          size="small"
                          onClick={irMiCuenta}
                          sx={{
                            "&:hover": {
                              bgcolor: alpha("#16a34a", 0.12),
                              color: "#16a34a",
                            },
                          }}
                        >
                          <AccountCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Mis Favoritos" arrow>
                        <IconButton
                          size="small"
                          onClick={irFavoritos}
                          sx={{
                            "&:hover": {
                              bgcolor: alpha("#16a34a", 0.12),
                              color: "#16a34a",
                            },
                          }}
                        >
                          <FavoriteBorderIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Salir" arrow>
                        <IconButton
                          size="small"
                          onClick={cerrarSesion}
                          sx={{
                            color: "#64748b",
                            "&:hover": {
                              bgcolor: alpha("#ef4444", 0.1),
                              color: "#ef4444",
                            },
                          }}
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

      {/* --- ESTADÍSTICAS --- */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: -6, md: -8 },
          position: "relative",
          zIndex: 10,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "20px",
            border: "1px solid #e5e7eb",
            bgcolor: "#ffffff",
            boxShadow: "0 20px 60px -15px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {estadisticas.map((stat, i) => (
              <Stack spacing={1.5} alignItems="center" textAlign="center" key={i}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "12px",
                    bgcolor: alpha("#16a34a", 0.1),
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    color="text.primary"
                    sx={{ fontSize: { xs: "1.75rem", md: "2rem" } }}
                  >
                    {stat.numero}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Paper>
      </Container>

      {/* --- CÓMO FUNCIONA --- */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              mb: 1.5,
              color: "#0f172a",
              fontSize: { xs: "1.875rem", md: "2.5rem" },
            }}
          >
            ¿Cómo Funciona?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.6,
            }}
          >
            Tres simples pasos para conectar con los mejores proveedores del mercado mayorista.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 3, md: 4 },
          }}
        >
          {comoFunciona.map((paso, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                bgcolor: "#ffffff",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 50px -15px rgba(0,0,0,0.12)",
                  borderColor: alpha(paso.color, 0.3),
                },
              }}
            >
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "14px",
                    bgcolor: alpha(paso.color, 0.12),
                    color: paso.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    position: "relative",
                  }}
                >
                  {paso.icon}
                  <Chip
                    label={paso.numero}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: paso.color,
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      height: 24,
                      minWidth: 24,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    gutterBottom
                    sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}
                  >
                    {paso.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}>
                    {paso.descripcion}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* --- CATEGORÍAS POPULARES (FONDO CON IMAGEN + EFECTOS) --- */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 10, md: 14 },
          borderTop: "1px solid #f1f5f9",
          overflow: "hidden",

          // ✅ imagen de fondo aquí
          backgroundImage: "url('/hero-santa-anita.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          backgroundRepeat: "no-repeat",

          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(2, 6, 23, 0.72) 0%, rgba(2, 6, 23, 0.55) 45%, rgba(2, 6, 23, 0.78) 100%)",
            zIndex: 0,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.18) 0%, transparent 70%)",
            zIndex: 0,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "center", md: "flex-end" }}
            mb={{ xs: 6, md: 8 }}
            spacing={2}
            textAlign={{ xs: "center", md: "left" }}
          >
            <Box>
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  mb: 1.5,
                  color: "#ffffff",
                  fontSize: { xs: "1.875rem", md: "2.5rem" },
                  textShadow: "0 2px 18px rgba(0,0,0,0.45)",
                }}
              >
                Categorías Populares
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.88)",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                }}
              >
                Todo lo que necesitas para tu negocio o tu hogar.
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => irAProductos()}
              sx={{
                fontWeight: 700,
                color: "#ffffff",
                px: 2.5,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)",
                bgcolor: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.18)",
                },
              }}
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
              gap: { xs: 2, md: 3 },
            }}
          >
            {categorias.map((cat, i) => (
              <Paper
                key={i}
                elevation={0}
                onClick={() => irAProductos(cat.value)}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: "14px",
                  bgcolor: "rgba(248,250,252,0.92)",
                  border: "1px solid rgba(241,245,249,0.9)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    bgcolor: "#fff",
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 32px -8px rgba(0,0,0,0.22)",
                    borderColor: alpha(cat.color, 0.35),
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 56, md: 68 },
                    height: { xs: 56, md: 68 },
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 2,
                    bgcolor: alpha(cat.color, 0.12),
                    color: cat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: 26, md: 30 },
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    ".MuiPaper-root:hover &": {
                      transform: "scale(1.12) rotate(5deg)",
                    },
                  }}
                >
                  {cat.icon}
                </Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ fontSize: { xs: "0.875rem", md: "0.95rem" } }}
                >
                  {cat.nombre}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --- BENEFICIOS --- */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              mb: 1.5,
              color: "#0f172a",
              fontSize: { xs: "1.875rem", md: "2.5rem" },
            }}
          >
            ¿Por Qué Elegirnos?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.6,
            }}
          >
            Conectamos compradores y vendedores de forma transparente y eficiente.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: { xs: 3, md: 4 },
          }}
        >
          {beneficios.map((ben, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: "16px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#ffffff",
                  transform: "translateY(-6px)",
                  boxShadow: "0 16px 40px -12px rgba(0,0,0,0.1)",
                  borderColor: alpha(ben.color, 0.3),
                },
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "12px",
                    bgcolor: alpha(ben.color, 0.12),
                    color: ben.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  {ben.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}>
                    {ben.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: "0.9rem" }}>
                    {ben.descripcion}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* --- TESTIMONIOS (sin Grid de MUI, usando Box) --- */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 10, md: 14 }, borderTop: "1px solid #f1f5f9" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                mb: 1.5,
                color: "#0f172a",
                fontSize: { xs: "1.875rem", md: "2.5rem" },
              }}
            >
              Lo Que Dicen Nuestros Clientes
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "0.95rem", md: "1rem" },
                lineHeight: 1.6,
              }}
            >
              Miles de negocios ya confían en nosotros para sus compras mayoristas.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {testimonios.map((test, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "16px",
                  bgcolor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  height: "100%",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 16px 40px -12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <FormatQuoteIcon
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontSize: 48,
                    color: alpha("#16a34a", 0.1),
                  }}
                />
                <Stack spacing={2.5}>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: "0.95rem",
                      fontStyle: "italic",
                    }}
                  >
                    "{test.comentario}"
                  </Typography>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "#16a34a",
                        fontWeight: 700,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {test.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {test.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                        {test.negocio}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --- CTA FINAL --- */}
      <Box
        sx={{
          bgcolor: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
          background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight={900} color="#ffffff" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
              ¿Listo para optimizar tus compras?
            </Typography>
            <Typography
              variant="h6"
              color="rgba(255, 255, 255, 0.9)"
              sx={{
                maxWidth: 600,
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.6,
              }}
            >
              Únete a miles de negocios que ya aprovechan nuestro marketplace mayorista.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={2} width={{ xs: "100%", sm: "auto" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={irRegistroCliente}
                sx={{
                  borderRadius: "12px",
                  px: 4,
                  py: 1.75,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  textTransform: "none",
                  bgcolor: "#ffffff",
                  color: "#16a34a",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                Crear Cuenta Gratis
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ExploreIcon />}
                onClick={irAMapaStands}
                sx={{
                  borderRadius: "12px",
                  px: 4,
                  py: 1.75,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderWidth: "2px",
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  "&:hover": {
                    borderWidth: "2px",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Explorar Ahora
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}