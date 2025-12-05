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
        // Definición de columnas responsivas (equivalente a tu antiguo Grid xs, sm, md, lg)
        gridTemplateColumns: {
          xs: "1fr", // xs={12} -> 1 columna
          sm: "repeat(2, 1fr)", // sm={6}  -> 2 columnas
          md: "repeat(3, 1fr)", // md={4}  -> 3 columnas
          lg: "repeat(4, 1fr)", // lg={3}  -> 4 columnas
        },
        gap: 3, // Espaciado entre tarjetas
      }}
    >
      {products.map((p) => (
        <Card
          key={p.id}
          elevation={1} // Puedes ajustar la elevación base aquí
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%", // Asegura que ocupe toda la altura de la celda del grid
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
          {/* 🔹 CABECERA CON IMAGEN */}
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

          {/* CONTENIDO (Flex grow para empujar el botón al fondo) */}
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
                variant="outlined" // Variante outlined para que no sea tan pesado visualmente
                sx={{ fontWeight: 700, height: 24, border: "1px solid" }}
              />
            )}
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => onViewStand(p)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Ver stand
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
