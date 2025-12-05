// src/pages/Store/TiendaHome.tsx
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

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

export default function TiendaHome() {
  // === DATOS ===
  const bloques = [
    {
      nombre: "Bloque A",
      detalle: "42 Puestos - Frutas y Verduras",
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAB9APYlCmTK0lIuC0GlKSWEjg3BaHmDaJ2VHf6BPW1qjDGc2KteQMzJS5MJkKjA4jm_DPji4JML_yIy6BWMknOj0mYeYjNPPxg73jKhFIdXe4Cm2hHKiJ7K7ccfIYxWbF4rU8KCvRl-E6HHFOh4Ry22_8rJUdrGAu1YG4j0S4A_UYSmmbhXu5_wvJIZm8heW8alE9LN8PFQ96i3F_EVmsxDc5g-pfCx0DgFjNrEDNy75zRpEzl82A2XlM2PUApgG5QUyWrP2CCEcQ",
    },
    {
      nombre: "Bloque B",
      detalle: "38 Puestos - Verduras y Hortalizas",
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBq6n1z6a5cBbNitoHWAepny_-JY6x7x_wq3_dNSi-YShIc1lNxULI3apWvMGKZLOqpns8gFGOeYt9-bsiBAtP02O8yjL8dWjzPHsK_6gRTlCurP5NgcEXT8n-rCFuVhLA1aL3HpJiIZEFMsGjZ_cRiosuYv3MEC3f5D7eE57wphh7b5S5KNvWOUdI9uARGPuveVTQFMOAAgc5jkkety0vqjH73-MwHca9f1_e_bB-sU3m9Byp8VKUWpWV73J4t5zOdDu-GuXRNA3Q",
    },
    {
      nombre: "Bloque C",
      detalle: "25 Puestos - Carnes y Aves",
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2oOC9EUxRrPsmsrKubCtewPzOB5k_OLIs0oUvW7msszL1Ahi9Cda71z3ESq-wkb48UhVhGdnTi_abJ5tSLvazGTzu7fAogNUzxPu4Dj7ZBZqFlWjnFt9uWbPCACnmiy2bb8IWt9VSbOdUxzwDAZIOLK8waYLYFq01LfeVXCHI2ZIgQAKu2ETg5znfn8SyYEuOf9alnQM5dLhAg0r5Ro8w9XYKdf-U6DbAcm-aAeXsBm4L98S8on7zxBJ38cr11wohwpSDQ4Eg0Dw",
    },
    {
      nombre: "Bloque D",
      detalle: "50 Puestos - Abarrotes y Lácteos",
      imagen:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBNWZ9cR_lB1-KaacvD4sUXhzHMbeAFf3B4zZN26LPLCzOfBhklqqXHlICaJ4lRtRQ9T4NOlZ1tLm_jjuOHUs_8ySmqxbcb5IskwmC_4jWWCJYr9AsUelwsPVWN7XTF3GmphYvzBEQww1UTklZ6EDe2YPrGQHYTQfRg5sShZIooKFe_UNG8JnFQO0yFEejWnirCyPrQAFeLGvknXUY_q5lPjlBkbDZLihiG14CO6u1BPFigK2M9Tjei0car_Hr0Fh_04zwTze6Dm4Y",
    },
  ];

  const categorias = [
    { nombre: "Frutas", tag: "Popular", icon: <LocalFloristIcon /> },
    { nombre: "Verduras", tag: "Popular", icon: <EcoIcon /> },
    { nombre: "Carnes", icon: <KebabDiningIcon /> },
    { nombre: "Aves", icon: <EggAltIcon /> },
    { nombre: "Pescados", icon: <SetMealIcon /> },
    { nombre: "Abarrotes", icon: <BakeryDiningIcon /> },
    { nombre: "Lácteos", icon: <SportsEsportsIcon /> },
    { nombre: "Bebidas", icon: <LiquorIcon /> },
    { nombre: "Empacados", icon: <Inventory2Icon /> },
    { nombre: "Otros", icon: <MoreHorizIcon /> },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <PublicHeader />

      {/* HERO SECTION */}
      <Box
        sx={{
          position: "relative",
          color: "#fff",
          py: 10,
          px: 2,
          backgroundImage:
            "linear-gradient(rgba(17,24,39,0.4), rgba(17,24,39,0.7)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA4pVkyWlRyF6THFJXvi93T83zgwctf1f2ldTv7QWvmsWrt1PKsznA6fRBAptI38i_qC1wiDHV4wZX99ylVaFns67Rt9y0CvBLhvAg1cze4kYDGKL-Cu070jQqdBxBhTjZqh9uegsZgSTqVKdJUoEfBwXk-XERXDpK9l6FsCRNMo63B5DocetxqzFjt_39X52CD1iD94ZbnBqkb2hxqkOoZ22A6hjHkoBa4HzrjqxTJKxSHyCoxRpEasCsO55YlkjcndoBGaRMARA')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 620 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, lineHeight: 1.1, mb: 2 }}
            >
              Bienvenido al Mercado Mayorista
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Encuentra stands, productos y precios actualizados.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                size="large"
                sx={{ borderRadius: 999 }}
              >
                Ver mapa del mercado
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="large"
                sx={{ borderRadius: 999 }}
              >
                Ver precios de productos
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6, flex: 1 }}>
        {/* SECCIÓN: BLOQUES */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Bloques y Pasillos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explora la distribución del mercado y encuentra lo que buscas
            fácilmente.
          </Typography>
        </Box>

        {/* REJILLA DE BLOQUES (CSS Grid) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr", // 1 columna en móvil
              sm: "repeat(2, 1fr)", // 2 columnas en tablet
              md: "repeat(4, 1fr)", // 4 columnas en PC
            },
            gap: 3,
            mb: 8,
          }}
        >
          {bloques.map((b, i) => (
            <Paper
              key={i}
              elevation={2}
              sx={{
                borderRadius: 3,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                bgcolor: "#ffffff",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                },
              }}
            >
              {/* Imagen */}
              <Box
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  aspectRatio: "16 / 9",
                  backgroundImage: `url(${b.imagen})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Texto */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {b.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {b.detalle}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* SECCIÓN: CATEGORÍAS */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Categorías del Mercado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre la gran variedad de productos que ofrecemos.
          </Typography>
        </Box>

        {/* REJILLA DE CATEGORÍAS (CSS Grid Responsivo) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)", // 2 columnas en móvil
              sm: "repeat(3, 1fr)", // 3 columnas en tablet
              md: "repeat(5, 1fr)", // 5 columnas en PC (perfecto para 10 items)
            },
            gap: 3,
          }}
        >
          {categorias.map((cat, i) => (
            <Paper
              key={i}
              elevation={1}
              sx={{
                borderRadius: 3,
                p: 3,
                textAlign: "center",
                bgcolor: "#ffffff",
                transition: "all 0.2s",
                cursor: "pointer",
                position: "relative", // Para posicionar elementos si fuera necesario
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-3px)",
                },
              }}
            >
              {/* Icono Circular */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "rgba(22, 163, 74, 0.14)", // Fondo verde suave
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#166534", // Icono verde oscuro
                  mb: 2,
                  "& svg": { fontSize: 32 },
                }}
              >
                {cat.icon}
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {cat.nombre}
              </Typography>

              {cat.tag && (
                <Chip
                  label={cat.tag}
                  size="small"
                  sx={{
                    mt: 1,
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    bgcolor: "#f59e0b",
                    color: "#fff",
                  }}
                />
              )}
            </Paper>
          ))}
        </Box>
      </Container>

      {/* FOOTER */}
      <PublicFooter />
    </Box>
  );
}
