// src/pages/store/PerfilStand.tsx
import { useState } from "react";
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
} from "@mui/material";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

import { AppTabs, TabPanel } from "../../components/shared/AppTabs";
import ProductsGrid, {
  StoreProduct,
} from "../../components/layout/store/ProductsGrid";

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

export default function PerfilStand() {
  const [tab, setTab] = useState<TabKey>("info");

  // 👉 Datos de ejemplo del stand
  const stand = {
    nombre: "Frutas del Sol",
    bloque: "A",
    puesto: "15",
    categoria: "Frutas y Verduras",
    propietario: "Juan Pérez",
    descripcion:
      "Stand especializado en frutas frescas de temporada, seleccionadas de productores locales. Atención desde las 4:00 a.m. todos los días.",
    horario: "Lunes a Domingo, 4:00 a.m. - 2:00 p.m.",
    promedioRating: 4.7,
    totalReseñas: 86,
  };

  // 👉 Productos de este stand (usando StoreProduct y ProductsGrid)
  const productosStand: StoreProduct[] = [
    {
      id: 1,
      nombre: "Mango Tommy",
      categoriaTag: "Frutas",
      stand: "Frutas del Sol · Bloque A, Puesto 15",
      precio: 2.1,
      unidad: "kg",
      moneda: "S/.",
      esOferta: true,
      descuentoPorc: 20,
      imageUrl:
        "https://th.bing.com/th/id/R.b9a9572162d4f39da9ba36e0528585aa?rik=Hz%2bbf9D8xsvNag&pid=ImgRaw&r=0",
    },
    {
      id: 2,
      nombre: "Plátano de Isla",
      categoriaTag: "Frutas",
      stand: "Frutas del Sol · Bloque A, Puesto 15",
      precio: 1.6,
      unidad: "kg",
      moneda: "S/.",
    },
    {
      id: 3,
      nombre: "Piña Golden",
      categoriaTag: "Frutas",
      stand: "Frutas del Sol · Bloque A, Puesto 15",
      precio: 3.2,
      unidad: "unidad",
      moneda: "S/.",
    },
  ];

  // 👉 Reseñas de ejemplo
  const reseñas: ReseñaStand[] = [
    {
      id: 1,
      autor: "María López",
      fecha: "Hace 2 días",
      comentario: "Fruta muy fresca y precios justos. Siempre compro aquí.",
      rating: 5,
    },
    {
      id: 2,
      autor: "Carlos Ramos",
      fecha: "Hace 1 semana",
      comentario: "Buena calidad, aunque a veces hay fila larga.",
      rating: 4,
    },
  ];

  const handleVerProducto = (product: StoreProduct) => {
    console.log("Ver producto:", product.nombre);
    // luego: navigate(`/tienda/producto/${product.id}`)
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
        {/* Cabecera del stand */}
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "success.main" }}>
            {stand.nombre.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {stand.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bloque {stand.bloque} · Puesto {stand.puesto}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stand.categoria}
            </Typography>
          </Box>
        </Stack>

        {/* Tabs */}
        <AppTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          items={STAND_TABS}
          aria-label="secciones del perfil del stand"
        />

        {/* ===== TAB INFORMACIÓN ===== */}
        <TabPanel current={tab} value="info">
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Información del stand
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Propietario
                </Typography>
                <Typography variant="body1">{stand.propietario}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Descripción
                </Typography>
                <Typography variant="body1">{stand.descripcion}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Horario de atención
                </Typography>
                <Typography variant="body1">{stand.horario}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Valoración promedio
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Rating
                    value={stand.promedioRating}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2">
                    {stand.promedioRating.toFixed(1)} · {stand.totalReseñas}{" "}
                    reseñas
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* ===== TAB PRODUCTOS ===== */}
        <TabPanel current={tab} value="productos">
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Productos de este stand
            </Typography>

            <ProductsGrid
              products={productosStand}
              onViewStand={handleVerProducto}
            />
          </Box>
        </TabPanel>

        {/* ===== TAB RESEÑAS ===== */}
        <TabPanel current={tab} value="reseñas">
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Reseñas de clientes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {reseñas.length === 0 ? (
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
                          <Stack direction="row" justifyContent="space-between">
                            <Typography fontWeight={600}>{r.autor}</Typography>
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

            {/* Botón simple para “agregar reseña” (luego lo conectas) */}
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => console.log("Agregar reseña")}
              >
                Agregar reseña
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Container>

      <PublicFooter />
    </Box>
  );
}
