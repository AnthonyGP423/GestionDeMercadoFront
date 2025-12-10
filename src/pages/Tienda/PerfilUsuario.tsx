// src/pages/store/PerfilUsuario.tsx
import { useState } from "react";
import {
  Box,
  Container,
  Avatar,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Button,
  Rating,
  Divider,
} from "@mui/material";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";
import { AppTabs, TabPanel } from "../../components/shared/AppTabs";

type TabKey = "perfil" | "favoritos" | "comentarios";

const PERFIL_TABS = [
  { value: "perfil", label: "Perfil" },
  { value: "favoritos", label: "Stands favoritos" },
  { value: "comentarios", label: "Comentarios a stands" },
];

type StandFavorito = {
  id: number;
  nombre: string;
  ubicacion: string;
  categoria: string;
};

type ComentarioStand = {
  id: number;
  stand: string;
  fecha: string;
  comentario: string;
  rating: number;
};

export default function PerfilUsuario() {
  const [tab, setTab] = useState<TabKey>("perfil");

  // Datos simples de ejemplo
  const usuario = {
    nombre: "Anthony Gutierrez",
    correo: "anthony@example.com",
  };

  const standsFavoritos: StandFavorito[] = [
    {
      id: 1,
      nombre: "Frutas del Sol",
      ubicacion: "Bloque A - Puesto 15",
      categoria: "Frutas y Verduras",
    },
    {
      id: 2,
      nombre: "Lácteos del Valle",
      ubicacion: "Bloque D - Puesto 5",
      categoria: "Lácteos",
    },
  ];

  const comentarios: ComentarioStand[] = [
    {
      id: 1,
      stand: "Frutas del Sol",
      fecha: "Hace 3 días",
      comentario: "Buena atención y la fruta fresca.",
      rating: 5,
    },
    {
      id: 2,
      stand: "Lácteos del Valle",
      fecha: "Hace 1 semana",
      comentario: "El queso está rico, pero a veces hay cola.",
      rating: 4,
    },
  ];

  const handleVerStand = (id: number) => {
    console.log("Ver stand", id);
    // luego: navigate(`/tienda/stand/${id}`)
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
        {/* Cabecera simple */}
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Avatar sx={{ width: 64, height: 64 }}>
            {usuario.nombre.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Mi perfil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usuario.correo}
            </Typography>
          </Box>
        </Stack>

        {/* Tabs */}
        <AppTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          items={PERFIL_TABS}
          aria-label="secciones del perfil de usuario"
        />

        {/* ====== TAB PERFIL ====== */}
        <TabPanel current={tab} value="perfil">
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Información básica
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nombre completo
                </Typography>
                <Typography variant="body1">{usuario.nombre}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Correo electrónico
                </Typography>
                <Typography variant="body1">{usuario.correo}</Typography>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* ====== TAB STANDS FAVORITOS ====== */}
        <TabPanel current={tab} value="favoritos">
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Stands que te gustan
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {standsFavoritos.length === 0 ? (
              <Typography color="text.secondary">
                Aún no tienes stands favoritos.
              </Typography>
            ) : (
              <List>
                {standsFavoritos.map((s) => (
                  <Box key={s.id}>
                    <ListItem
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleVerStand(s.id)}
                        >
                          Ver stand
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography fontWeight={600}>{s.nombre}</Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {s.ubicacion}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {s.categoria}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </TabPanel>

        {/* ====== TAB COMENTARIOS ====== */}
        <TabPanel current={tab} value="comentarios">
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Comentarios que has dejado
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {comentarios.length === 0 ? (
              <Typography color="text.secondary">
                Aún no has comentado en ningún stand.
              </Typography>
            ) : (
              <List>
                {comentarios.map((c) => (
                  <Box key={c.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between">
                            <Typography fontWeight={600}>{c.stand}</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {c.fecha}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Rating
                              value={c.rating}
                              size="small"
                              readOnly
                              sx={{ mb: 0.5 }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {c.comentario}
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
          </Box>
        </TabPanel>
      </Container>

      <PublicFooter />
    </Box>
  );
}
