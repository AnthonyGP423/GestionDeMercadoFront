import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
} from "@mui/material";

export interface StoreProduct {
  id: number;
  nombre: string;
  categoriaTag: string;
  stand: string;
  precio: number;
  unidad: string;
  moneda?: string;
  esOferta?: boolean;
  descuentoPorc?: number;
  imageUrl?: string;
}

interface ProductsGridProps {
  products: StoreProduct[];
  onViewStand: (product: StoreProduct) => void;
}

export default function ProductsGrid({
  products,
  onViewStand,
}: ProductsGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
      }}
    >
      {products.map((p) => (
        <Card
          key={p.id}
          elevation={1}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            bgcolor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
            transition: "all 0.2s ease-out",
            "&:hover": {
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              transform: "translateY(-4px)",
            },
          }}
        >
          {/* IMAGEN */}
          <Box
            sx={{
              width: "100%",
              height: 160,
              backgroundImage: p.imageUrl
                ? `url(${p.imageUrl})`
                : "linear-gradient(135deg,#22c55e,#16a34a)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* CONTENIDO */}
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}
            >
              {p.nombre}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {p.stand}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "success.main" }}
              >
                {p.moneda ?? "S/."} {p.precio.toFixed(2)}{" "}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 400 }}
                >
                  / {p.unidad}
                </Typography>
              </Typography>

              <Chip
                label={p.categoriaTag}
                size="small"
                sx={{ fontWeight: 600, height: 24 }}
              />
            </Box>

            {p.esOferta && (
              <Chip
                label={
                  p.descuentoPorc ? `-${p.descuentoPorc}% oferta` : "En oferta"
                }
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontWeight: 700, height: 24, border: "1px solid" }}
              />
            )}
          </CardContent>

          {/* BOTÓN */}
          <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => onViewStand(p)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Ver Detalles
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
