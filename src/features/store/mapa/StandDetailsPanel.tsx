// src/features/store/mapa/StandDetailsPanel.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  alpha,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../../auth/useAuth";
import { favoritosApi } from "../../../api/cliente/favoritosApi";

type StandEstado = "ABIERTO" | "CERRADO" | "CLAUSURADO" | "DISPONIBLE";

type Stand = {
  id: number;
  bloque: string;
  pasillo?: 1 | 2;
  orden?: number;
  numero: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;
  telefonoContacto?: string;
};

type StandDetailsPanelProps = {
  stand: Stand | null;
  onVerPerfil: () => void;
  color?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const isClienteRole = (rol?: string) => {
  const r = String(rol ?? "").toUpperCase();
  return r === "CLIENTE" || r === "ROLE_CLIENTE" || r.includes("CLIENTE");
};

export default function StandDetailsPanel({
  stand,
  onVerPerfil,
  color = "#16a34a",
}: StandDetailsPanelProps) {
  // ✅ Hooks SIEMPRE arriba (nada de returns antes)
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth() as any;

  const esCliente = useMemo(() => {
    return Boolean(isAuthenticated && isClienteRole(user?.rol));
  }, [isAuthenticated, user?.rol]);

  const accentColor = color;
  const standId = stand?.id ?? null; // ✅ clave para evitar dependencias raras

  // ===== rating público =====
  const [ratingPromedio, setRatingPromedio] = useState<number>(0);
  const [totalReseñas, setTotalReseñas] = useState<number>(0);
  const [loadingRating, setLoadingRating] = useState(false);

  // ===== favoritos =====
  const [isFav, setIsFav] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const fetchRatingPublico = async (idStand: number) => {
    try {
      setLoadingRating(true);
      const resp = await axios.get(
        `${API_BASE_URL}/api/public/calificaciones/stand/${idStand}/promedio`
      );
      const d = resp.data || {};
      const promedio = d.promedio ?? d.promedioCalificacion ?? 0;
      const total =
        d.totalCalificaciones ?? d.totalResenas ?? d.totalReseñas ?? 0;

      setRatingPromedio(Number(promedio));
      setTotalReseñas(Number(total));
    } catch {
      setRatingPromedio(0);
      setTotalReseñas(0);
    } finally {
      setLoadingRating(false);
    }
  };

  const syncFavorito = async (idStand: number) => {
    if (!esCliente) {
      setIsFav(false);
      return;
    }
    try {
      const resp = await favoritosApi.listar();
      const list = resp.data ?? [];
      setIsFav(list.some((x) => Number(x.idStand) === Number(idStand)));
    } catch {
      setIsFav(false);
    }
  };

  const toggleFavorito = async () => {
    if (!standId) return;

    if (!esCliente) {
      navigate("/cliente/login", { state: { from: location.pathname } });
      return;
    }

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
      await syncFavorito(standId);
    } finally {
      setLoadingFav(false);
    }
  };

  // ✅ useEffect SIEMPRE se ejecuta (aunque haga early return luego)
  useEffect(() => {
    if (!standId) return;
    fetchRatingPublico(standId);
    syncFavorito(standId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standId, esCliente]);

  // ✅ AHORA sí: return condicional
  if (!stand) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "1px solid #f1f5f9",
          bgcolor: "white",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: alpha(accentColor, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <MapIcon sx={{ fontSize: 40, color: accentColor }} />
        </Box>

        <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 800, mb: 1 }}>
          Selecciona un Stand
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "#64748b", maxWidth: 280, lineHeight: 1.6, mb: 2 }}
        >
          Haz clic en cualquier stand del mapa para ver detalles, calificación y
          acceder al perfil completo.
        </Typography>

        <Chip
          label="Mapa Interactivo"
          size="small"
          sx={{
            bgcolor: alpha(accentColor, 0.1),
            color: accentColor,
            fontWeight: 700,
            border: "1px solid",
            borderColor: alpha(accentColor, 0.2),
            borderRadius: 999,
          }}
        />
      </Paper>
    );
  }

  // ===== Lógica UI =====
  const estadoUpper = (stand.estado || "").toUpperCase() as StandEstado;

  const esAbierto = estadoUpper === "ABIERTO";
  const esDisponible = estadoUpper === "DISPONIBLE";

  const estadoLabel = (() => {
    if (estadoUpper === "ABIERTO") return "En funcionamiento";
    if (estadoUpper === "CERRADO") return "Cerrado temporalmente";
    if (estadoUpper === "CLAUSURADO") return "Clausurado";
    if (estadoUpper === "DISPONIBLE") return "Espacio disponible";
    return stand.estado;
  })();

  const estadoChipColor = esAbierto ? "success" : esDisponible ? "default" : "warning";
  const estadoIcon = esAbierto ? <CheckCircleIcon /> : <PendingIcon />;

  const palette = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#22c55e"];
  const bloqueKey = (stand.bloque || "").toString().toUpperCase();
  const bloqueColor =
    palette[
      bloqueKey ? (bloqueKey.charCodeAt(0) - 65 + palette.length) % palette.length : 0
    ] || accentColor;

  const footerDotColor = esAbierto ? "#10b981" : esDisponible ? "#f59e0b" : "#f97316";
  const footerLabelPrefix = esAbierto ? "Stand activo · " : esDisponible ? "Disponible · " : "No disponible · ";

  const mostrarDatosContacto = !esDisponible;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #f1f5f9",
        bgcolor: "white",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(bloqueColor, 0.14)} 0%, ${alpha(bloqueColor, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(bloqueColor, 0.15)}`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${bloqueColor} 0%, ${alpha(bloqueColor, 0.7)} 100%)`,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box>
            <Chip
              label={`Bloque ${stand.bloque}`}
              size="small"
              sx={{
                bgcolor: alpha(bloqueColor, 0.18),
                color: bloqueColor,
                fontWeight: 800,
                mb: 1,
                border: "1px solid",
                borderColor: alpha(bloqueColor, 0.28),
                borderRadius: 999,
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.05 }}>
              {stand.numero}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {!esDisponible && (
              <Tooltip
                title={
                  esCliente
                    ? isFav
                      ? "Quitar de favoritos"
                      : "Guardar en favoritos"
                    : "Inicia sesión para guardar"
                }
              >
                <span>
                  <IconButton
                    onClick={toggleFavorito}
                    disabled={loadingFav}
                    sx={{
                      borderRadius: 999,
                      bgcolor: "#ffffff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 8px 22px rgba(15,23,42,0.10)",
                    }}
                  >
                    {loadingFav ? (
                      <CircularProgress size={18} />
                    ) : isFav ? (
                      <FavoriteIcon sx={{ color: "#ef4444" }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: "#0f172a" }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: esDisponible ? "#94a3b8" : bloqueColor,
                boxShadow: `0 6px 20px ${alpha(esDisponible ? "#94a3b8" : bloqueColor, 0.3)}`,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 28 }} />
            </Avatar>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 2 }}>
          <Chip
            icon={estadoIcon}
            label={estadoLabel}
            color={estadoChipColor as any}
            size="small"
            sx={{ fontWeight: 800, borderRadius: 999, px: 1.25 }}
          />

          {!esDisponible && (
            <Chip
              icon={<StarRoundedIcon />}
              label={
                loadingRating
                  ? "Cargando rating..."
                  : totalReseñas > 0
                  ? `${ratingPromedio.toFixed(1)} · ${totalReseñas} reseñas`
                  : "Sin reseñas"
              }
              size="small"
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: "#ffffff",
                border: "1px solid rgba(15,23,42,0.08)",
                "& .MuiChip-icon": { color: "#f59e0b" },
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Cuerpo */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#64748b",
              fontWeight: 700,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <BusinessIcon sx={{ fontSize: 18 }} />
            Nombre comercial
          </Typography>
          <Typography variant="h5" sx={{ color: "#0f172a", fontWeight: 900, lineHeight: 1.2 }}>
            {stand.nombreComercial}
          </Typography>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: "#f1f5f9" }} />

        <Stack spacing={2.25}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.25,
                bgcolor: alpha("#3b82f6", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3b82f6",
                flexShrink: 0,
              }}
            >
              <CategoryIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block" }}>
                Rubro / Categoría
              </Typography>
              <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 800 }}>
                {stand.rubro}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.25,
                bgcolor: alpha("#8b5cf6", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8b5cf6",
                flexShrink: 0,
              }}
            >
              <LocationOnIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block" }}>
                Ubicación
              </Typography>
              <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 800 }}>
                Bloque {stand.bloque}
                {stand.pasillo && `, Pasillo ${stand.pasillo}`}
              </Typography>
            </Box>
          </Box>

          {mostrarDatosContacto && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.25,
                  bgcolor: alpha("#10b981", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981",
                  flexShrink: 0,
                }}
              >
                <PhoneIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block" }}>
                  Contacto
                </Typography>
                <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: 800 }}>
                  {stand.telefonoContacto ?? "No disponible"}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2.5, borderColor: "#f1f5f9" }} />

        <Button
          variant={esDisponible ? "outlined" : "contained"}
          fullWidth
          size="large"
          endIcon={esDisponible ? undefined : <ArrowForwardIcon />}
          onClick={esDisponible ? undefined : onVerPerfil}
          sx={{
            borderRadius: 3,
            py: 1.35,
            fontWeight: 900,
            textTransform: "none",
            fontSize: "1rem",
            ...(esDisponible
              ? {
                  borderColor: alpha(bloqueColor, 0.35),
                  color: bloqueColor,
                  "&:hover": { borderColor: bloqueColor, bgcolor: alpha(bloqueColor, 0.06) },
                }
              : {
                  background: `linear-gradient(135deg, ${bloqueColor} 0%, ${alpha(bloqueColor, 0.82)} 100%)`,
                  boxShadow: `0 10px 25px ${alpha(bloqueColor, 0.3)}`,
                  "&:hover": { boxShadow: `0 14px 30px ${alpha(bloqueColor, 0.4)}` },
                }),
          }}
        >
          {esDisponible ? "Solicitar información para alquilar" : "Ver perfil completo del stand"}
        </Button>
      </Box>

      <Box sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: footerDotColor }} />
          {footerLabelPrefix}Actualizado recientemente
        </Typography>
      </Box>
    </Paper>
  );
}