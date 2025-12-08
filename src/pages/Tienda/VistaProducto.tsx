import { Box, Container, Typography, useTheme } from "@mui/material";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

import ProductMainSection from "../../components/layout/store/product/ProductSeccionPrincipal";
import ProductOffersSection from "../../components/layout/store/product/ProductSeccionOferta";
import ProductReviewsSection from "../../components/layout/store/product/ProductComentarios";

// Tipos simples
type StandOferta = {
  id: number;
  nombreStand: string;
  bloque: string;
  numeroStand: string;
  precio: number;
  unidad: string;
  rating: number;
  totalValoraciones: number;
};

export default function VistaProducto() {
  const theme = useTheme();

  const producto = {
    id: 1,
    nombre: "Mango Tommy Premium",
    imagen:
      "https://images.pexels.com/photos/6157043/pexels-photo-6157043.jpeg?auto=compress&cs=tinysrgb&w=800",
    descripcionCorta:
      "Mangos seleccionados de pulpa dulce y firme. Ideales para consumo directo, jugos y postres gourmet. Cosecha fresca de la semana.",
    categoria: "Frutas y Verduras",
    precio: 4.5,
    unidad: "kg",
    rating: 4.8,
    totalValoraciones: 124,
    standPrincipal: {
      nombre: "Frutas del Sol",
      bloque: "A",
      numero: "Puesto 15",
      propietario: "Juan Pérez",
    },
  };

  const otrasOfertas: StandOferta[] = [
    {
      id: 1,
      nombreStand: "El Huerto Andino",
      bloque: "A",
      numeroStand: "03",
      precio: 4.3,
      unidad: "kg",
      rating: 4.5,
      totalValoraciones: 56,
    },
    {
      id: 2,
      nombreStand: "Comercial Anita",
      bloque: "B",
      numeroStand: "12",
      precio: 4.6,
      unidad: "kg",
      rating: 4.9,
      totalValoraciones: 89,
    },
    {
      id: 3,
      nombreStand: "Delicias Tropicales",
      bloque: "C",
      numeroStand: "07",
      precio: 4.2,
      unidad: "kg",
      rating: 4.2,
      totalValoraciones: 34,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        {/* Breadcrumb */}
        <Typography
          variant="body2"
          sx={{ mb: 4, color: "text.secondary", fontWeight: 500 }}
        >
          Inicio / Productos /{" "}
          <span style={{ color: theme.palette.primary.main }}>
            {producto.categoria}
          </span>{" "}
          / {producto.nombre}
        </Typography>

        {/* sección principal (imagen + info) */}
        <ProductMainSection producto={producto} />

        {/* otras ofertas de stands */}
        <ProductOffersSection ofertas={otrasOfertas} />

        {/* comentarios */}
        <ProductReviewsSection />
      </Container>

      <PublicFooter />
    </Box>
  );
}
