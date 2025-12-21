// src/pages/Store/VistaProducto.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Fade,
  Grow,
  Divider,
  Chip,
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";

// Iconos
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import ProductMainSection from "../../../features/store/components/product/ProductSeccionPrincipal";
import ProductOffersSection, {
  StandOferta,
} from "../../../features/store/components/product/ProductSeccionOferta";

// ==== Tipos ====
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

// Endpoint base
const PRODUCTO_API_URL = "http://localhost:8080/api/public/productos";

export default function VistaProducto() {
  const { id } = useParams<{ id: string }>();

  const [producto, setProducto] = useState<ProductoVista | null>(null);
  const [otrasOfertas, setOtrasOfertas] = useState<StandOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll al inicio al cargar

    const fetchProductoYOfertas = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. DETALLE PRINCIPAL
        const resp = await axios.get(`${PRODUCTO_API_URL}/${id}`);
        const p = resp.data;

        const mapped: ProductoVista = {
          id: p.idProducto,
          nombre: p.nombreProducto,
          imagen:
            p.imagenUrl ??
            "https://via.placeholder.com/800x600?text=Sin+imagen",
          descripcionCorta:
            p.descripcion ??
            "Producto fresco seleccionado del mercado mayorista.",
          categoria: p.categoriaProducto ?? "Sin categoría",
          precio: Number(p.precioActual),
          unidad: p.unidadMedida ?? "unidad",
          rating: p.ratingPromedio ?? 0,
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

        // 2. OTRAS OFERTAS (Si falla, no bloquea la vista principal)
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
          console.warn("No se cargaron ofertas adicionales o no existen.");
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
        background:
          "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 50%, #ffffff 100%)",
      }}
    >
      <PublicHeader />

      {/* HEADER BACKGROUND DECORATION */}
      <Box
        sx={{
          height: { xs: 160, md: 220 },
          background:
            "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%)",
          position: "absolute",
          top: 64, // Altura approx del header
          left: 0,
          right: 0,
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ py: 4, flex: 1, position: "relative", zIndex: 1 }}
      >
        {/* BREADCRUMBS */}
        <Box mb={4}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <MuiLink
              component={RouterLink}
              to="/tienda"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                "&:hover": { color: "#16a34a" },
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Inicio
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/tienda/precios-productos"
              color="inherit"
              sx={{ "&:hover": { color: "#16a34a" } }}
            >
              Productos
            </MuiLink>
            {producto && (
              <Typography color="text.primary" fontWeight={600}>
                {producto.nombre}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>

        {/* LOADING STATE */}
        {loading && (
          <Fade in>
            <Box sx={{ textAlign: "center", py: 10 }}>
              <CircularProgress size={48} sx={{ color: "#22c55e" }} />
              <Typography
                sx={{ mt: 2, fontWeight: 600 }}
                color="text.secondary"
              >
                Buscando detalles del producto...
              </Typography>
            </Box>
          </Fade>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
                fontWeight: 500,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* CONTENIDO DEL PRODUCTO */}
        {!loading && !error && producto && (
          <Grow in timeout={500}>
            <Stack spacing={6}>
              {/* 1. SECCIÓN PRINCIPAL (Imagen, Info, Precio, Botones) */}
              <Box>
                <ProductMainSection producto={producto} />
              </Box>

              {/* Separador sutil si hay ofertas */}
              {otrasOfertas.length > 0 && (
                <Divider sx={{ borderColor: "#e5e7eb" }}>
                  <Chip label="Otras opciones" size="small" />
                </Divider>
              )}

              {/* 2. OTRAS OFERTAS */}
              {otrasOfertas.length > 0 && (
                <Box>
                  <ProductOffersSection ofertas={otrasOfertas} />
                </Box>
              )}

              {/* 3. COMENTARIOS (Placeholder para futuro) */}
              {/* <Box>
                   <ProductReviewsSection productoId={producto.id} /> 
                </Box> 
              */}
            </Stack>
          </Grow>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}
