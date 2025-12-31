import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import type { StoreProduct } from "./product/ProductsGrid";

interface OffersStripProps {
  offers: StoreProduct[];
  onViewStand?: (product: StoreProduct) => void;
  onViewAll?: () => void;
}

function formatPrecio(precio: number, moneda: string = "S/."): string {
  return `${moneda} ${precio.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const FALLBACK_IMG = "https://via.placeholder.com/800x600?text=Sin+imagen";

export default function OffersStrip({
  offers,
  onViewStand,
  onViewAll,
}: OffersStripProps) {
  if (!offers.length) return null;

  return (
    <Box sx={{ mb: 5 }}>
      {/* Título + "Ver todas" */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Ofertas del día
        </Typography>

        <Button
          size="small"
          onClick={onViewAll}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          Ver todas
        </Button>
      </Box>

      {/* --- GRID DE PRODUCTOS (CSS Grid) --- */}
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
        {offers.map((product) => {
          const img = product.imageUrl?.trim() ? product.imageUrl.trim() : "";

          return (
            <Paper
              key={product.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                p: 0, 
                bgcolor: "#ffffff",
                overflow: "hidden",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              {/* IMAGEN */}
              <Box
                sx={{
                  width: "100%",
                  height: 150,
                  backgroundImage: `url(${img || FALLBACK_IMG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                {/* Badge oferta arriba (no rompe tu lógica) */}
                <Chip
                  size="small"
                  label={
                    product.descuentoPorc ? `-${product.descuentoPorc}%` : "Oferta"
                  }
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    bgcolor: "rgba(254,226,226,0.95)",
                    color: "#b91c1c",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    height: "24px",
                    backdropFilter: "blur(6px)",
                  }}
                />
              </Box>

              {/* CONTENIDO */}
              <Box
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.2,
                  height: "100%",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {product.nombre}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {product.stand}
                </Typography>

                {/* Tags (Categoría) */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={product.categoriaTag}
                    sx={{
                      bgcolor: "#ecfdf3",
                      color: "#166534",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      height: "24px",
                    }}
                  />
                </Box>

                {/* Precio */}
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "success.main" }}
                    >
                      {formatPrecio(product.precio, product.moneda)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / {product.unidad}
                    </Typography>
                  </Box>
                </Box>

                {/* Botón inferior */}
                <Box sx={{ mt: "auto", pt: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    color="success"
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                    onClick={() => onViewStand && onViewStand(product)}
                  >
                    Ver Detalles
                  </Button>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}