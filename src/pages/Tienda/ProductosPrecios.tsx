import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

import ProductFiltersBar from "../../components/shared/ProductFiltersBar";
import OffersStrip from "../../components/layout/store/OffersStrip";
import PriceComparatorBanner from "../../components/layout/store/PriceComparatorBanner";
import ProductsGrid, {
  StoreProduct,
} from "../../components/layout/store/ProductsGrid";
// ================== DATOS DE EJEMPLO ==================
const ALL_PRODUCTS: StoreProduct[] = [
  {
    id: 1,
    nombre: "Mango Tommy",
    categoriaTag: "Frutas",
    stand: "Frutas del Sol · Bloque A, Puesto 15",
    precio: 2.1,
    unidad: "kg",
    moneda: "S/.",
    esOferta: true,
    descuentoPorc: 20,
    imageUrl:
      "https://th.bing.com/th/id/R.b9a9572162d4f39da9ba36e0528585aa?rik=Hz%2bbf9D8xsvNag&pid=ImgRaw&r=0",
  },
  {
    id: 2,
    nombre: "Papa Pastusa",
    categoriaTag: "Verduras",
    stand: "Tubérculos Andinos · Bloque C, Puesto 11",
    precio: 0.8,
    unidad: "kg",
    moneda: "S/.",
  },
  {
    id: 3,
    nombre: "Queso Campesino",
    categoriaTag: "Lácteos",
    stand: "Lácteos del Valle · Bloque D, Puesto 05",
    precio: 12.5,
    unidad: "kg",
    moneda: "S/.",
    esOferta: true,
    descuentoPorc: 15,
  },
  {
    id: 4,
    nombre: "Costilla de Res",
    categoriaTag: "Carnes",
    stand: "Carnes El Ganadero · Bloque D, Puesto 18",
    precio: 18.0,
    unidad: "kg",
    moneda: "S/.",
  },
  {
    id: 5,
    nombre: "Lechuga Crespa",
    categoriaTag: "Verduras",
    stand: "Hortalizas Frescas · Bloque B, Puesto 01",
    precio: 1.5,
    unidad: "unidad",
    moneda: "S/.",
  },
  {
    id: 6,
    nombre: "Aguacate Hass",
    categoriaTag: "Frutas",
    stand: "Frutas del Sol · Bloque A, Puesto 25",
    precio: 3.5,
    unidad: "kg",
    moneda: "S/.",
  },
  {
    id: 7,
    nombre: "Huevo AA x30",
    categoriaTag: "Aves",
    stand: "Avícola Central · Bloque D, Puesto 02",
    precio: 15.0,
    unidad: "bandeja",
    moneda: "S/.",
  },
  {
    id: 8,
    nombre: "Zanahoria",
    categoriaTag: "Verduras",
    stand: "Verduras La Finca · Bloque C, Puesto 21",
    precio: 1.1,
    unidad: "kg",
    moneda: "S/.",
  },
];

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

  // ===== ofertas del día (solo las que tienen esOferta) =====
  const offers = useMemo(() => ALL_PRODUCTS.filter((p) => p.esOferta), []);

  // ===== lógica de filtrado + orden =====
  const filteredProducts = useMemo(() => {
    let list = [...ALL_PRODUCTS];

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
  }, [search, category, priceRange, sortBy]);

  // ===== acciones =====
  const handleViewStand = (product: StoreProduct) => {
    // Más adelante aquí puedes navegar a la página pública del stand
    // por ahora solo log:
    console.log("Ir al stand de:", product.stand);
  };

  const handleViewAllOffers = () => {
    // Al hacer clic en "Ver todas" en Ofertas del día
    setSortBy("ofertas");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <PublicHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Migas de pan (opcional) */}
        <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
          <MuiLink underline="hover" color="inherit" href="/">
            Inicio
          </MuiLink>
          <Typography color="text.primary">Precios y productos</Typography>
        </Breadcrumbs>

        {/* Título y descripción */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Precios y Productos del Mercado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta los productos frescos ofrecidos diariamente por los
            comerciantes del mercado.
          </Typography>
        </Box>

        {/* Filtros superiores */}
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

        {/* Ofertas del día */}
        <OffersStrip
          offers={offers}
          onViewStand={handleViewStand}
          onViewAll={handleViewAllOffers}
        />

        {/* Banner comparador de precios */}
        <PriceComparatorBanner
          onClick={() => console.log("Abrir comparador de precios (futuro)")}
        />

        {/* Todos los productos */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Todos los productos
          </Typography>
        </Box>

        <ProductsGrid
          products={filteredProducts}
          onViewStand={handleViewStand}
        />
      </Container>

      <PublicFooter />
    </Box>
  );
}
