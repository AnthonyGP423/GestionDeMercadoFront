// src/features/store/components/modal/ProductoStand.tsx
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
  Rating,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PRODUCTO_API_URL = `${API_BASE_URL}/api/public/productos`;

type StandContext = {
  id: number;
  bloque: string | null;
  numeroStand: string | null;
  nombreComercial: string | null;
  nombreCategoriaStand: string | null;
  nombrePropietario: string | null;
};

type ProductoVista = {
  id: number;
  nombre: string;
  imagen: string;
  descripcionCorta: string;
  categoria: string;

  precioActual: number;
  precioOferta: number | null;
  enOferta: boolean;
  descuentoPorc: number;
  precioFinal: number;
  unidad: string;

  rating: number;
  totalValoraciones: number;
};

type Props = {
  open: boolean;
  productId: number | null;
  stand: StandContext | null; // ✅ contexto del stand actual
  onClose: () => void;
};

function buildPublicImgSrc(raw?: any) {
  const path = String(raw ?? "").trim();
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${clean}`;
}

function formatMoney(n: number) {
  return `S/. ${Number(n || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductoStandModal({ open, productId, stand, onClose }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [producto, setProducto] = useState<ProductoVista | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ reseteo cuando abres/cambias producto
  useEffect(() => {
    if (!open) return;
    setProducto(null);
    setError(null);
  }, [open, productId]);

  useEffect(() => {
    if (!open || !productId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await axios.get(`${PRODUCTO_API_URL}/${productId}`);
        const p = resp.data;

        // oferta (misma lógica que tu modal anterior)
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
          imagen: buildPublicImgSrc(p.imagenUrl) || "",
          descripcionCorta: String(p.descripcion ?? "").trim(),
          categoria: p.categoriaProducto ?? "Sin categoría",

          precioActual: precioActualNum,
          precioOferta: precioOfertaNum,
          enOferta,
          descuentoPorc,
          precioFinal: Number(precioFinal),
          unidad: p.unidadMedida ?? "unidad",

          rating: Number(p.ratingPromedio ?? 0),
          totalValoraciones: Number(p.totalValoraciones ?? 0),
        };

        setProducto(mapped);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar la información del producto.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [open, productId]);

  const showOferta = useMemo(() => {
    if (!producto) return false;
    return !!(
      producto.enOferta &&
      producto.precioOferta !== null &&
      producto.precioOferta !== undefined
    );
  }, [producto]);

  const standTitulo = stand?.nombreComercial ?? "Stand";
  const standUbicacion = `Bloque ${stand?.bloque ?? "?"} · Puesto ${stand?.numeroStand ?? "?"}`;
  const standProp = stand?.nombrePropietario ?? "No registrado";
  const standCategoria = stand?.nombreCategoriaStand ?? "Sin categoría";

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
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {/* imagen */}
          {producto?.imagen ? (
            <Box
              component="img"
              src={producto.imagen}
              alt={producto.nombre}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : loading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            <Stack alignItems="center" spacing={1}>
              <ImageNotSupportedRoundedIcon sx={{ fontSize: 42, color: "#94a3b8" }} />
              <Typography color="text.secondary" fontWeight={800}>
                Sin imagen
              </Typography>
            </Stack>
          )}
        </Box>

        {/* overlay tipo modal */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 50%, rgba(255,255,255,1) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* cerrar */}
        <Box sx={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 1 }}>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: "rgba(255,255,255,0.92)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* título + chips */}
        <Box sx={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
          <Stack spacing={1}>
            {producto ? (
              <>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
                  <Chip
                    label={producto.categoria}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.92)",
                      fontWeight: 900,
                      borderRadius: 2,
                    }}
                  />

                  {producto.rating > 0 && (
                    <Chip
                      label={`⭐ ${producto.rating.toFixed(1)} (${producto.totalValoraciones})`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.92)",
                        fontWeight: 900,
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
              <Typography sx={{ color: "#64748b", fontWeight: 800 }}>Precio</Typography>

              {showOferta ? (
                <Stack spacing={0.8}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 950, letterSpacing: "-0.03em", color: "#16a34a" }}
                  >
                    {formatMoney(producto.precioFinal)}{" "}
                    <Typography component="span" sx={{ color: "#64748b", fontWeight: 800 }}>
                      / {producto.unidad}
                    </Typography>
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 900,
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
                  <Typography component="span" sx={{ color: "#64748b", fontWeight: 800 }}>
                    / {producto.unidad}
                  </Typography>
                </Typography>
              )}

              <Typography sx={{ mt: 1.2, color: "#64748b", fontWeight: 800 }}>
                Descripción
              </Typography>

              {producto.descripcionCorta ? (
                <Typography sx={{ mt: 0.6, color: "#475569", lineHeight: 1.7 }}>
                  {producto.descripcionCorta}
                </Typography>
              ) : (
                <Typography sx={{ mt: 0.6, color: "#94a3b8", fontStyle: "italic" }}>
                  Sin descripción registrada.
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: "#e5e7eb" }} />

            {/* ✅ Contexto del Stand (más “del stand”) */}
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 3,
                border: "1px solid rgba(34,197,94,0.18)",
                bgcolor: "rgba(236,253,245,0.55)",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    bgcolor: "#dcfce7",
                    color: "#16a34a",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <StorefrontIcon />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 950, color: "#0f172a", lineHeight: 1.2 }}>
                    {standTitulo}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
                    {standUbicacion}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={standCategoria}
                  sx={{ bgcolor: "#fff", border: "1px solid #e5e7eb", fontWeight: 900, borderRadius: 2 }}
                />
                <Chip
                  size="small"
                  label={`Propietario: ${standProp}`}
                  sx={{ bgcolor: "#fff", border: "1px solid #e5e7eb", fontWeight: 800, borderRadius: 2 }}
                />
              </Stack>

              <Typography sx={{ mt: 1.2, color: "#64748b" }} variant="body2">
                Estás viendo un producto de este stand. (No necesitas salir a otra página 😉)
              </Typography>
            </Paper>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                onClick={onClose}
                sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999 }}
              >
                Cerrar
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}