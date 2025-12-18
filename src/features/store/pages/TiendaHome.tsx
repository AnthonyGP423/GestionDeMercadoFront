// src/pages/Store/TiendaHome.tsx
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

// ICONOS MUI
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import EcoIcon from "@mui/icons-material/EnergySavingsLeafOutlined";
import KebabDiningIcon from "@mui/icons-material/KebabDining";
import EggAltIcon from "@mui/icons-material/EggAlt";
import SetMealIcon from "@mui/icons-material/SetMeal";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LiquorIcon from "@mui/icons-material/Liquor";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ExploreIcon from "@mui/icons-material/Explore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function TiendaHome() {
  const navigate = useNavigate();

  const irAProductos = (categoriaFiltro?: string) => {
    if (categoriaFiltro) {
      navigate("/tienda/precios-productos", {
        state: { initialCategory: categoriaFiltro },
      });
    } else {
      navigate("/tienda/precios-productos");
    }
  };

  const irAMapaStands = () => {
    navigate("/tienda/mapa-stand");
  };

  const irLoginCliente = () => {
    navigate("/cliente/login");
  };

  const irRegistroCliente = () => {
    navigate("/cliente/registro");
  };

  // === DATOS ===
  const bloques = [
    {
      id: "A",
      nombre: "Bloque A",
      detalle: "42 Puestos · Frutas y Verduras",
      icon: <LocalFloristIcon />,
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAB9APYlCmTK0lIuC0GlKSWEjg3BaHmDaJ2VHf6BPW1qjDGc2KteQMzJS5MJkKjA4jm_DPji4JML_yIy6BWMknOj0mYeYjNPPxg73jKhFIdXe4Cm2hHKiJ7K7ccfIYxWbF4rU8KCvRl-E6HHFOh4Ry22_8rJUdrGAu1YG4j0S4A_UYSmmbhXu5_wvJIZm8heW8alE9LN8PFQ96i3F_EVmsxDc5g-pfCx0DgFjNrEDNy75zRpEzl82A2XlM2PUApgG5QUyWrP2CCEcQ",
      color: "#10b981",
    },
    {
      id: "B",
      nombre: "Bloque B",
      detalle: "38 Puestos · Verduras y Hortalizas",
      icon: <EcoIcon />,
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBq6n1z6a5cBbNitoHWAepny_-JY6x7x_wq3_dNSi-YShIc1lNxULI3apWvMGKZLOqpns8gFGOeYt9-bsiBAtP02O8yjL8dWjzPHsK_6gRTlCurP5NgcEXT8n-rCFuVhLA1aL3HpJiIZEFMsGjZ_cRiosuYv3MEC3f5D7eE57wphh7b5S5KNvWOUdI9uARGPuveVTQFMOAAgc5jkkety0vqjH73-MwHca9f1_e_bB-sU3m9Byp8VKUWpWV73J4t5zOdDu-GuXRNA3Q",
      color: "#0ea5e9",
    },
    {
      id: "C",
      nombre: "Bloque C",
      detalle: "25 Puestos · Carnes y Aves",
      icon: <KebabDiningIcon />,
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2oOC9EUxRrPsmsrKubCtewPzOB5k_OLIs0oUvW7msszL1Ahi9Cda71z3ESq-wkb48UhVhGdnTi_abJ5tSLvazGTzu7fAogNUzxPu4Dj7ZBZqFlWjnFt9uWbPCACnmiy2bb8IWt9VSbOdUxzwDAZIOLK8waYLYFq01LfeVXCHI2ZIgQAKu2ETg5znfn8SyYEuOf9alnQM5dLhAg0r5Ro8w9XYKdf-U6DbAcm-aAeXsBm4L98S8on7zxBJ38cr11wohwpSDQ4Eg0Dw",
      color: "#ef4444",
    },
    {
      id: "D",
      nombre: "Bloque D",
      detalle: "50 Puestos · Abarrotes y Lácteos",
      icon: <StorefrontIcon />,
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBNWZ9cR_lB1-KaacvD4sUXhzHMbeAFf3B4zZN26LPLCzOfBhklqqXHlICaJ4lRtRQ9T4NOlZ1tLm_jjuOHUs_8ySmqxbcb5IskwmC_4jWWCJYr9AsUelwsPVWN7XTF3GmphYvzBEQww1UTklZ6EDe2YPrGQHYTQfRg5sShZIooKFe_UNG8JnFQO0yFEejWnirCyPrQAFeLGvknXUY_q5lPjlBkbDZLihiG14CO6u1BPFigK2M9Tjei0car_Hr0Fh_04zwTze6Dm4Y",
      color: "#8b5cf6",
    },
  ];

  const categorias = [
    {
      nombre: "Frutas",
      tag: "Popular",
      icon: <LocalFloristIcon />,
      value: "frutas",
      color: "#22c55e",
    },
    {
      nombre: "Verduras",
      tag: "Popular",
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
    {
      nombre: "Aves",
      icon: <EggAltIcon />,
      value: "aves",
      color: "#f59e0b",
    },
    {
      nombre: "Pescados",
      icon: <SetMealIcon />,
      value: "pescados",
      color: "#3b82f6",
    },
    {
      nombre: "Abarrotes",
      icon: <BakeryDiningIcon />,
      value: "abarrotes",
      color: "#8b5cf6",
    },
    {
      nombre: "Lácteos",
      icon: <SportsEsportsIcon />,
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
      icon: <Inventory2Icon />,
      value: "otros",
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
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        backgroundImage:
          "radial-gradient(circle at 15% 50%, rgba(22, 163, 74, 0.05) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.05) 0%, transparent 25%)",
      }}
    >
      {/* HEADER */}
      <PublicHeader />

      {/* HERO SECTION */}
      <Box
        sx={{
          position: "relative",
          color: "#fff",
          py: { xs: 10, md: 12 },
          px: 2,
          backgroundImage: `
            linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.92) 100%),
            url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA4pVkyWlRyF6THFJXvi93T83zgwctf1f2ldTv7QWvmsWrt1PKsznA6fRBAptI38i_qC1wiDHV4wZX99ylVaFns67Rt9y0CvBLhvAg1cze4kYDGKL-Cu070jQqdBxBhTjZqh9uegsZgSTqVKdJUoEfBwXk-XERXDpK9l6FsCRNMo63B5DocetxqzFjt_39X52CD1iD94ZbnBqkb2hxqkOoZ22A6hjHkoBa4HzrjqxTJKxSHyCoxRpEasCsO55YlkjcndoBGaRMARA')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, transparent 30%, rgba(22, 163, 74, 0.1) 100%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={800}>
            <Box
              sx={{
                maxWidth: 800,
                mx: "auto",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Chip
                label="Mercado Mayorista"
                size="small"
                sx={{
                  mb: 3,
                  px: 2,
                  py: 1,
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 3,
                  fontFamily: '"Inter", "Poppins", sans-serif',
                  fontSize: { xs: "2.75rem", md: "3.75rem" },
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Mercado Mayorista de Santa Anita
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: 650,
                  mx: "auto",
                  fontFamily: '"Inter", sans-serif',
                  color: "#e2e8f0",
                }}
              >
                Tu conexión directa con los mejores productos frescos y precios
                competitivos del mercado mayorista.
              </Typography>

              {/* BOTONES HERO */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ExploreIcon />}
                  sx={{
                    borderRadius: 3,
                    px: 5,
                    py: 1.8,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    backgroundColor: "#16a34a",
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                    boxShadow: "0 8px 32px rgba(22,163,74,0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                      boxShadow: "0 12px 40px rgba(22,163,74,0.6)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={irAMapaStands}
                >
                  Explorar Mapa
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<TrendingUpIcon />}
                  sx={{
                    borderRadius: 3,
                    px: 5,
                    py: 1.8,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    backgroundColor: "#f59e0b",
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                    boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                      boxShadow: "0 12px 40px rgba(217,119,6,0.6)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => irAProductos()}
                >
                  Ver Precios
                </Button>
              </Stack>

              {/* ACCESO CLIENTES */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontWeight: 500 }}
                >
                  ¿Eres cliente registrado?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      textTransform: "none",
                      color: "#e5e7eb",
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                      },
                    }}
                    onClick={irLoginCliente}
                  >
                    Iniciar Sesión
                  </Button>
                  <Box sx={{ color: "rgba(255,255,255,0.3)" }}>|</Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      color: "#facc15",
                      borderColor: "rgba(250,204,21,0.3)",
                      fontWeight: 700,
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: "#facc15",
                        bgcolor: "rgba(250,204,21,0.1)",
                        color: "#fef08a",
                      },
                    }}
                    onClick={irRegistroCliente}
                  >
                    Registrarme
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 4, md: 6 },
          mb: 10,
          flex: 1,
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* SECCIÓN: BLOQUES */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontFamily: '"Inter", "Poppins", sans-serif',
                color: "#1e293b",
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 4,
                  bgcolor: "#16a34a",
                  borderRadius: 2,
                },
              }}
            >
              Bloques del Mercado
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Navega por nuestra distribución organizada para encontrar
              exactamente lo que necesitas.
            </Typography>
          </Box>

          {/* REJILLA DE BLOQUES */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {bloques.map((b, i) => (
              <Paper
                key={i}
                elevation={0}
                onClick={() =>
                  navigate("/tienda/mapa-stand", {
                    state: { initialBlock: b.id },
                  })
                }
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  bgcolor: "#ffffff",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.08)",
                  border: "1px solid #f1f5f9",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
                    transform: "translateY(-8px)",
                    borderColor: alpha(b.color, 0.3),
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 160,
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(to bottom, transparent 0%, ${alpha(
                        b.color,
                        0.1
                      )} 100%)`,
                      zIndex: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(${b.imagen})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "transform 0.5s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      zIndex: 2,
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: alpha(b.color, 0.9),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {b.icon}
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: "#1e293b",
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {b.nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {b.detalle}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* SECCIÓN: CATEGORÍAS */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontFamily: '"Inter", "Poppins", sans-serif',
                color: "#1e293b",
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 4,
                  bgcolor: "#f59e0b",
                  borderRadius: 2,
                },
              }}
            >
              Categorías Principales
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Explora nuestra amplia gama de productos frescos y de calidad.
            </Typography>
          </Box>

          {/* REJILLA DE CATEGORÍAS */}
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
                  borderRadius: 3,
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#ffffff",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
                    transform: "translateY(-4px)",
                    borderColor: alpha(cat.color, 0.3),
                    bgcolor: alpha(cat.color, 0.02),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    bgcolor: alpha(cat.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: cat.color,
                    mb: 2.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                      bgcolor: alpha(cat.color, 0.15),
                    },
                    "& svg": {
                      fontSize: 32,
                    },
                  }}
                >
                  {cat.icon}
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: cat.tag ? 1 : 0,
                    color: "#1e293b",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {cat.nombre}
                </Typography>

                {cat.tag && (
                  <Chip
                    label={cat.tag}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      borderRadius: 999,
                      bgcolor: alpha("#f59e0b", 0.15),
                      color: "#92400e",
                      border: "1px solid",
                      borderColor: alpha("#f59e0b", 0.3),
                    }}
                  />
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>

      {/* FOOTER */}
      <Box sx={{ mt: "auto" }}>
        <PublicFooter />
      </Box>
    </Box>
  );
}
