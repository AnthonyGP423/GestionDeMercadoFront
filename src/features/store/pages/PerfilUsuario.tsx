// src/pages/store/PerfilUsuario.tsx
import { useEffect, useState } from "react";
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
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";
import { AppTabs, TabPanel } from "../../../components/shared/AppTabs";
import { useAuth } from "../../../auth/useAuth";
import http from "../../../api/httpClient";

type TabKey = "perfil" | "favoritos" | "comentarios" | "configuracion";

const PERFIL_TABS = [
  { value: "perfil", label: "Perfil" },
  { value: "favoritos", label: "Stands favoritos" },
  { value: "comentarios", label: "Mis comentarios" },
  { value: "configuracion", label: "Configuración" },
];

// ==== TIPOS ====

type UsuarioPerfil = {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono?: string | null;
  fechaRegistro?: string | null;
};

type StandFavorito = {
  idStand: number;
  nombreStand: string;
  bloque: string;
  numeroStand: string;
  categoriaStand?: string | null;
};

type ComentarioStand = {
  id: number;
  standNombre: string;
  standId?: number;
  fecha: string;
  comentario: string;
  rating: number;
};

export default function PerfilUsuario() {
  const [tab, setTab] = useState<TabKey>("perfil");
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  // ===== PERFIL DE USUARIO =====
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  // ===== FAVORITOS =====
  const [favoritos, setFavoritos] = useState<StandFavorito[]>([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);
  const [errorFavoritos, setErrorFavoritos] = useState<string | null>(null);

  // ===== COMENTARIOS =====
  const [comentarios, setComentarios] = useState<ComentarioStand[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState<string | null>(null);
  const [totalComentarios, setTotalComentarios] = useState<number>(0);

  // ==== 1) PERFIL DEL USUARIO LOGUEADO ====
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoadingPerfil(true);
        setErrorPerfil(null);

        // Si no hay token, solo mostramos datos mínimos del contexto
        if (!token) {
          setPerfil({
            id: 0,
            nombreCompleto: user?.nombreCompleto || user?.email || "Usuario",
            email: user?.email || "sin-correo@ejemplo.com",
            telefono: null,
            fechaRegistro: null,
          });
          setLoadingPerfil(false);
          return;
        }

        const resp = await http.get("/api/public/usuarios/me");
        const u = resp.data;

        const mapped: UsuarioPerfil = {
          id: u.id,
          nombreCompleto:
            u.nombreCompleto ||
            `${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim() ||
            user?.nombreCompleto ||
            user?.email ||
            "Usuario",
          email: u.email || user?.email || "sin-correo@ejemplo.com",
          telefono: u.telefono ?? null,
          fechaRegistro: u.fechaRegistro ?? null,
        };

        setPerfil(mapped);
      } catch (e: any) {
        console.error(e);
        if (e?.response?.status === 401) {
          setErrorPerfil("Tu sesión ha expirado. Inicia sesión nuevamente.");
          // Si quieres que lo saque directo al login:
          // logout();
          // navigate("/login");
        } else {
          setErrorPerfil("No se pudo cargar la información de tu perfil.");
        }

        if (!perfil) {
          setPerfil({
            id: 0,
            nombreCompleto: user?.nombreCompleto || user?.email || "Usuario",
            email: user?.email || "sin-correo@ejemplo.com",
            telefono: null,
            fechaRegistro: null,
          });
        }
      } finally {
        setLoadingPerfil(false);
      }
    };

    fetchPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ==== 2) FAVORITOS DEL USUARIO ====
  useEffect(() => {
    if (!token) return;

    const fetchFavoritos = async () => {
      try {
        setLoadingFavoritos(true);
        setErrorFavoritos(null);

        const resp = await http.get("/api/public/usuarios/mis-favoritos");
        const data: any[] = resp.data ?? [];

        const mapped: StandFavorito[] = data.map((s) => ({
          idStand: s.idStand ?? s.id,
          nombreStand: s.nombreStand ?? s.nombreComercial ?? "Stand sin nombre",
          bloque: s.bloque ?? "-",
          numeroStand: s.numeroStand ?? "-",
          categoriaStand: s.categoriaStand ?? s.nombreCategoriaStand ?? null,
        }));

        setFavoritos(mapped);
      } catch (e: any) {
        console.error(e);
        if (e?.response?.status === 401) {
          setErrorFavoritos("Tu sesión ha expirado. Inicia sesión nuevamente.");
        } else {
          setErrorFavoritos("No se pudieron cargar tus stands favoritos.");
        }
      } finally {
        setLoadingFavoritos(false);
      }
    };

    fetchFavoritos();
  }, [token]);

  // ==== 3) COMENTARIOS DEL USUARIO ====
  useEffect(() => {
    if (!token) return;

    const fetchComentarios = async () => {
      try {
        setLoadingComentarios(true);
        setErrorComentarios(null);

        const resp = await http.get(
          "/api/public/calificaciones/mis-comentarios",
          {
            params: {
              page: 0,
              size: 10,
            },
          }
        );

        const page = resp.data;
        const content: any[] = page?.content ?? [];

        const mapped: ComentarioStand[] = content.map((c) => ({
          id: c.idCalificacion ?? c.id,
          standNombre: c.nombreStand ?? c.stand?.nombreComercial ?? "Stand",
          standId: c.idStand ?? c.stand?.id,
          fecha: c.fechaRegistro ?? c.fecha ?? "",
          comentario: c.comentario ?? "",
          rating: c.puntuacion ?? c.valor ?? 0,
        }));

        setComentarios(mapped);
        setTotalComentarios(page?.totalElements ?? mapped.length);
      } catch (e: any) {
        console.error(e);
        if (e?.response?.status === 401) {
          setErrorComentarios(
            "Tu sesión ha expirado. Inicia sesión nuevamente."
          );
        } else {
          setErrorComentarios("No se pudieron cargar tus comentarios.");
        }
      } finally {
        setLoadingComentarios(false);
      }
    };

    fetchComentarios();
  }, [token]);

  const handleVerStand = (idStand?: number) => {
    if (!idStand) return;
    navigate(`/tienda/stand/${idStand}`);
  };

  const displayNombre =
    perfil?.nombreCompleto ||
    user?.nombreCompleto ||
    user?.email ||
    "Mi perfil";

  const displayEmail = perfil?.email || user?.email;

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
        {/* CABECERA DEL PERFIL */}
        {loadingPerfil ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Cargando tu perfil...
            </Typography>
          </Box>
        ) : (
          <>
            {errorPerfil && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {errorPerfil}
              </Alert>
            )}

            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "#16a34a",
                  fontWeight: 700,
                  fontSize: 28,
                }}
              >
                {displayNombre.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Mi perfil
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {displayEmail}
                </Typography>

                <Stack direction="row" spacing={1} mt={1} alignItems="center">
                  {user?.rol && (
                    <Chip
                      label={
                        user.rol.toUpperCase().startsWith("CLIENTE")
                          ? "Cliente"
                          : user.rol
                      }
                      size="small"
                      sx={{
                        bgcolor: "#ecfdf3",
                        color: "#166534",
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                  )}
                  {perfil?.fechaRegistro && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      Miembro desde: {perfil.fechaRegistro}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* TABS */}
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
                <Stack spacing={1.8}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nombre completo
                    </Typography>
                    <Typography variant="body1">
                      {perfil?.nombreCompleto}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Correo electrónico
                    </Typography>
                    <Typography variant="body1">
                      {perfil?.email || "No registrado"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body1">
                      {perfil?.telefono || "No registrado"}
                    </Typography>
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

                {loadingFavoritos ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ mt: 1 }} color="text.secondary">
                      Cargando tus stands favoritos...
                    </Typography>
                  </Box>
                ) : errorFavoritos ? (
                  <Alert severity="error">{errorFavoritos}</Alert>
                ) : favoritos.length === 0 ? (
                  <Typography color="text.secondary">
                    Aún no tienes stands favoritos. Guarda tus puestos
                    preferidos para encontrarlos más rápido.
                  </Typography>
                ) : (
                  <List>
                    {favoritos.map((s) => (
                      <Box key={s.idStand}>
                        <ListItem
                          secondaryAction={
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleVerStand(s.idStand)}
                              sx={{ textTransform: "none", borderRadius: 999 }}
                            >
                              Ver stand
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={
                              <Typography fontWeight={600}>
                                {s.nombreStand}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Bloque {s.bloque} · Puesto {s.numeroStand}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {s.categoriaStand || "Sin categoría"}
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
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Comentarios que has dejado
                  </Typography>
                  {totalComentarios > 0 && (
                    <Chip
                      size="small"
                      label={`${totalComentarios} en total`}
                      sx={{
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                  )}
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {loadingComentarios ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ mt: 1 }} color="text.secondary">
                      Cargando tus comentarios...
                    </Typography>
                  </Box>
                ) : errorComentarios ? (
                  <Alert severity="error">{errorComentarios}</Alert>
                ) : comentarios.length === 0 ? (
                  <Typography color="text.secondary">
                    Aún no has comentado en ningún stand. Después de comprar,
                    comparte tu experiencia para ayudar a otros clientes.
                  </Typography>
                ) : (
                  <List>
                    {comentarios.map((c) => (
                      <Box key={c.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography fontWeight={600}>
                                  {c.standNombre}
                                </Typography>
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
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  mb={0.5}
                                >
                                  <Rating
                                    value={c.rating}
                                    size="small"
                                    readOnly
                                  />
                                  {c.standId && (
                                    <Button
                                      size="small"
                                      variant="text"
                                      onClick={() => handleVerStand(c.standId)}
                                      sx={{
                                        textTransform: "none",
                                        fontSize: 12,
                                      }}
                                    >
                                      Ver stand
                                    </Button>
                                  )}
                                </Stack>
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

            {/* ====== TAB CONFIGURACIÓN ====== */}
            <TabPanel current={tab} value="configuracion">
              <Box mt={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Configuración de tu cuenta
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Seguridad
                    </Typography>
                    <Stack direction="row" spacing={1.5} mt={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", borderRadius: 999 }}
                        onClick={() =>
                          console.log("Ir a pantalla: cambiar contraseña")
                        }
                      >
                        Cambiar contraseña
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Datos personales
                    </Typography>
                    <Stack direction="row" spacing={1.5} mt={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", borderRadius: 999 }}
                        onClick={() =>
                          console.log("Ir a pantalla: editar datos personales")
                        }
                      >
                        Editar datos personales
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Preferencias
                    </Typography>
                    <Stack direction="row" spacing={1.5} mt={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", borderRadius: 999 }}
                        onClick={() =>
                          console.log(
                            "Ir a pantalla: configurar notificaciones"
                          )
                        }
                      >
                        Notificaciones
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", borderRadius: 999 }}
                        onClick={() =>
                          console.log("Ir a pantalla: preferencias de idioma")
                        }
                      >
                        Idioma
                      </Button>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" fontWeight={600} color="error">
                      Zona peligrosa
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={0.5}
                    >
                      Si eliminas tu cuenta, se perderán tus reseñas y
                      favoritos. Esta acción no se puede deshacer.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        borderRadius: 999,
                        borderWidth: 1.5,
                      }}
                      onClick={() =>
                        console.log("Abrir modal para eliminar cuenta")
                      }
                    >
                      Eliminar mi cuenta
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </TabPanel>
          </>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}
