// src/pages/Store/VistaProducto.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import ProductMainSection from "../../../features/store/components/product/ProductSeccionPrincipal";
import ProductOffersSection, {
  StandOferta,
} from "../../../features/store/components/product/ProductSeccionOferta";
// import ProductReviewsSection from "../../components/layout/store/product/ProductComentarios"; // cuando lo uses

// ==== tipo del producto que usa la vista ====
type ProductoVista = {
  id: number;
  nombre: string;
  imagen: string;
  descripcionCorta: string;

  categoria: string;
  precio: number;
  unidad: string;
  rating: number;
  totalValoraciones: number;
  standPrincipal: {
    id?: number;
    nombre: string;
    bloque: string;
    numero: string;
    propietario: string;
  };
};

// endpoint base
const PRODUCTO_API_URL = "http://localhost:8080/api/public/productos";

export default function VistaProducto() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();

  const [producto, setProducto] = useState<ProductoVista | null>(null);
  const [otrasOfertas, setOtrasOfertas] = useState<StandOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProductoYOfertas = async () => {
      try {
        setLoading(true);
        setError(null);

        // ===== DETALLE PRINCIPAL =====
        const resp = await axios.get(`${PRODUCTO_API_URL}/${id}`);
        const p = resp.data; // ProductoPublicResponseDto (+campos que agregues)

        const mapped: ProductoVista = {
          id: p.idProducto,
          nombre: p.nombreProducto,
          imagen:
            p.imagenUrl ??
            "https://via.placeholder.com/800x600?text=Sin+imagen",
          descripcionCorta:
            p.descripcion ??
            "Producto del mercado mayorista disponible para hoy.",
          categoria: p.categoriaProducto ?? "Sin categoría",
          precio: Number(p.precioActual),
          unidad: p.unidadMedida ?? "unidad",
          rating: p.ratingPromedio ?? 1,
          totalValoraciones: p.totalValoraciones ?? 0,
          standPrincipal: {
            id: p.idStand ?? undefined,
            nombre: p.nombreStand ?? "Stand no asignado",
            bloque: p.bloque ?? "-",
            numero: p.numeroStand ? `Puesto ${p.numeroStand}` : "-",
            propietario: p.propietarioStand ?? "No registrado",
          },
        };

        setProducto(mapped);

        // ===== OTRAS OFERTAS (cuando tengas endpoint) =====
        try {
          const respOfertas = await axios.get(
            `${PRODUCTO_API_URL}/${id}/ofertas`
          );

          const ofertasMapped: StandOferta[] = (respOfertas.data ?? []).map(
            (o: any) => ({
              id: o.idOferta ?? o.id ?? 0,
              nombreStand: o.nombreStand,
              bloque: o.bloque,
              numeroStand: o.numeroStand,
              precio: Number(o.precio),
              unidad: o.unidadMedida ?? "unidad",
              rating: o.ratingPromedio ?? 0,
              totalValoraciones: o.totalValoraciones ?? 0,
            })
          );

          setOtrasOfertas(ofertasMapped);
        } catch (e) {
          // Si aún no tienes el endpoint /{id}/ofertas, simplemente no mostramos sección.
          setOtrasOfertas([]);
        }
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar la información del producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductoYOfertas();
  }, [id]);

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
        {/* estados de carga / error */}
        {loading && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Cargando producto...
            </Typography>
          </Box>
        )}

        {error && !loading && <Alert severity="error">{error}</Alert>}

        {/* contenido solo si hay producto */}
        {!loading && !error && producto && (
          <>
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

            {/* otras ofertas de stands (solo se muestra si hay) */}
            <ProductOffersSection ofertas={otrasOfertas} />

            {/* más adelante: <ProductReviewsSection ... /> */}
          </>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}
