import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import type { StoreProduct } from "../store/ProductsGrid"; // Asegúrate de que esta ruta sea correcta

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
          // Definimos las columnas responsivas
          gridTemplateColumns: {
            xs: "1fr", // 1 columna en móvil
            sm: "repeat(2, 1fr)", // 2 columnas en tablet
            md: "repeat(4, 1fr)", // 4 columnas en escritorio
          },
          gap: 3, // Espacio entre tarjetas (equivalente a spacing={3} de Grid)
        }}
      >
        {offers.map((product) => (
          <Paper
            key={product.id}
            elevation={0} // O elevation={1} según prefieras
            sx={{
              borderRadius: 3,
              p: 2.5,
              bgcolor: "#ffffff",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              height: "100%", // Importante: esto hace que todas las tarjetas tengan la misma altura visual
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            {/* Contenido de la tarjeta */}

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {product.nombre}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {product.stand}
            </Typography>

            {/* Tags (Categoría y Oferta) */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
              <Chip
                size="small"
                label={product.categoriaTag}
                sx={{
                  bgcolor: "#ecfdf3",
                  color: "#166534",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: "24px",
                }}
              />
              <Chip
                size="small"
                label={
                  product.descuentoPorc
                    ? `-${product.descuentoPorc}%`
                    : "Oferta"
                }
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 600,
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

            {/* Botón inferior (empujado al fondo con mt: auto) */}
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
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
