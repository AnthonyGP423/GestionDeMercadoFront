// src/pages/Store/pages/VistaProducto.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Fade,
  Grow,
  Divider,
  Chip,
  Button,
  Paper,
  Rating,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";

// Iconos
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import ProductOffersSection, {
  StandOferta,
} from "../../../features/store/components/product/ProductSeccionOferta";

// ==== Tipos (alineado al estilo de tu modal para ofertas y precios) ====
type ProductoVista = {
  id: number;
  nombre: string;
  imagen: string; // URL final (normalizada)
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

  standPrincipal: {
    id?: number;
    nombre: string;
    bloque: string;
    numero: string;
    propietario: string;
  };
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const PRODUCTO_API_URL = `${API_BASE_URL}/api/public/productos`;

function buildPublicImgSrc(raw?: any) {
  const path = String(raw ?? "").trim();
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Si ya viene como /uploads/.. o uploads/..
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${clean}`;
}

function formatMoney(n: number) {
  return `S/. ${Number(n || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function VistaProducto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [producto, setProducto] = useState<ProductoVista | null>(null);
  const [otrasOfertas, setOtrasOfertas] = useState<StandOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showOferta = useMemo(() => {
    if (!producto) return false;
    return !!(
      producto.enOferta &&
      producto.precioOferta !== null &&
      producto.precioOferta !== undefined
    );
  }, [producto]);

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchProductoYOfertas = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) DETALLE PRINCIPAL
        const resp = await axios.get(`${PRODUCTO_API_URL}/${id}`);
        const p = resp.data;

        // ✅ misma lógica de oferta que ya tienes en el modal
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

          standPrincipal: {
            id: p.idStand ?? undefined,
            nombre: p.nombreStand ?? "Stand no asignado",
            bloque: p.bloque ?? "-",
            numero: p.numeroStand ? `Puesto ${p.numeroStand}` : "-",
            propietario: p.propietarioStand ?? "No registrado",
          },
        };

        setProducto(mapped);

        // 2) OTRAS OFERTAS (si falla, no bloquea)
        try {
          const respOfertas = await axios.get(`${PRODUCTO_API_URL}/${id}/ofertas`);
          const ofertasMapped: StandOferta[] = (respOfertas.data ?? []).map(
            (o: any) => ({
              id: o.idOferta ?? o.id ?? 0,
              nombreStand: o.nombreStand,
              bloque: o.bloque,
              numeroStand: o.numeroStand,
              precio: Number(o.precio),
              unidad: o.unidadMedida ?? "unidad",
              rating: o.ratingPromedio ?? 0,
              totalValoraciones: o.totalValoraciones ?? 0,
            })
          );
          setOtrasOfertas(ofertasMapped);
        } catch {
          setOtrasOfertas([]);
        }
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar la información del producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductoYOfertas();
  }, [id]);

  const goStand = () => {
    const standId = producto?.standPrincipal?.id;
    if (!standId) return;
    navigate(`/tienda/stand/${standId}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 50%, #ffffff 100%)",
      }}
    >
      <PublicHeader />

      {/* Header decoration */}
      <Box
        sx={{
          height: { xs: 160, md: 220 },
          background:
            "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.10) 0%, transparent 70%)",
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ py: 4, flex: 1, position: "relative", zIndex: 1 }}
      >
        {/* Breadcrumbs */}
        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <MuiLink
              component={RouterLink}
              to="/tienda"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                "&:hover": { color: "#16a34a" },
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Inicio
            </MuiLink>

            <MuiLink
              component={RouterLink}
              to="/tienda/precios-productos"
              color="inherit"
              sx={{ "&:hover": { color: "#16a34a" } }}
            >
              Productos
            </MuiLink>

            {producto && (
              <Typography color="text.primary" fontWeight={700}>
                {producto.nombre}
              </Typography>
            )}
          </Breadcrumbs>

          <Tooltip title="Volver" arrow>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 3,
                bgcolor: "#fff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                "&:hover": { bgcolor: "#f9fafb", borderColor: "#22c55e" },
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Loading */}
        {loading && (
          <Fade in>
            <Box sx={{ textAlign: "center", py: 10 }}>
              <CircularProgress size={48} sx={{ color: "#22c55e" }} />
              <Typography sx={{ mt: 2, fontWeight: 600 }} color="text.secondary">
                Buscando detalles del producto...
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Error */}
        {error && !loading && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.10)",
                fontWeight: 500,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Contenido */}
        {!loading && !error && producto && (
          <Grow in timeout={500}>
            <Stack spacing={4}>
              {/* Card principal tipo modal */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  border: "1px solid rgba(34,197,94,0.15)",
                  boxShadow:
                    "0 20px 50px rgba(34,197,94,0.12), 0 0 0 1px rgba(34,197,94,0.05)",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack direction={isMobile ? "column" : "row"} sx={{ minHeight: 360 }}>
                  {/* Imagen */}
                  <Box
                    sx={{
                      position: "relative",
                      width: isMobile ? "100%" : "46%",
                      minHeight: isMobile ? 260 : "auto",
                      bgcolor: "#f1f5f9",
                    }}
                  >
                    {producto.imagen ? (
                      <Box
                        component="img"
                        src={producto.imagen}
                        alt={producto.nombre}
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: "100%",
                          minHeight: isMobile ? 260 : 360,
                          display: "grid",
                          placeItems: "center",
                          background:
                            "linear-gradient(135deg, rgba(226,232,240,0.8) 0%, rgba(241,245,249,1) 100%)",
                        }}
                      >
                        <Stack alignItems="center" spacing={1}>
                          <ImageNotSupportedRoundedIcon sx={{ fontSize: 42, color: "#94a3b8" }} />
                          <Typography color="text.secondary" fontWeight={700}>
                            Sin imagen registrada
                          </Typography>
                        </Stack>
                      </Box>
                    )}

                    {/* Overlay suave tipo modal */}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background:
                          isMobile
                            ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 40%, rgba(255,255,255,1) 100%)"
                            : "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 45%, rgba(255,255,255,1) 100%)",
                      }}
                    />

                    {/* Chips arriba (categoria/rating/oferta) */}
                    <Box sx={{ position: "absolute", left: 14, top: 14 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                            label={
                              producto.descuentoPorc
                                ? `-${producto.descuentoPorc}% oferta`
                                : "En oferta"
                            }
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
                    </Box>
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, p: { xs: 2.5, sm: 3.5 } }}>
                    <Stack spacing={2.2}>
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 950,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                            color: "#0f172a",
                          }}
                        >
                          {producto.nombre}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                          <Rating value={producto.rating} precision={0.5} readOnly />
                        </Box>
                      </Box>

                      {/* Precio */}
                      <Box>
                        <Typography sx={{ color: "#64748b", fontWeight: 800 }}>
                          Precio
                        </Typography>

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
                              <Typography
                                component="span"
                                sx={{ color: "#64748b", fontWeight: 800, fontSize: 16 }}
                              >
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
                            sx={{
                              fontWeight: 950,
                              letterSpacing: "-0.03em",
                              color: "#16a34a",
                            }}
                          >
                            {formatMoney(producto.precioFinal)}{" "}
                            <Typography
                              component="span"
                              sx={{ color: "#64748b", fontWeight: 800, fontSize: 16 }}
                            >
                              / {producto.unidad}
                            </Typography>
                          </Typography>
                        )}
                      </Box>

                      {/* Descripción */}
                      <Box>
                        <Typography sx={{ color: "#64748b", fontWeight: 800 }}>
                          Descripción
                        </Typography>

                        {producto.descripcionCorta ? (
                          <Typography sx={{ mt: 0.8, color: "#475569", lineHeight: 1.7 }}>
                            {producto.descripcionCorta}
                          </Typography>
                        ) : (
                          <Typography sx={{ mt: 0.8, color: "#94a3b8", fontStyle: "italic" }}>
                            Sin descripción registrada.
                          </Typography>
                        )}
                      </Box>

                      <Divider sx={{ borderColor: "#e5e7eb" }} />

                      {/* Stand */}
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
                            <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
                              📍 Bloque {producto.standPrincipal.bloque} · {producto.standPrincipal.numero}
                            </Typography>
                            <Typography sx={{ color: "#94a3b8", fontWeight: 600 }} variant="body2">
                              Propietario: {producto.standPrincipal.propietario}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<StorefrontIcon />}
                              onClick={goStand}
                              disabled={!producto.standPrincipal.id}
                              sx={{
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 900,
                                px: 2.2,
                                background:
                                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                boxShadow: "0 10px 25px rgba(34,197,94,0.25)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                },
                              }}
                            >
                              Ir al stand
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Otras ofertas */}
              {otrasOfertas.length > 0 && (
                <>
                  <Divider sx={{ borderColor: "#e5e7eb" }}>
                    <Chip label="Otras opciones" size="small" />
                  </Divider>

                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 5,
                      border: "1px solid #e5e7eb",
                      bgcolor: "#ffffff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                      overflow: "hidden",
                      p: { xs: 2.5, sm: 3.5 },
                    }}
                  >
                    <ProductOffersSection ofertas={otrasOfertas} />
                  </Paper>
                </>
              )}
            </Stack>
          </Grow>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}