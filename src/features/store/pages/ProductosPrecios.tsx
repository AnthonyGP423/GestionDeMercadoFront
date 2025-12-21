// src/pages/Store/PreciosProductos.tsx
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
  Fade,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// Iconos
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

// Componentes internos
import ProductFiltersBar from "../../../components/shared/ProductFiltersBar";
import OffersStrip from "../../../features/store/components/OffersStrip";
import PriceComparatorBanner from "../../../features/store/components/PriceComparatorBanner";
import ProductsGrid, {
  StoreProduct,
} from "../../../features/store/components/product/ProductsGrid";

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
  empacados: "Empacados",
  otros: "Otros",
};

export default function PreciosProductos() {
  // ===== router =====
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { initialCategory?: string };
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ===== estados de filtros =====
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");
  const [priceRange, setPriceRange] = useState("todos");
  const [sortBy, setSortBy] = useState("relevancia");

  // ===== estados de datos API =====
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Si llegas desde otra vista con categoría inicial (Home)
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

        const response = await axios.get(API_URL, {
          params: {
            nombre: search || undefined, // si no hay búsqueda, no se envía
            page: 0,
            size: 200,
          },
          headers: {
            Accept: "*/*",
          },
        });

        const data = response.data;
        const content = (data?.content ?? []) as any[];

        const mapped: StoreProduct[] = content.map((p: any) => {
          const enOferta = p.enOferta === true;
          const tienePrecioOferta =
            enOferta && p.precioOferta !== null && p.precioOferta !== undefined;

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

    fetchProducts();
  }, [search]);

  // ===== ofertas del día (solo las que tienen esOferta) =====
  const offers = useMemo(() => products.filter((p) => p.esOferta), [products]);

  // ===== lógica de filtrado + orden (sobre lo que trae el backend) =====
  const filteredProducts = useMemo(() => {
    let list = [...products];

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
  }, [products, category, priceRange, sortBy]);

  // ===== acciones =====
  const handleViewStand = (product: StoreProduct) => {
    // aquí ya vas al detalle del producto
    navigate(`/tienda/producto/${product.id}`);
  };

  const handleViewAllOffers = () => {
    setSortBy("ofertas");
  };

  const handleClearFilters = () => {
    setCategory("todos");
    setPriceRange("todos");
    setSortBy("relevancia");
    setSearch("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 50%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      {/* HERO SECTION */}
      <Box
        sx={{
          pt: { xs: 4, md: 6 },
          pb: { xs: 2, md: 4 },
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="lg">
          {/* BREADCRUMBS */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <MuiLink
              underline="hover"
              color="inherit"
              href="/tienda"
              sx={{ display: "flex", alignItems: "center", fontWeight: 500 }}
            >
              Inicio
            </MuiLink>
            <Typography color="text.primary" fontWeight={700}>
              Directorio de precios
            </Typography>
          </Breadcrumbs>

          <Box mb={4} textAlign={{ xs: "center", md: "left" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                mb: 1,
                fontSize: { xs: "2rem", md: "2.75rem" },
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}
            >
              Precios y Productos
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              maxWidth={700}
              sx={{ mx: { xs: "auto", md: 0 }, fontSize: "1.1rem" }}
            >
              Consulta los precios actualizados del día, filtra por categorías y
              encuentra las mejores ofertas de nuestros comerciantes.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Container maxWidth="lg" sx={{ pb: 8, flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          }}
        >
          <Stack spacing={4}>
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
                mt={2}
                flexWrap="wrap"
                alignItems="center"
                useFlexGap
              >
                <Stack direction="row" alignItems="center" spacing={0.5} mr={1}>
                  <FilterListIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Filtros:
                  </Typography>
                </Stack>

                {category !== "todos" && (
                  <Chip
                    size="small"
                    label={`Categoría: ${CATEGORY_MAP[category] ?? category}`}
                    onDelete={() => setCategory("todos")}
                    sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                  />
                )}
                {priceRange !== "todos" && (
                  <Chip
                    size="small"
                    label={`Precio: ${priceRange}`}
                    onDelete={() => setPriceRange("todos")}
                    sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                  />
                )}
                {sortBy !== "relevancia" && (
                  <Chip
                    size="small"
                    label={`Orden: ${sortBy}`}
                    onDelete={() => setSortBy("relevancia")}
                    sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                  />
                )}

                {(category !== "todos" ||
                  priceRange !== "todos" ||
                  sortBy !== "relevancia" ||
                  search) && (
                  <Button
                    size="small"
                    startIcon={<ClearAllIcon />}
                    onClick={handleClearFilters}
                    sx={{ textTransform: "none", color: "#64748b" }}
                  >
                    Limpiar todo
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            {/* LOADING / ERROR / CONTENIDO */}
            {loading ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress size={40} sx={{ color: "#22c55e" }} />
                <Typography
                  variant="body2"
                  sx={{ mt: 2, fontWeight: 600 }}
                  color="text.secondary"
                >
                  Buscando los mejores precios...
                </Typography>
              </Box>
            ) : error ? (
              <Fade in>
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {error}
                </Alert>
              </Fade>
            ) : (
              <>
                {/* OFERTAS DEL DÍA */}
                {offers.length > 0 && category === "todos" && !search && (
                  <Box>
                    <OffersStrip
                      offers={offers}
                      onViewStand={handleViewStand}
                      onViewAll={handleViewAllOffers}
                    />
                    <Divider sx={{ my: 4, borderColor: "#f1f5f9" }} />
                  </Box>
                )}

                {/* BANNER COMPARADOR */}
                <Box mb={4}>
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
                    justifyContent="space-between"
                    mb={3}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Productos Disponibles
                    </Typography>
                    <Chip
                      label={`${filteredProducts.length} resultados`}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>

                  {filteredProducts.length > 0 ? (
                    <ProductsGrid
                      products={filteredProducts}
                      onViewStand={handleViewStand}
                    />
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        py: 8,
                        textAlign: "center",
                        bgcolor: "#f8fafc",
                        borderRadius: 4,
                        border: "2px dashed #e2e8f0",
                      }}
                    >
                      <SearchOffIcon
                        sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        No encontramos productos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Intenta cambiar los filtros o busca con otro término.
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={handleClearFilters}
                        sx={{ mt: 3, borderRadius: 3, textTransform: "none" }}
                      >
                        Ver todos los productos
                      </Button>
                    </Paper>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </Paper>
      </Container>

      <PublicFooter />
    </Box>
  );
}
