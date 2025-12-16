// src/components/ProductCard.tsx
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";

interface ProductCardProps {
  nombre: string;
  categoria: string;
  precio: number;
  precioOferta?: number;
  enOferta?: boolean;
  onVerDetalle?: () => void;
  onFav?: () => void;
}

export default function ProductCard({
  nombre,
  categoria,
  precio,
  precioOferta,
  enOferta = false,
  onVerDetalle,
  onFav,
}: ProductCardProps) {
  const muestraPrecioOferta = enOferta && precioOferta && precioOferta < precio;

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={1}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Categoría / etiqueta */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {categoria}
          </Typography>
          {enOferta && (
            <Chip
              label="Oferta"
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>

        {/* Nombre */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {nombre}
        </Typography>

        {/* Precio */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          {muestraPrecioOferta ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                S/. {precio.toFixed(2)}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                S/. {precioOferta!.toFixed(2)}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              S/. {precio.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button size="small" onClick={onVerDetalle}>
          Ver detalle
        </Button>
        <Button size="small" onClick={onFav}>
          ★ Favorito
        </Button>
      </CardActions>
    </Card>
  );
}
