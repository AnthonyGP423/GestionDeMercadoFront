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
  Paper,
  Chip,
} from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

// Componentes internos
import ProductFiltersBar from "../../components/shared/ProductFiltersBar";
import OffersStrip from "../../components/layout/store/OffersStrip";
import PriceComparatorBanner from "../../components/layout/store/PriceComparatorBanner";
import ProductsGrid, {
  StoreProduct,
} from "../../components/layout/store/ProductsGrid";

// ================== CONFIG API PUBLICA ==================
const API_URL = "http://localhost:8080/api/public/productos/buscar";

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

  const location = useLocation() as {
    state?: { initialCategory?: string };
  };

  // ===== estados de datos API =====
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Si llegas desde otra vista con categoría inicial
  useEffect(() => {
    if (location.state?.initialCategory) {
      setCategory(location.state.initialCategory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.state]);

  // ================== FETCH A SPRING BOOT (ENDPOINT PÚBLICO) ==================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Llamamos al endpoint público usando el parámetro "nombre" para la búsqueda
        const response = await axios.get(API_URL, {
          params: {
            nombre: search || undefined, // si no hay búsqueda, no se envía
            page: 0,
            size: 200, // puedes ajustar este tamaño según la cantidad esperada
          },
          headers: {
            Accept: "*/*",
          },
        });

        // La respuesta es paginada: { content: [...] , totalPages, ... }
        const data = response.data;
        const content = (data?.content ?? []) as any[];

        const mapped: StoreProduct[] = content.map((p: any) => {
          const enOferta = p.enOferta === true;
          const tienePrecioOferta =
            enOferta && p.precioOferta !== null && p.precioOferta !== undefined;

          // precio a mostrar (si hay oferta, mostramos precioOferta; si no, precioActual)
          const precioFinal = tienePrecioOferta
            ? p.precioOferta
            : p.precioActual;

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
            nombre: p.nombreProducto,
            categoriaTag: p.categoriaProducto ?? "Sin categoría",
            stand: p.nombreStand
              ? `${p.nombreStand} · Bloque ${p.bloque}, Puesto ${p.numeroStand}`
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
        setError(
          "No se pudieron cargar los productos públicos desde el servidor."
        );
      } finally {
        setLoading(false);
      }
    };

    // Cada vez que cambia la búsqueda, consultamos al backend público
    fetchProducts();
  }, [search]);

  // ===== ofertas del día (solo las que tienen esOferta) =====
  const offers = useMemo(() => products.filter((p) => p.esOferta), [products]);

  // ===== lógica de filtrado + orden (sobre lo que trae el backend) =====
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filtrar por categoría (a nivel de nombre de categoría pública)
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

    // "relevancia" deja el orden tal como viene del backend
    return list;
  }, [products, category, priceRange, sortBy]);

  // ===== acciones =====
  const handleViewStand = (product: StoreProduct) => {
    console.log("Ir al producto:", product.nombre);
    // aquí luego puedes hacer: navigate(`/tienda/producto/${product.id}`)
  };

  const handleViewAllOffers = () => {
    setSortBy("ofertas");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          "linear-gradient(180deg, #f1f5f9 0%, #f8fafc 40%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      <Box sx={{ flex: 1, py: 5 }}>
        <Container maxWidth="lg">
          <Stack spacing={4}>
            {/* CABECERA */}
            <Box>
              <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
                <MuiLink
                  underline="hover"
                  color="inherit"
                  href="/tienda"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Inicio
                </MuiLink>
                <Typography color="text.primary" fontWeight={500}>
                  Directorio de precios
                </Typography>
              </Breadcrumbs>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                Precios y productos del mercado
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 720 }}
              >
                Explora los productos ofrecidos por los stands del mercado,
                filtra por categoría y rango de precios, y encuentra las mejores
                ofertas disponibles para hoy.
              </Typography>
            </Box>

            {/* CONTENEDOR PRINCIPAL */}
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Stack spacing={3}>
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

                  {/* Resumen de filtros activos */}
                  <Stack
                    direction="row"
                    spacing={1}
                    mt={1.5}
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      Filtros activos:
                    </Typography>
                    {category !== "todos" && (
                      <Chip
                        size="small"
                        label={`Categoría: ${
                          CATEGORY_MAP[category] ?? category
                        }`}
                      />
                    )}
                    {priceRange !== "todos" && (
                      <Chip size="small" label={`Precio: ${priceRange}`} />
                    )}
                    {sortBy !== "relevancia" && (
                      <Chip size="small" label={`Orden: ${sortBy}`} />
                    )}
                    {category === "todos" &&
                      priceRange === "todos" &&
                      sortBy === "relevancia" && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Sin filtros"
                        />
                      )}
                  </Stack>
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
                      Cargando productos públicos...
                    </Typography>
                  </Box>
                )}

                {error && !loading && <Alert severity="error">{error}</Alert>}

                {/* CONTENIDO SOLO SI NO HAY ERROR NI LOADING */}
                {!loading && !error && (
                  <>
                    {/* OFERTAS DEL DÍA */}
                    {offers.length > 0 && category === "todos" && (
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
                        onClick={() =>
                          console.log("Abrir comparador de precios público")
                        }
                      />
                    </Box>

                    {/* GRID PRINCIPAL */}
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Productos disponibles
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
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography variant="h6" color="text.secondary">
                            No encontramos productos con esos filtros.
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Intenta buscar con otros términos o limpia los
                            filtros para ver todos los productos disponibles.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
