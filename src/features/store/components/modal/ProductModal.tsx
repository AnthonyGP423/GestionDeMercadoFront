import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

import { buildPublicImgSrc } from "../../../store/utils/buildPublicImageUrl";
import { favoritosApi } from "../../../../api/cliente/favoritosApi";

type ProductoVista = {
  id: number;
  nombre: string;
  imagen: string;
  descripcionCorta: string;
  categoria: string;

  // ✅ guardamos ambos precios para mostrar oferta bien
  precioActual: number;
  precioOferta: number | null;
  enOferta: boolean; // igual que ProductosPrecios
  descuentoPorc: number; // igual que ProductosPrecios

  precioFinal: number; // igual que ProductosPrecios
  unidad: string;

  rating: number;
  totalValoraciones: number;

  standPrincipal: {
    id?: number;
    nombre: string;
    bloque: string;
    numero: string;
    propietario: string;
  };
};

const PRODUCTO_API_URL = "http://localhost:8080/api/public/productos";

type Props = {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onGoStand?: (standId: number) => void;
  enableOfertas?: boolean; // lo mantengo por compatibilidad, pero por ahora lo usas false
};

function isLoggedIn() {
  const token = localStorage.getItem("token");
  return !!token;
}

function formatMoney(n: number) {
  return `S/. ${n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductModal({
  open,
  productId,
  onClose,
  onGoStand,
  enableOfertas = false, // ✅ por defecto false, como tu padre
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [producto, setProducto] = useState<ProductoVista | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFav, setLoadingFav] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const logged = useMemo(() => isLoggedIn(), [open]);

  const [isFav, setIsFav] = useState(false);
  const [favChecked, setFavChecked] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProducto(null);
    setError(null);
    setIsFav(false);
    setFavChecked(false);
  }, [open, productId]);

  useEffect(() => {
    if (!open || !productId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await axios.get(`${PRODUCTO_API_URL}/${productId}`);
        const p = resp.data;

        // ✅ MISMA LÓGICA QUE ProductosPrecios.tsx
        const enOferta = p.enOferta === true;
        const tienePrecioOferta =
          enOferta && p.precioOferta !== null && p.precioOferta !== undefined;

        const precioActualNum = Number(p.precioActual);
        const precioOfertaNum = tienePrecioOferta ? Number(p.precioOferta) : null;

        const precioFinal = tienePrecioOferta ? precioOfertaNum! : precioActualNum;

        let descuentoPorc = 0;
        if (
          tienePrecioOferta &&
          typeof p.precioActual === "number" &&
          p.precioActual > 0 &&
          p.precioOferta < p.precioActual
        ) {
          descuentoPorc = Math.round((1 - p.precioOferta / p.precioActual) * 100);
        }

        const mapped: ProductoVista = {
          id: p.idProducto,
          nombre: p.nombreProducto,
          imagen:
            buildPublicImgSrc(p.imagenUrl) ||
            "https://via.placeholder.com/1200x900?text=Sin+imagen",
          descripcionCorta: String(p.descripcion ?? "").trim(),
          categoria: p.categoriaProducto ?? "Sin categoría",

          precioActual: precioActualNum,
          precioOferta: precioOfertaNum,
          enOferta,
          descuentoPorc,
          precioFinal: Number(precioFinal),

          unidad: p.unidadMedida ?? "unidad",

          rating: p.ratingPromedio ?? 0,
          totalValoraciones: p.totalValoraciones ?? 0,
          standPrincipal: {
            id: p.idStand ?? undefined,
            nombre: p.nombreStand ?? "Stand no asignado",
            bloque: p.bloque ?? "-",
            numero: p.numeroStand ? `Puesto ${p.numeroStand}` : "-",
            propietario: p.propietarioStand ?? "No registrado",
          },
        };

        setProducto(mapped);

        // ✅ si enableOfertas fuera true, aquí iría tu llamada /ofertas
        // (pero tu backend NO lo tiene aún, y tú estás usándolo false)
        void enableOfertas;
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar la información del producto.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [open, productId, enableOfertas]);

  useEffect(() => {
    if (!open || !logged || !producto?.standPrincipal?.id) return;
    if (favChecked) return;

    const run = async () => {
      try {
        const { data } = await favoritosApi.listar();
        const standId = Number(producto.standPrincipal.id);
        const found = (data ?? []).some((f) => Number(f.idStand) === standId);
        setIsFav(found);
      } catch {
        setIsFav(false);
      } finally {
        setFavChecked(true);
      }
    };

    run();
  }, [open, logged, producto?.standPrincipal?.id, favChecked]);

  const handleGoStand = () => {
    const standId = producto?.standPrincipal?.id;
    if (!standId) return;
    onGoStand?.(standId);
  };

  const toggleFav = async () => {
    if (!logged) return;
    const standId = producto?.standPrincipal?.id;
    if (!standId) return;

    try {
      setLoadingFav(true);
      if (isFav) {
        await favoritosApi.quitar(standId);
        setIsFav(false);
      } else {
        await favoritosApi.agregar(standId);
        setIsFav(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFav(false);
    }
  };

  const showOferta = !!(
    producto?.enOferta &&
    producto.precioOferta !== null &&
    producto.precioOferta !== undefined
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
          overflow: "hidden",
          bgcolor: "#ffffff",
        },
      }}
    >
      {/* HEADER / IMAGEN */}
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            height: { xs: 220, sm: 280 },
            bgcolor: "#f1f5f9",
            backgroundImage: producto?.imagen ? `url(${producto.imagen})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!producto && loading && (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
        </Box>

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 50%, rgba(255,255,255,1) 100%)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
          <Stack spacing={1}>
            {producto ? (
              <>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Chip
                    label={producto.categoria}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.92)",
                      fontWeight: 800,
                      borderRadius: 2,
                    }}
                  />

                  {producto.rating > 0 && (
                    <Chip
                      label={`⭐ ${producto.rating.toFixed(1)} (${producto.totalValoraciones})`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.92)",
                        fontWeight: 800,
                        borderRadius: 2,
                      }}
                    />
                  )}

                  {showOferta && (
                    <Chip
                      label={producto.descuentoPorc ? `-${producto.descuentoPorc}% oferta` : "En oferta"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(254,226,226,0.92)",
                        color: "#b91c1c",
                        fontWeight: 900,
                        borderRadius: 2,
                      }}
                    />
                  )}
                </Stack>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 950,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  {producto.nombre}
                </Typography>
              </>
            ) : loading ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={24} width={140} />
                <Skeleton variant="rounded" height={34} width="60%" />
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {loading && (
          <Box sx={{ py: 2 }}>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={28} width="40%" />
              <Skeleton variant="rounded" height={18} width="90%" />
              <Skeleton variant="rounded" height={18} width="75%" />
              <Skeleton variant="rounded" height={56} width="100%" />
            </Stack>
            <Box sx={{ display: "grid", placeItems: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && producto && (
          <Stack spacing={2.5}>
            {/* Precio + descripción */}
            <Box>
              <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
                Precio
              </Typography>

              {/* ✅ si hay oferta: mostrar precioFinal (oferta) y tachar actual */}
              {showOferta ? (
                <Stack spacing={0.8}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 950,
                      letterSpacing: "-0.03em",
                      color: "#16a34a",
                    }}
                  >
                    {formatMoney(producto.precioFinal)}{" "}
                    <Typography component="span" sx={{ color: "#64748b", fontWeight: 700 }}>
                      / {producto.unidad}
                    </Typography>
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 800,
                        textDecoration: "line-through",
                      }}
                    >
                      {formatMoney(producto.precioActual)}
                    </Typography>

                    {producto.descuentoPorc > 0 && (
                      <Chip
                        size="small"
                        label={`Ahorra ${producto.descuentoPorc}%`}
                        sx={{
                          bgcolor: "#fee2e2",
                          color: "#b91c1c",
                          fontWeight: 900,
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 950, letterSpacing: "-0.03em", color: "#16a34a" }}
                >
                  {formatMoney(producto.precioFinal)}{" "}
                  <Typography component="span" sx={{ color: "#64748b", fontWeight: 700 }}>
                    / {producto.unidad}
                  </Typography>
                </Typography>
              )}

              <Typography sx={{ mt: 1.2, color: "#475569", lineHeight: 1.6 }}>
                {producto.descripcionCorta ? (
  <Typography sx={{ mt: 1.2, color: "#475569", lineHeight: 1.6 }}>
    {producto.descripcionCorta}
  </Typography>
) : (
  <Typography sx={{ mt: 1.2, color: "#94a3b8", lineHeight: 1.6 }}>
    Sin descripción registrada.
  </Typography>
)}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#e5e7eb" }} />

            {/* Stand info + CTAs */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                bgcolor: "#fafafa",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
                    {producto.standPrincipal.nombre}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
                    📍 Bloque {producto.standPrincipal.bloque} · {producto.standPrincipal.numero}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<StorefrontIcon />}
                    onClick={handleGoStand}
                    disabled={!producto.standPrincipal.id}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 900,
                      px: 2,
                    }}
                  >
                    Ir al stand
                  </Button>

                  {logged && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={toggleFav}
                      disabled={!producto.standPrincipal.id || loadingFav}
                      startIcon={isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 900,
                        borderColor: "#e5e7eb",
                        bgcolor: "#ffffff",
                        "&:hover": { bgcolor: "#f8fafc" },
                      }}
                    >
                      {isFav ? "Guardado" : "Favorito"}
                    </Button>
                  )}
                </Stack>
              </Stack>

              {!logged && (
                <Typography sx={{ mt: 1.2, color: "#64748b" }} variant="body2">
                  Inicia sesión para guardar favoritos.
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}