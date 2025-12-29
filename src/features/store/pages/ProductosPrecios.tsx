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
  Grow,
} from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TuneIcon from "@mui/icons-material/Tune";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import ProductFiltersBar from "../../../components/shared/ProductFiltersBar";
import OffersStrip from "../../../features/store/components/OffersStrip";
import PriceComparatorBanner from "../../../features/store/components/PriceComparatorBanner";
import ProductsGrid, {
  StoreProduct,
} from "../../../features/store/components/product/ProductsGrid";

const API_URL = "http://localhost:8080/api/public/productos/buscar";

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
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { initialCategory?: string };
  };

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");
  const [priceRange, setPriceRange] = useState("todos");
  const [sortBy, setSortBy] = useState("relevancia");

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.initialCategory) {
      setCategory(location.state.initialCategory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(API_URL, {
          params: {
            nombre: search || undefined,
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

  const offers = useMemo(() => products.filter((p) => p.esOferta), [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (category !== "todos") {
      const categoriaTexto = CATEGORY_MAP[category];
      if (categoriaTexto) {
        list = list.filter((p) => p.categoriaTag === categoriaTexto);
      }
    }

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

    if (sortBy === "ofertas") {
      list = list.filter((p) => p.esOferta);
    }

    if (sortBy === "precio-asc") {
      list = list.sort((a, b) => a.precio - b.precio);
    } else if (sortBy === "precio-desc") {
      list = list.sort((a, b) => b.precio - a.precio);
    }

    return list;
  }, [products, category, priceRange, sortBy]);

  const handleViewStand = (product: StoreProduct) => {
    navigate(`/tienda/producto/${product.id}`);
  };

  const handleViewAllOffers = () => {
    setSortBy("ofertas");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== "todos") count++;
    if (priceRange !== "todos") count++;
    if (sortBy !== "relevancia") count++;
    return count;
  }, [category, priceRange, sortBy]);

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

      <Box
        sx={{
          flex: 1,
          py: 5,
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.04) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            {/* CABECERA MEJORADA */}
            <Grow in timeout={500}>
              <Box>
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  sx={{ mb: 2 }}
                  aria-label="breadcrumb"
                >
                  <MuiLink
                    underline="hover"
                    color="inherit"
                    href="/tienda"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                      transition: "color 0.2s ease",
                      "&:hover": { color: "#16a34a" },
                    }}
                  >
                    Inicio
                  </MuiLink>
                  <Typography color="text.primary" fontWeight={700}>
                    Directorio de precios
                  </Typography>
                </Breadcrumbs>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  mb={2}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 20px rgba(34,197,94,0.3)",
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 28, color: "white" }} />
                  </Box>

                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        letterSpacing: "0.15em",
                        color: "#16a34a",
                        fontWeight: 800,
                        fontSize: 11,
                        display: "block",
                      }}
                    >
                      Explorar catálogo
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        fontSize: { xs: "2rem", sm: "2.5rem" },
                      }}
                    >
                      Precios y productos
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#64748b",
                    maxWidth: 720,
                    lineHeight: 1.6,
                  }}
                >
                  Explora los productos ofrecidos por los stands del mercado,
                  filtra por categoría y rango de precios, y encuentra las mejores
                  ofertas disponibles para hoy.
                </Typography>
              </Box>
            </Grow>

            {/* CONTENEDOR PRINCIPAL */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 5,
                bgcolor: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Stack spacing={0}>
                {/* HEADER CON FILTROS */}
                <Box
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    mb={2.5}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                      }}
                    >
                      <TuneIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={900}>
                      Filtrar productos
                    </Typography>
                    {activeFiltersCount > 0 && (
                      <Chip
                        label={`${activeFiltersCount} ${
                          activeFiltersCount === 1 ? "filtro" : "filtros"
                        }`}
                        size="small"
                        sx={{
                          bgcolor: "#22c55e",
                          color: "white",
                          fontWeight: 700,
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </Stack>

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

                  {/* Chips de filtros activos */}
                  <Stack
                    direction="row"
                    spacing={1}
                    mt={2}
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    {category !== "todos" && (
                      <Chip
                        size="small"
                        label={`📁 ${CATEGORY_MAP[category] ?? category}`}
                        onDelete={() => setCategory("todos")}
                        sx={{
                          bgcolor: "#dcfce7",
                          color: "#166534",
                          fontWeight: 700,
                          borderRadius: "8px",
                        }}
                      />
                    )}
                    {priceRange !== "todos" && (
                      <Chip
                        size="small"
                        label={`💰 ${priceRange}`}
                        onDelete={() => setPriceRange("todos")}
                        sx={{
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                          fontWeight: 700,
                          borderRadius: "8px",
                        }}
                      />
                    )}
                    {sortBy !== "relevancia" && (
                      <Chip
                        size="small"
                        label={`🔄 ${sortBy}`}
                        onDelete={() => setSortBy("relevancia")}
                        sx={{
                          bgcolor: "#dbeafe",
                          color: "#1e40af",
                          fontWeight: 700,
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* CONTENIDO */}
                <Box sx={{ p: 4 }}>
                  {loading && (
                    <Fade in>
                      <Box sx={{ py: 8, textAlign: "center" }}>
                        <CircularProgress size={48} sx={{ color: "#22c55e" }} />
                        <Typography
                          variant="body1"
                          sx={{ mt: 2, fontWeight: 600 }}
                          color="text.secondary"
                        >
                          Cargando productos...
                        </Typography>
                      </Box>
                    </Fade>
                  )}

                  {error && !loading && (
                    <Fade in>
                      <Alert severity="error" sx={{ borderRadius: 3 }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {!loading && !error && (
                    <Stack spacing={4}>
                      {/* OFERTAS DEL DÍA */}
                      {offers.length > 0 && category === "todos" && (
                        <Grow in timeout={600}>
                          <Box>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                              mb={2.5}
                            >
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#f59e0b",
                                }}
                              >
                                <LocalOfferIcon />
                              </Box>
                              <Typography variant="h6" fontWeight={900}>
                                Ofertas del día
                              </Typography>
                              <Chip
                                label={`${offers.length} disponibles`}
                                size="small"
                                sx={{
                                  bgcolor: "#fef3c7",
                                  color: "#92400e",
                                  fontWeight: 700,
                                  borderRadius: "8px",
                                }}
                              />
                            </Stack>
                            <OffersStrip
                              offers={offers}
                              onViewStand={handleViewStand}
                              onViewAll={handleViewAllOffers}
                            />
                          </Box>
                        </Grow>
                      )}

                      {/* BANNER COMPARADOR */}
                      <Grow in timeout={700}>
                        <Box>
                          <PriceComparatorBanner
                            onClick={() =>
                              console.log("Abrir comparador de precios público")
                            }
                          />
                        </Box>
                      </Grow>

                      {/* GRID PRINCIPAL */}
                      <Grow in timeout={800}>
                        <Box>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              mb: 3,
                              borderRadius: 3,
                              border: "1px solid #f3f4f6",
                              bgcolor: "#fafafa",
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              flexWrap="wrap"
                            >
                              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                Productos disponibles
                              </Typography>
                              <Divider
                                flexItem
                                orientation="vertical"
                                sx={{ height: 28, alignSelf: "center" }}
                              />
                              <Chip
                                label={`${filteredProducts.length} ${
                                  filteredProducts.length === 1
                                    ? "resultado"
                                    : "resultados"
                                }`}
                                sx={{
                                  bgcolor: "#ffffff",
                                  border: "1px solid #e5e7eb",
                                  fontWeight: 800,
                                  borderRadius: "8px",
                                }}
                              />
                            </Stack>
                          </Paper>

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
                                borderRadius: 4,
                                border: "2px dashed #cbd5e1",
                                bgcolor: "#f8fafc",
                              }}
                            >
                              <SearchIcon
                                sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight={900}
                                mb={1}
                              >
                                No encontramos productos
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ maxWidth: 400, mx: "auto" }}
                              >
                                Intenta buscar con otros términos o limpia los
                                filtros para ver todos los productos disponibles.
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Grow>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}