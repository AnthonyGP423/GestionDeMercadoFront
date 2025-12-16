// src/pages/Tienda/PerfilStand.tsx
import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

import { AppTabs, TabPanel } from "../../../components/shared/AppTabs";
import ProductsGrid, {
  StoreProduct,
} from "../../../features/store/components/product/ProductsGrid";

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

// Alineado con StandResponseDto
type StandPerfil = {
  id: number;
  bloque: string | null;
  numeroStand: string | null;
  nombreComercial: string | null;
  descripcionNegocio: string | null;
  nombreCategoriaStand: string | null;
  nombrePropietario: string | null;
};

export default function PerfilStand() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>("info");

  const [stand, setStand] = useState<StandPerfil | null>(null);
  const [loadingStand, setLoadingStand] = useState(true);
  const [errorStand, setErrorStand] = useState<string | null>(null);

  // ===== PRODUCTOS DEL STAND (API) =====
  const [productosStand, setProductosStand] = useState<StoreProduct[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);

  // ===== RESEÑAS / PROMEDIO (API calificaciones) =====
  const [reseñas, setReseñas] = useState<ReseñaStand[]>([]);
  const [loadingReseñas, setLoadingReseñas] = useState(false);
  const [errorReseñas, setErrorReseñas] = useState<string | null>(null);

  const [ratingPromedio, setRatingPromedio] = useState<number>(0);
  const [totalReseñas, setTotalReseñas] = useState<number>(0);

  const handleVerProducto = (product: StoreProduct) => {
    navigate(`/tienda/producto/${product.id}`);
  };

  // ==== 1) FETCH DEL STAND POR ID ====
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

  // ==== 2) FETCH PRODUCTOS DEL STAND ====
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

  // ==== 3) FETCH PROMEDIO DE CALIFICACIONES + RESEÑAS ====
  useEffect(() => {
    if (!id) return;

    const fetchPromedio = async () => {
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
      try {
        setLoadingReseñas(true);
        setErrorReseñas(null);

        const resp = await axios.get(
          `${API_BASE_URL}/api/public/calificaciones/stand/${id}/comentarios`,
          {
            params: { page: 0, size: 10 },
          }
        );

        const page = resp.data;
        const content: any[] = page?.content ?? [];

        const mapped: ReseñaStand[] = content.map((c) => ({
          id: c.id,
          autor: c.nombreUsuario ?? c.autorAnonimo ?? "Cliente",
          fecha: c.fechaRegistro ?? c.fecha ?? "",
          comentario: c.comentario ?? "",
          rating: c.puntuacion ?? c.valor ?? 0,
        }));

        setReseñas(mapped);
      } catch (e) {
        console.error(e);
        setErrorReseñas("No se pudieron cargar las reseñas de este stand.");
      } finally {
        setLoadingReseñas(false);
      }
    };

    fetchPromedio();
    fetchReseñas();
  }, [id]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          "linear-gradient(180deg, #ecfdf3 0%, #f8fafc 40%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      {/* fondo tipo HomeTienda */}
      <Box
        sx={{
          position: "relative",
          pt: 4,
          pb: 8,
          background:
            "radial-gradient(circle at top left, rgba(34,197,94,0.20), transparent 55%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 55%)",
        }}
      >
        <Container maxWidth="md" sx={{ flex: 1 }}>
          {/* LOADING / ERROR DEL STAND */}
          {loadingStand && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Cargando información del stand...
              </Typography>
            </Box>
          )}

          {errorStand && !loadingStand && (
            <Alert severity="error">{errorStand}</Alert>
          )}

          {/* CONTENIDO SOLO SI HAY STAND */}
          {!loadingStand && !errorStand && stand && (
            <>
              {/* Hero estilo HomeTienda: tarjeta del stand */}
              <Paper
                elevation={0}
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid #d1fae5",
                  background:
                    "linear-gradient(135deg, #ecfdf3 0%, #ffffff 45%, #eff6ff 100%)",
                  boxShadow:
                    "0 18px 45px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.12)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "success.main",
                        fontSize: 30,
                        fontWeight: 800,
                      }}
                    >
                      {(stand.nombreComercial ?? "S").charAt(0)}
                    </Avatar>

                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          letterSpacing: 2,
                          color: "success.main",
                          fontWeight: 700,
                        }}
                      >
                        Stand del mercado mayorista
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ letterSpacing: "-0.03em" }}
                      >
                        {stand.nombreComercial ?? "Stand sin nombre"}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ mt: 0.5 }}
                      >
                        <Chip
                          label={
                            stand.nombreCategoriaStand ??
                            "Sin categoría configurada"
                          }
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#166534",
                            fontWeight: 600,
                            borderRadius: 999,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          📍 Bloque {stand.bloque ?? "-"} · Puesto{" "}
                          {stand.numeroStand ?? "-"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Rating y CTA similar a home */}
                  <Stack
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", sm: "flex-end" }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating
                        value={ratingPromedio}
                        precision={0.5}
                        readOnly
                        size="medium"
                      />
                      <Typography variant="h6" fontWeight={700}>
                        {ratingPromedio.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        · {totalReseñas} reseñas
                      </Typography>
                    </Stack>

                    <Button
                      variant="contained"
                      color="success"
                      sx={{
                        borderRadius: 999,
                        px: 3,
                        fontWeight: 700,
                        textTransform: "none",
                      }}
                      onClick={() => setTab("productos")}
                    >
                      Ver productos del stand
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {/* Tabs en un Paper limpio, como secciones de Home */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                }}
              >
                <Box sx={{ px: 3, pt: 2 }}>
                  <AppTabs
                    value={tab}
                    onChange={(v) => setTab(v as TabKey)}
                    items={STAND_TABS}
                    aria-label="secciones del perfil del stand"
                  />
                </Box>

                <Divider />

                {/* ===== TAB INFORMACIÓN ===== */}
                <Box sx={{ p: 3 }}>
                  <TabPanel current={tab} value="info">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Información del stand
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Propietario
                          </Typography>
                          <Typography variant="body1">
                            {stand.nombrePropietario ?? "No registrado"}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Descripción
                          </Typography>
                          <Typography variant="body1">
                            {stand.descripcionNegocio ??
                              "Este stand aún no tiene una descripción registrada."}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Horario de atención
                          </Typography>
                          <Typography variant="body1">
                            Lunes a Domingo, 4:00 a.m. - 2:00 p.m.
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Valoración promedio
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Rating
                              value={ratingPromedio}
                              precision={0.5}
                              readOnly
                              size="small"
                            />
                            <Typography variant="body2">
                              {ratingPromedio.toFixed(1)} · {totalReseñas}{" "}
                              reseñas
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </TabPanel>

                  {/* ===== TAB PRODUCTOS ===== */}
                  <TabPanel current={tab} value="productos">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} mb={2}>
                        Productos de este stand
                      </Typography>

                      {loadingProductos ? (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <CircularProgress size={24} />
                          <Typography sx={{ mt: 1 }} color="text.secondary">
                            Cargando productos del stand...
                          </Typography>
                        </Box>
                      ) : errorProductos ? (
                        <Alert severity="error">{errorProductos}</Alert>
                      ) : productosStand.length === 0 ? (
                        <Typography color="text.secondary">
                          Este stand aún no tiene productos publicados en el
                          directorio.
                        </Typography>
                      ) : (
                        <ProductsGrid
                          products={productosStand}
                          onViewStand={handleVerProducto}
                        />
                      )}
                    </Box>
                  </TabPanel>

                  {/* ===== TAB RESEÑAS ===== */}
                  <TabPanel current={tab} value="reseñas">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} mb={1}>
                        Reseñas de clientes
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      {loadingReseñas ? (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <CircularProgress size={24} />
                          <Typography sx={{ mt: 1 }} color="text.secondary">
                            Cargando reseñas...
                          </Typography>
                        </Box>
                      ) : errorReseñas ? (
                        <Alert severity="error">{errorReseñas}</Alert>
                      ) : reseñas.length === 0 ? (
                        <Typography color="text.secondary">
                          Aún no hay reseñas para este stand.
                        </Typography>
                      ) : (
                        <List>
                          {reseñas.map((r) => (
                            <Box key={r.id}>
                              <ListItem alignItems="flex-start">
                                <ListItemText
                                  primary={
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                    >
                                      <Typography fontWeight={600}>
                                        {r.autor}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {r.fecha}
                                      </Typography>
                                    </Stack>
                                  }
                                  secondary={
                                    <Box mt={0.5}>
                                      <Rating
                                        value={r.rating}
                                        readOnly
                                        size="small"
                                        sx={{ mb: 0.5 }}
                                      />
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                        sx={{ whiteSpace: "pre-wrap" }}
                                      >
                                        {r.comentario}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </Box>
                          ))}
                        </List>
                      )}

                      <Box mt={2}>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ borderRadius: 999, textTransform: "none" }}
                          onClick={() => console.log("Agregar reseña")}
                        >
                          Agregar reseña
                        </Button>
                      </Box>
                    </Box>
                  </TabPanel>
                </Box>
              </Paper>
            </>
          )}
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
