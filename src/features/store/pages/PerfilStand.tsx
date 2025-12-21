// src/pages/Tienda/PerfilStand.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Rating,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorefrontIcon from "@mui/icons-material/Storefront";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddCommentIcon from "@mui/icons-material/AddComment";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import { AppTabs, TabPanel } from "../../../components/shared/AppTabs";
import ProductsGrid, {
  StoreProduct,
} from "../../../features/store/components/product/ProductsGrid";

import { useAuth } from "../../../auth/useAuth";
import { favoritosApi } from "../../../api/cliente/favoritosApi";
import { calificacionesClienteApi } from "../../../api/cliente/calificacionesClienteApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type TabKey = "info" | "productos" | "reseñas";

const STAND_TABS = [
  { value: "info", label: "Información" },
  { value: "productos", label: "Productos" },
  { value: "reseñas", label: "Reseñas" },
];

type ReseñaStand = {
  id: number;
  autor: string;
  fecha: string;
  comentario: string;
  rating: number;
};

type StandPerfil = {
  id: number;
  bloque: string | null;
  numeroStand: string | null;
  nombreComercial: string | null;
  descripcionNegocio: string | null;
  nombreCategoriaStand: string | null;
  nombrePropietario: string | null;
};

const isClienteRole = (rol?: string) => {
  const r = String(rol ?? "").toUpperCase();
  return r === "CLIENTE" || r === "ROLE_CLIENTE" || r.includes("CLIENTE");
};

export default function PerfilStand() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { isAuthenticated, user } = useAuth() as any;
  const esCliente = useMemo(() => {
    return Boolean(isAuthenticated && isClienteRole(user?.rol));
  }, [isAuthenticated, user?.rol]);

  const [tab, setTab] = useState<TabKey>("info");

  const [stand, setStand] = useState<StandPerfil | null>(null);
  const [loadingStand, setLoadingStand] = useState(true);
  const [errorStand, setErrorStand] = useState<string | null>(null);

  const [productosStand, setProductosStand] = useState<StoreProduct[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);

  const [reseñas, setReseñas] = useState<ReseñaStand[]>([]);
  const [loadingReseñas, setLoadingReseñas] = useState(false);
  const [errorReseñas, setErrorReseñas] = useState<string | null>(null);

  const [ratingPromedio, setRatingPromedio] = useState<number>(0);
  const [totalReseñas, setTotalReseñas] = useState<number>(0);

  const [isFav, setIsFav] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const [openResena, setOpenResena] = useState(false);
  const [miRating, setMiRating] = useState<number | null>(5);
  const [miComentario, setMiComentario] = useState<string>("");
  const [savingResena, setSavingResena] = useState(false);
  const [errorCrearResena, setErrorCrearResena] = useState<string | null>(null);

  const handleVerProducto = (product: StoreProduct) => {
    navigate(`/tienda/producto/${product.id}`);
  };

  const fetchPromedio = async () => {
    if (!id) return;
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/api/public/calificaciones/stand/${id}/promedio`
      );
      const d = resp.data || {};

      const promedio = d.promedio ?? d.promedioCalificacion ?? 0;
      const total =
        d.totalCalificaciones ?? d.totalResenas ?? d.totalReseñas ?? 0;

      setRatingPromedio(Number(promedio));
      setTotalReseñas(Number(total));
    } catch (e) {
      console.error("Error obteniendo promedio de calificación", e);
    }
  };

  const fetchReseñas = async () => {
    if (!id) return;
    try {
      setLoadingReseñas(true);
      setErrorReseñas(null);

      const resp = await axios.get(
        `${API_BASE_URL}/api/public/calificaciones/stand/${id}/comentarios`,
        { params: { page: 0, size: 10 } }
      );

      const page = resp.data;
      const content: any[] = page?.content ?? [];

      const mapped: ReseñaStand[] = content.map((c: any) => {
        const autor = c.nombreCliente || c.nombreAnonimo || "Cliente";

        return {
          id: Number(c.idCalificacion ?? c.id ?? 0),
          autor,
          fecha: String(c.fecha ?? ""),
          comentario: String(c.comentario ?? ""),
          rating: Number(c.puntuacion ?? 0),
        };
      });

      setReseñas(mapped);
    } catch (e) {
      console.error(e);
      setErrorReseñas("No se pudieron cargar las reseñas de este stand.");
    } finally {
      setLoadingReseñas(false);
    }
  };

  const syncFavorito = async () => {
    if (!id) return;
    if (!esCliente) {
      setIsFav(false);
      return;
    }
    try {
      const resp = await favoritosApi.listar();
      const list = resp.data ?? [];
      setIsFav(list.some((x: any) => Number(x.idStand) === Number(id)));
    } catch {
      setIsFav(false);
    }
  };

  const toggleFavorito = async () => {
    if (!id) return;

    if (!esCliente) {
      navigate("/cliente/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setLoadingFav(true);

      if (isFav) {
        await favoritosApi.quitar(Number(id));
        setIsFav(false);
      } else {
        await favoritosApi.agregar(Number(id));
        setIsFav(true);
      }
    } catch (e) {
      console.error(e);
      await syncFavorito();
    } finally {
      setLoadingFav(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchPromedio(), fetchReseñas(), syncFavorito()]);
  };

  useEffect(() => {
    if (!id) {
      setErrorStand("No se ha proporcionado un ID de stand.");
      setLoadingStand(false);
      return;
    }

    const fetchStand = async () => {
      try {
        setLoadingStand(true);
        setErrorStand(null);

        const resp = await axios.get(`${API_BASE_URL}/api/public/stands/${id}`);
        const s = resp.data;

        const mapped: StandPerfil = {
          id: s.id,
          bloque: s.bloque ?? null,
          numeroStand: s.numeroStand ?? null,
          nombreComercial: s.nombreComercial ?? null,
          descripcionNegocio: s.descripcionNegocio ?? null,
          nombreCategoriaStand: s.nombreCategoriaStand ?? null,
          nombrePropietario: s.nombrePropietario ?? null,
        };

        setStand(mapped);
      } catch (e) {
        console.error(e);
        setErrorStand("No se pudo cargar la información del stand.");
      } finally {
        setLoadingStand(false);
      }
    };

    fetchStand();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchProductos = async () => {
      try {
        setLoadingProductos(true);
        setErrorProductos(null);

        const resp = await axios.get(
          `${API_BASE_URL}/api/public/productos/por-stand/${id}`
        );
        const data: any[] = resp.data ?? [];

        const mapped: StoreProduct[] = data.map((p: any) => {
          const enOferta = p.enOferta === true;
          const tienePrecioOferta =
            enOferta && p.precioOferta !== null && p.precioOferta !== undefined;

          const precioFinal = tienePrecioOferta
            ? Number(p.precioOferta)
            : Number(p.precioActual);

          let descuentoPorc = 0;
          if (
            tienePrecioOferta &&
            typeof p.precioActual === "number" &&
            p.precioActual > 0 &&
            p.precioOferta < p.precioActual
          ) {
            descuentoPorc = Math.round(
              (1 - p.precioOferta / p.precioActual) * 100
            );
          }

          return {
            id: p.idProducto,
            nombre: p.nombreProducto,
            categoriaTag: p.categoriaProducto ?? "Sin categoría",
            stand: p.nombreStand
              ? `${p.nombreStand} · Bloque ${p.bloque}, Puesto ${p.numeroStand}`
              : "Stand no asignado",
            precio: precioFinal,
            unidad: p.unidadMedida ?? "unidad",
            moneda: "S/.",
            esOferta: enOferta,
            descuentoPorc,
            imageUrl:
              p.imagenUrl ??
              "https://via.placeholder.com/400x300?text=Sin+imagen",
          } as StoreProduct;
        });

        setProductosStand(mapped);
      } catch (e) {
        console.error(e);
        setErrorProductos("No se pudieron cargar los productos del stand.");
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductos();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, esCliente]);

  const onClickAgregarReseña = () => {
    if (!esCliente) {
      navigate("/cliente/login", { state: { from: location.pathname } });
      return;
    }
    setErrorCrearResena(null);
    setMiRating(5);
    setMiComentario("");
    setOpenResena(true);
  };

  const onSubmitReseña = async () => {
    if (!id) return;

    if (!miRating || miRating < 1 || miRating > 5) {
      setErrorCrearResena("Selecciona una puntuación válida (1 a 5).");
      return;
    }

    try {
      setSavingResena(true);
      setErrorCrearResena(null);

      await calificacionesClienteApi.crear({
        idStand: Number(id),
        puntuacion: miRating,
        comentario: miComentario?.trim() ? miComentario.trim() : null,
      });

      setOpenResena(false);

      await fetchPromedio();
      await fetchReseñas();
      setTab("reseñas");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudo registrar tu reseña.";
      setErrorCrearResena(String(msg));
    } finally {
      setSavingResena(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ecfdf5 0%, #f8fafc 50%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      <Box
        sx={{
          position: "relative",
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 8 },
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="lg" sx={{ flex: 1 }}>
          {loadingStand && (
            <Fade in>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CircularProgress size={48} sx={{ color: "#22c55e" }} />
                <Typography
                  sx={{ mt: 2, fontWeight: 600 }}
                  color="text.secondary"
                >
                  Cargando información del stand...
                </Typography>
              </Box>
            </Fade>
          )}

          {errorStand && !loadingStand && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
                }}
              >
                {errorStand}
              </Alert>
            </Fade>
          )}

          {!loadingStand && !errorStand && stand && (
            <Grow in timeout={500}>
              <Box>
                {/* HERO CARD */}
                <Paper
                  elevation={0}
                  sx={{
                    mb: 4,
                    p: { xs: 3, md: 4 },
                    borderRadius: 5,
                    border: "1px solid rgba(34,197,94,0.15)",
                    background:
                      "linear-gradient(135deg, rgba(236,253,245,0.8) 0%, rgba(255,255,255,0.9) 100%)",
                    boxShadow:
                      "0 20px 50px rgba(34,197,94,0.12), 0 0 0 1px rgba(34,197,94,0.05)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 3, md: 4 }}
                    alignItems={{ xs: "center", md: "center" }}
                    justifyContent="space-between"
                    textAlign={{ xs: "center", md: "left" }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={3}
                      alignItems={{ xs: "center", md: "center" }}
                      flex={1}
                      width="100%"
                    >
                      <Box sx={{ position: "relative" }}>
                        <Avatar
                          sx={{
                            width: { xs: 80, sm: 96 },
                            height: { xs: 80, sm: 96 },
                            background:
                              "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            fontSize: { xs: 32, sm: 40 },
                            fontWeight: 900,
                            boxShadow: "0 8px 20px rgba(34,197,94,0.3)",
                          }}
                        >
                          <StorefrontIcon
                            sx={{ fontSize: { xs: 36, sm: 44 } }}
                          />
                        </Avatar>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "#22c55e",
                            border: "3px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        />
                      </Box>

                      <Box flex={1} width="100%">
                        <Typography
                          variant="overline"
                          sx={{
                            letterSpacing: "0.15em",
                            color: "#16a34a",
                            fontWeight: 800,
                            fontSize: 11,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          MERCADO MAYORISTA
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                            mb: 1.5,
                            fontSize: { xs: "1.75rem", sm: "2.25rem" },
                            lineHeight: 1.1,
                          }}
                        >
                          {stand.nombreComercial ?? "Stand sin nombre"}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          alignItems="center"
                          justifyContent={{ xs: "center", md: "flex-start" }}
                          useFlexGap
                        >
                          <Chip
                            label={
                              stand.nombreCategoriaStand ?? "Sin categoría"
                            }
                            size="small"
                            sx={{
                              bgcolor: "#dcfce7",
                              color: "#166534",
                              fontWeight: 800,
                              borderRadius: "8px",
                              fontSize: 12,
                            }}
                          />

                          <Chip
                            icon={<StarRoundedIcon sx={{ fontSize: 18 }} />}
                            label={
                              totalReseñas > 0
                                ? `${ratingPromedio.toFixed(
                                    1
                                  )} (${totalReseñas})`
                                : "Nuevo"
                            }
                            size="small"
                            sx={{
                              bgcolor: "#fff",
                              border: "1px solid #e5e7eb",
                              fontWeight: 800,
                              borderRadius: "8px",
                              fontSize: 12,
                              "& .MuiChip-icon": { color: "#f59e0b" },
                            }}
                          />

                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <LocationOnOutlinedIcon
                              sx={{ fontSize: 18, color: "#64748b" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#64748b" }}
                            >
                              Bloque {stand.bloque ?? "?"} · Puesto{" "}
                              {stand.numeroStand ?? "?"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Acciones */}
                    <Stack
                      direction={{ xs: "row", md: "column" }}
                      spacing={2}
                      alignItems={{ xs: "center", md: "flex-end" }}
                      justifyContent={{ xs: "center", md: "flex-start" }}
                      width={{ xs: "100%", md: "auto" }}
                      mt={{ xs: 3, md: 0 }}
                    >
                      <Tooltip title="Actualizar datos" arrow>
                        <IconButton
                          onClick={refreshAll}
                          sx={{
                            borderRadius: "12px",
                            bgcolor: "#fff",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            "&:hover": {
                              bgcolor: "#f9fafb",
                              borderColor: "#22c55e",
                              transform: "rotate(180deg)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={
                          esCliente
                            ? isFav
                              ? "Quitar de favoritos"
                              : "Guardar en favoritos"
                            : "Inicia sesión para guardar"
                        }
                        arrow
                      >
                        <Button
                          onClick={toggleFavorito}
                          disabled={loadingFav}
                          variant={isFav ? "contained" : "outlined"}
                          startIcon={
                            isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />
                          }
                          color={isFav ? "error" : "inherit"}
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            borderColor: isFav ? "transparent" : "#e5e7eb",
                            bgcolor: isFav ? "#ef4444" : "#fff",
                            color: isFav ? "#fff" : "#475569",
                            "&:hover": {
                              bgcolor: isFav ? "#dc2626" : "#f1f5f9",
                              borderColor: isFav ? "transparent" : "#cbd5e1",
                            },
                          }}
                        >
                          {isFav ? "Favorito" : "Guardar"}
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>

                {/* TABS CARD */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 5,
                    border: "1px solid #e5e7eb",
                    bgcolor: "#ffffff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: { xs: 0, sm: 4 },
                      pt: 2,
                      bgcolor: "#fff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        overflowX: "auto",
                        "&::-webkit-scrollbar": { height: 4 },
                        "&::-webkit-scrollbar-thumb": {
                          borderRadius: 2,
                          bgcolor: "#cbd5e1",
                        },
                      }}
                    >
                      <AppTabs
                        value={tab}
                        onChange={(v) => setTab(v as TabKey)}
                        items={STAND_TABS}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                    {/* INFO TAB */}
                    <TabPanel current={tab} value="info">
                      <Typography variant="h6" fontWeight={900} mb={3}>
                        Información del stand
                      </Typography>

                      <Stack spacing={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: "1px solid #f3f4f6",
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "#dcfce7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#16a34a",
                                flexShrink: 0,
                              }}
                            >
                              <PersonOutlineIcon />
                            </Box>
                            <Box flex={1}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  fontSize: 11,
                                  letterSpacing: "0.1em",
                                }}
                              >
                                Propietario
                              </Typography>
                              <Typography fontWeight={800} sx={{ mt: 0.5 }}>
                                {stand.nombrePropietario ?? "No registrado"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: "1px solid #f3f4f6",
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "#dcfce7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#16a34a",
                                flexShrink: 0,
                              }}
                            >
                              <DescriptionOutlinedIcon />
                            </Box>
                            <Box flex={1}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  fontSize: 11,
                                  letterSpacing: "0.1em",
                                }}
                              >
                                Descripción
                              </Typography>
                              <Typography
                                sx={{
                                  mt: 0.5,
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {stand.descripcionNegocio ??
                                  "Este stand aún no tiene una descripción registrada."}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: "1px solid #f3f4f6",
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "#fef3c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#f59e0b",
                                flexShrink: 0,
                              }}
                            >
                              <StarRoundedIcon />
                            </Box>
                            <Box flex={1}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  fontSize: 11,
                                  letterSpacing: "0.1em",
                                }}
                              >
                                Valoración Global
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                sx={{ mt: 1 }}
                              >
                                <Rating
                                  value={ratingPromedio}
                                  precision={0.5}
                                  readOnly
                                />
                                <Typography variant="h6" fontWeight={900}>
                                  {ratingPromedio.toFixed(1)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  ({totalReseñas}{" "}
                                  {totalReseñas === 1 ? "reseña" : "reseñas"})
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      </Stack>
                    </TabPanel>

                    {/* PRODUCTOS TAB */}
                    <TabPanel current={tab} value="productos">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Typography variant="h6" fontWeight={900}>
                          Productos del stand
                        </Typography>
                        {productosStand.length > 0 && (
                          <Chip
                            label={`${productosStand.length} productos`}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Stack>

                      {loadingProductos ? (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <CircularProgress
                            size={32}
                            sx={{ color: "#22c55e" }}
                          />
                          <Typography
                            sx={{ mt: 2, fontWeight: 600 }}
                            color="text.secondary"
                          >
                            Cargando productos...
                          </Typography>
                        </Box>
                      ) : errorProductos ? (
                        <Alert severity="error" sx={{ borderRadius: 3 }}>
                          {errorProductos}
                        </Alert>
                      ) : productosStand.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            textAlign: "center",
                            borderRadius: 4,
                            border: "1px dashed #e5e7eb",
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 3,
                              bgcolor: "#dcfce7",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#16a34a",
                              mb: 1.5,
                            }}
                          >
                            <StorefrontIcon />
                          </Box>

                          <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                            Aún no hay productos publicados
                          </Typography>
                          <Typography color="text.secondary" sx={{ mb: 2 }}>
                            Este stand todavía no registra productos visibles en
                            la tienda.
                          </Typography>
                        </Paper>
                      ) : (
                        <ProductsGrid
                          products={productosStand}
                          onViewStand={handleVerProducto}
                        />
                      )}
                    </TabPanel>

                    {/* RESEÑAS TAB */}
                    <TabPanel current={tab} value="reseñas">
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", sm: "center" }}
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
                            Reseñas de clientes
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Opiniones verificadas sobre este negocio.
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          onClick={onClickAgregarReseña}
                          startIcon={<AddCommentIcon />}
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 900,
                            background:
                              "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #020617 0%, #000 100%)",
                            },
                          }}
                        >
                          {esCliente
                            ? "Escribir reseña"
                            : "Inicia sesión para opinar"}
                        </Button>
                      </Stack>

                      <Divider sx={{ borderColor: "#f3f4f6", mb: 3 }} />

                      {loadingReseñas ? (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <CircularProgress size={28} />
                          <Typography
                            sx={{ mt: 1.5 }}
                            color="text.secondary"
                            fontWeight={600}
                          >
                            Cargando reseñas...
                          </Typography>
                        </Box>
                      ) : errorReseñas ? (
                        <Alert severity="error" sx={{ borderRadius: 3 }}>
                          {errorReseñas}
                        </Alert>
                      ) : reseñas.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 4,
                            border: "1px dashed #e5e7eb",
                            bgcolor: "#fafafa",
                            textAlign: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 3,
                              bgcolor: "#fef3c7",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#f59e0b",
                              mb: 1.5,
                            }}
                          >
                            <StarRoundedIcon />
                          </Box>
                          <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                            Aún no hay reseñas
                          </Typography>
                          <Typography color="text.secondary">
                            Sé el primero en dejar tu experiencia.
                          </Typography>
                        </Paper>
                      ) : (
                        <Stack spacing={2}>
                          {reseñas.map((r) => (
                            <Paper
                              key={r.id}
                              elevation={0}
                              sx={{
                                p: 2.5,
                                borderRadius: 4,
                                border: "1px solid #f1f5f9",
                                bgcolor: "#ffffff",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#e2e8f0",
                                  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="baseline"
                                spacing={2}
                                mb={1}
                              >
                                <Typography fontWeight={900} color="#0f172a">
                                  {r.autor}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={700}
                                >
                                  {r.fecha}
                                </Typography>
                              </Stack>

                              <Rating
                                value={r.rating}
                                readOnly
                                size="small"
                                sx={{ mb: 1.5 }}
                              />

                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  lineHeight: 1.6,
                                  color: "#334155",
                                }}
                              >
                                {r.comentario || (
                                  <Box
                                    component="span"
                                    fontStyle="italic"
                                    color="text.disabled"
                                  >
                                    Sin comentario escrito.
                                  </Box>
                                )}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </TabPanel>
                  </Box>
                </Paper>
              </Box>
            </Grow>
          )}
        </Container>
      </Box>

      {/* MODAL AGREGAR RESEÑA */}
      <Dialog
        open={openResena}
        onClose={() => setOpenResena(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Tu experiencia</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {errorCrearResena && (
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                {errorCrearResena}
              </Alert>
            )}

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  mb: 1,
                  display: "block",
                }}
              >
                Calificación
              </Typography>
              <Rating
                value={miRating}
                onChange={(_, v) => setMiRating(v)}
                size="large"
              />
            </Box>

            <TextField
              label="Comentario (opcional)"
              multiline
              minRows={3}
              value={miComentario}
              onChange={(e) => setMiComentario(e.target.value)}
              placeholder="¿Qué te pareció el servicio y los productos?"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenResena(false)}
            disabled={savingResena}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              color: "text.secondary",
              borderRadius: 2,
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onSubmitReseña}
            disabled={savingResena}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2.5,
              px: 4,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              },
            }}
          >
            {savingResena ? "Publicando..." : "Publicar Reseña"}
          </Button>
        </DialogActions>
      </Dialog>

      <PublicFooter />
    </Box>
  );
}
