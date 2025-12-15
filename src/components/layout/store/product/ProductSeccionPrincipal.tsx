import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Rating,
  Avatar,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import StorefrontTwoToneIcon from "@mui/icons-material/StorefrontTwoTone";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { useNavigate } from "react-router-dom"; // 👈 NUEVO

// 🔹 Este tipo es el que deberías construir en VistaProducto a partir de la API
interface Producto {
  id: number;
  nombre: string;
  imagen: string;

  // puede que la API no traiga descripción, así que la dejamos opcional
  descripcionCorta?: string;

  // viene de categoriaProducto en la API
  categoria: string;

  // precio final que vas a mostrar (si hay oferta: precioOferta, si no: precioActual)
  precio: number;

  // precio original de la API (precioActual) para mostrar tachado si hay oferta
  precioOriginal?: number;

  // indica si el producto está en oferta
  enOferta?: boolean;

  unidad: string;

  // rating no viene de la API pública, así que opcional con fallback
  rating?: number;
  totalValoraciones?: number;

  standPrincipal: {
    id?: number; // 👈 IMPORTANTE
    nombre: string;
    bloque: string; // stand.bloque
    numero: string; // "Puesto X"
    propietario?: string; // si algún día lo agregas en la API
  };
}

interface Props {
  producto: Producto;
}

export default function ProductMainSection({ producto }: Props) {
  const theme = useTheme();
  const navigate = useNavigate(); // 👈 NUEVO
  const rating = producto.rating ?? 0;
  const totalValoraciones = producto.totalValoraciones ?? 0;

  const hayOferta =
    producto.enOferta &&
    producto.precioOriginal !== undefined &&
    producto.precioOriginal > producto.precio;
  const VisitarStand = () => {
    if (!producto.standPrincipal.id) {
      console.warn("No se puede visitar el stand: ID no disponible.");
      return;
    }
    navigate(`/tienda/stand/${producto.standPrincipal.id}`);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 4, md: 6 },
        alignItems: "flex-start",
        mb: 8,
      }}
    >
      {/* Imagen */}
      <Box sx={{ flex: { xs: 1, md: 6 }, width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: "100%",
              aspectRatio: { xs: "4/3", md: "1 / 1" },
              backgroundImage: `url(${producto.imagen})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.03)",
              },
            }}
          />
        </Paper>
      </Box>

      {/* Info */}
      <Box sx={{ flex: { xs: 1, md: 6 }, width: "100%", pt: { md: 2 } }}>
        <Stack spacing={2.5}>
          {/* categoría + rating */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Chip
              label={producto.categoria}
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.dark",
                fontWeight: 700,
                fontSize: "0.85rem",
                height: 28,
              }}
            />

            {rating > 0 && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  bgcolor: "#fff",
                  py: 0.5,
                  px: 1.5,
                  borderRadius: 99,
                  border: "1px solid #eee",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {rating.toFixed(1)}
                </Typography>
                <Rating
                  value={rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ color: "#fbbf24" }}
                />
                <Typography variant="caption" color="text.secondary">
                  ({totalValoraciones})
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* título */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {producto.nombre}
          </Typography>

          {/* descripción (opcional) */}
          {producto.descripcionCorta && (
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.7,
                fontSize: "1.05rem",
              }}
            >
              {producto.descripcionCorta}
            </Typography>
          )}

          {/* precio */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.5}
              fontWeight={500}
            >
              Precio actual
            </Typography>

            <Stack direction="row" spacing={2} alignItems="baseline">
              {/* Si hay oferta, mostramos precio original tachado */}
              {hayOferta && producto.precioOriginal && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    textDecoration: "line-through",
                    opacity: 0.7,
                    fontWeight: 500,
                  }}
                >
                  S/. {producto.precioOriginal.toFixed(2)}
                </Typography>
              )}

              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: "success.main",
                    letterSpacing: "-0.03em",
                  }}
                >
                  S/. {producto.precio.toFixed(2)}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight={500}
                >
                  x {producto.unidad}
                </Typography>
              </Stack>

              {hayOferta && (
                <Chip
                  label="En oferta"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 700, ml: 1 }}
                />
              )}
            </Stack>
          </Box>

          {/* caja del stand principal */}
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.04),
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <StorefrontTwoToneIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "success.dark",
                    textTransform: "uppercase",
                  }}
                >
                  Vendido por
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {producto.standPrincipal.nombre}
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 3,
                color: "text.secondary",
              }}
            >
              📍 Bloque {producto.standPrincipal.bloque},{" "}
              {producto.standPrincipal.numero}
              {producto.standPrincipal.propietario && (
                <> · Responsable: {producto.standPrincipal.propietario}</>
              )}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={<StorefrontTwoToneIcon />}
                sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
                onClick={VisitarStand}
              >
                Visitar Stand
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<FavoriteBorderRoundedIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  border: "2px solid",
                  "&:hover": { border: "2px solid" },
                }}
              >
                Guardar
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
