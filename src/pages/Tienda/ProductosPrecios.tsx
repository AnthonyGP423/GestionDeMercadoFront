import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

// Layout
import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

// Componentes internos
import ProductFiltersBar from "../../components/shared/ProductFiltersBar";
import OffersStrip from "../../components/layout/store/OffersStrip";
import PriceComparatorBanner from "../../components/layout/store/PriceComparatorBanner";
import ProductsGrid, {
  StoreProduct,
} from "../../components/layout/store/ProductsGrid";

// ================== CONFIG API ==================
const API_URL = "http://localhost:8080/api/v1/admin/productos";
// Si de verdad tu endpoint es .../productos/1, cámbialo arriba

// Mapa simple para conectar value del filtro con el texto de la categoría
const CATEGORY_MAP: Record<string, string> = {
  frutas: "Frutas",
  verduras: "Verduras",
  carnes: "Carnes",
  aves: "Aves",
  pescados: "Pescados",
  abarrotes: "Abarrotes",
  lacteos: "Lácteos",
  bebidas: "Bebidas",
  otros: "Otros",
};

export default function PreciosProductos() {
  // ===== estados de filtros =====
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");
  const [priceRange, setPriceRange] = useState("todos");
  const [sortBy, setSortBy] = useState("relevancia");

  // ===== estados de datos API =====
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ================== FETCH A SPRING BOOT ==================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si necesitas token, lo sacas de donde lo guardes (localStorage, context, etc.)
        const token = localStorage.getItem(
          "eyJhbGciOiJIUzI1NiJ9.eyJyb2wiOiJBRE1JTiIsInN1YiI6Implc3VzLnJhbW9zQG1lcmNhZG8uY29tIiwiaWF0IjoxNzY1MTYwMzgxLCJleHAiOjE3NjUxODkxODF9.uKjUlqw4MhKyyhQWoKMXKNWiYqI3OICdk4xkGMFhfdQ"
        ); // ejemplo, ajusta a tu caso

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "*/*",
          },
        });

        // 👇 Si tu backend devuelve un array de productos directamente:
        const data = response.data as any[];

        // Si lo devuelve envuelto (ej: { content: [...] }), cambiar por response.data.content
        // const data = response.data.content as any[];

        const mapped: StoreProduct[] = data.map((p: any) => {
          const enOferta = p.enOferta === true;
          const tienePrecioOferta =
            enOferta && p.precioOferta !== null && p.precioOferta !== undefined;

          // precio a mostrar (si hay oferta, mostramos precioOferta, si no, precioActual)
          const precioFinal = tienePrecioOferta
            ? p.precioOferta
            : p.precioActual;

          // porcentaje de descuento (si hay oferta y precioOferta < precioActual)
          let descuentoPorc = 0;
          if (
            tienePrecioOferta &&
            typeof p.precioActual === "number" &&
            p.precioActual > 0 &&
            p.precioOferta < p.precioActual
          ) {
            descuentoPorc = Math.round(
              (1 - p.precioOferta / p.precioActual) * 100
            );
          }

          return {
            id: p.idProducto,
            nombre: p.nombre,
            categoriaTag: p.nombreCategoriaProducto ?? "Sin categoría",
            stand: p.nombreComercialStand
              ? `${p.nombreComercialStand} · Bloque ${p.bloqueStand}, Puesto ${p.numeroStand}`
              : "Stand no asignado",
            precio: precioFinal,
            unidad: p.unidadMedida ?? "unidad",
            moneda: "S/.",

            esOferta: enOferta,
            descuentoPorc,

            imageUrl:
              p.imagenUrl ??
              "https://via.placeholder.com/400x300?text=Sin+imagen",
          };
        });

        setProducts(mapped);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos desde el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  // ===== ofertas del día (solo las que tienen esOferta) =====
  const offers = useMemo(() => products.filter((p) => p.esOferta), [products]);

  // ===== lógica de filtrado + orden =====
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Buscar por texto
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.categoriaTag.toLowerCase().includes(q) ||
          p.stand.toLowerCase().includes(q)
      );
    }

    // Filtrar por categoría
    if (category !== "todos") {
      const categoriaTexto = CATEGORY_MAP[category];
      if (categoriaTexto) {
        list = list.filter((p) => p.categoriaTag === categoriaTexto);
      }
    }

    // Filtrar por rango de precio
    if (priceRange !== "todos") {
      if (priceRange === "0-10") {
        list = list.filter((p) => p.precio >= 0 && p.precio <= 10);
      } else if (priceRange === "10-50") {
        list = list.filter((p) => p.precio > 10 && p.precio <= 50);
      } else if (priceRange === "50-100") {
        list = list.filter((p) => p.precio > 50 && p.precio <= 100);
      } else if (priceRange === "100+") {
        list = list.filter((p) => p.precio > 100);
      }
    }

    // Filtro especial: sólo ofertas
    if (sortBy === "ofertas") {
      list = list.filter((p) => p.esOferta);
    }

    // Ordenar
    if (sortBy === "precio-asc") {
      list = list.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === "precio-desc") {
      list = list.sort((a, b) => b.precio - a.precio);
    }

    return list;
  }, [products, search, category, priceRange, sortBy]);

  // ===== acciones =====
  const handleViewStand = (product: StoreProduct) => {
    console.log("Ir al producto:", product.nombre);
    // aquí luego haces navigate(`/producto/${product.id}`)
  };

  const handleViewAllOffers = () => {
    setSortBy("ofertas");
  };

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

      <Box sx={{ flex: 1, py: 5 }}>
        <Container maxWidth="lg">
          <Stack spacing={5}>
            {/* CABECERA */}
            <Box>
              <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
                <MuiLink
                  underline="hover"
                  color="inherit"
                  href="/"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Inicio
                </MuiLink>
                <Typography color="text.primary" fontWeight={500}>
                  Precios y productos
                </Typography>
              </Breadcrumbs>

              <Typography
                variant="h3"
                sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.02em" }}
              >
                Precios y Productos
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 700 }}
              >
                Consulta los productos frescos ofrecidos diariamente por los
                comerciantes del mercado. Precios actualizados en tiempo real.
              </Typography>
            </Box>

            {/* BARRA DE FILTROS */}
            <Box>
              <ProductFiltersBar
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                sortBy={sortBy}
                onSortByChange={setSortBy}
              />
            </Box>

            {/* LOADING / ERROR */}
            {loading && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <CircularProgress />
                <Typography
                  variant="body2"
                  sx={{ mt: 2 }}
                  color="text.secondary"
                >
                  Cargando productos...
                </Typography>
              </Box>
            )}

            {error && !loading && <Alert severity="error">{error}</Alert>}

            {/* SOLO renderizamos el resto si no está cargando */}
            {!loading && !error && (
              <>
                {/* OFERTAS DEL DÍA */}
                {offers.length > 0 && !search && category === "todos" && (
                  <Box>
                    <OffersStrip
                      offers={offers}
                      onViewStand={handleViewStand}
                      onViewAll={handleViewAllOffers}
                    />
                  </Box>
                )}

                {/* BANNER COMPARADOR */}
                <Box>
                  <PriceComparatorBanner
                    onClick={() => console.log("Abrir comparador de precios")}
                  />
                </Box>

                {/* GRID PRINCIPAL */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Todos los productos
                    </Typography>
                    <Divider
                      flexItem
                      orientation="vertical"
                      sx={{ height: 24, alignSelf: "center" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {filteredProducts.length} resultados encontrados
                    </Typography>
                  </Stack>

                  {filteredProducts.length > 0 ? (
                    <ProductsGrid
                      products={filteredProducts}
                      onViewStand={handleViewStand}
                    />
                  ) : (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Typography variant="h6" color="text.secondary">
                        No encontramos productos con esos filtros.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Intenta buscar con otros términos o limpia los filtros.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
