// src/components/mapa/StandDetailsPanel.tsx
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
import ScheduleIcon from "@mui/icons-material/Schedule";

type StandEstado = "ABIERTO" | "CERRADO" | "CLAUSURADO" | "DISPONIBLE";

type Stand = {
  id: number;
  // 👇 bloque dinámico según la BD (A, B, C... o lo que definas)
  bloque: string;
  pasillo?: 1 | 2;
  orden?: number;
  // ahora usamos "numero" (no numeroStand) en el panel
  numero: string;
  nombreComercial: string;
  rubro: string;
  estado: StandEstado;
  telefonoContacto?: string;
  horarioAtencion?: string;
};

type StandDetailsPanelProps = {
  stand: Stand | null;
  onVerPerfil: () => void;
  // color base opcional (sigue funcionando como antes)
  color?: string;
};

export default function StandDetailsPanel({
  stand,
  onVerPerfil,
  color = "#16a34a",
}: StandDetailsPanelProps) {
  const accentColor = color;

  // ======== ESTADO "SIN SELECCIÓN" ========
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
          transition: "all 0.3s ease",
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
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.05)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        >
          <MapIcon sx={{ fontSize: 40, color: accentColor }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "#1e293b",
            fontWeight: 700,
            mb: 1,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Selecciona un Stand
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#64748b",
            maxWidth: 280,
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          Haz clic en cualquier stand del mapa para ver información detallada,
          productos disponibles y datos de contacto.
        </Typography>
        <Chip
          label="Mapa Interactivo"
          size="small"
          sx={{
            bgcolor: alpha(accentColor, 0.1),
            color: accentColor,
            fontWeight: 600,
            border: "1px solid",
            borderColor: alpha(accentColor, 0.2),
            mt: 1,
          }}
        />
      </Paper>
    );
  }

  // ======== LÓGICA DE ESTADOS (ABIERTO / CERRADO / CLAUSURADO / DISPONIBLE) ========
  const estadoUpper = (stand.estado || "").toUpperCase() as StandEstado;

  const esAbierto = estadoUpper === "ABIERTO";
  const esCerrado = estadoUpper === "CERRADO";
  const esClausurado = estadoUpper === "CLAUSURADO";
  const esDisponible = estadoUpper === "DISPONIBLE";

  const estadoLabel = (() => {
    if (esAbierto) return "En funcionamiento (abierto)";
    if (esCerrado) return "Cerrado temporalmente";
    if (esClausurado) return "Clausurado";
    if (esDisponible) return "Espacio disponible";
    return stand.estado;
  })();

  const estadoChipColor =
    esAbierto ? "success" : esDisponible ? "default" : "warning";

  const estadoIcon = esAbierto ? <CheckCircleIcon /> : <PendingIcon />;

  // ======== COLORES DE BLOQUE DINÁMICOS ========
  const bloqueColors: Record<string, string> = {
    A: "#10b981", // Verde
    B: "#ef4444", // Rojo
    C: "#3b82f6", // Azul
    D: "#8b5cf6", // Violeta
  };

  const palette = [
    "#10b981",
    "#3b82f6",
    "#f97316",
    "#8b5cf6",
    "#ec4899",
    "#22c55e",
  ];

  const bloqueKey = (stand.bloque || "").toString().toUpperCase();
  const autoColor =
    palette[
      bloqueKey
        ? (bloqueKey.charCodeAt(0) - 65 + palette.length) % palette.length
        : 0
    ];

  const bloqueColor = bloqueColors[bloqueKey] || autoColor || accentColor;

  // Footer: texto + color según estado
  const footerDotColor = esAbierto
    ? "#10b981"
    : esDisponible
    ? "#f59e0b"
    : "#f97316";

  const footerLabelPrefix = esAbierto
    ? "Stand activo · "
    : esDisponible
    ? "Disponible · "
    : "No disponible · ";

  // ¿Mostramos info de contacto? sólo si NO es "DISPONIBLE"
  const mostrarDatosContacto = !esDisponible;

  // ======== RENDER ========
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #f1f5f9",
        bgcolor: "white",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 16px 48px rgba(15, 23, 42, 0.15)",
        },
      }}
    >
      {/* HEADER CON GRADIENTE */}
      <Box
        sx={{
          p: 3,
          bgcolor: alpha(bloqueColor, 0.08),
          background: `linear-gradient(135deg, ${alpha(
            bloqueColor,
            0.12
          )} 0%, ${alpha(bloqueColor, 0.04)} 100%)`,
          borderBottom: `1px solid ${alpha(bloqueColor, 0.15)}`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${bloqueColor} 0%, ${alpha(
              bloqueColor,
              0.7
            )} 100%)`,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Chip
              label={`Bloque ${stand.bloque}`}
              size="small"
              sx={{
                bgcolor: alpha(bloqueColor, 0.2),
                color: bloqueColor,
                fontWeight: 700,
                mb: 1,
                border: "1px solid",
                borderColor: alpha(bloqueColor, 0.3),
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#1e293b",
                fontFamily: '"Inter", sans-serif',
                lineHeight: 1.1,
              }}
            >
              {stand.numero}
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: esDisponible ? "#94a3b8" : bloqueColor,
              boxShadow: `0 6px 20px ${alpha(
                esDisponible ? "#94a3b8" : bloqueColor,
                0.3
              )}`,
            }}
          >
            <StorefrontIcon sx={{ fontSize: 28 }} />
          </Avatar>
        </Stack>

        <Chip
          icon={estadoIcon}
          label={estadoLabel}
          color={estadoChipColor as any}
          size="small"
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 1.5,
            "& .MuiChip-icon": {
              fontSize: 16,
            },
          }}
        />
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{ p: 3 }}>
        {/* NOMBRE COMERCIAL */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#64748b",
              fontWeight: 600,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <BusinessIcon sx={{ fontSize: 18 }} />
            Nombre Comercial
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#1e293b",
              fontWeight: 800,
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.2,
            }}
          >
            {stand.nombreComercial}
          </Typography>
        </Box>

        <Divider sx={{ my: 3, borderColor: "#f1f5f9" }} />

        {/* INFORMACIÓN DETALLADA */}
        <Stack spacing={2.5}>
          {/* RUBRO */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
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
              <Typography
                variant="caption"
                sx={{ color: "#64748b", fontWeight: 500, display: "block" }}
              >
                Rubro / Categoría
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#1e293b", fontWeight: 700 }}
              >
                {stand.rubro}
              </Typography>
            </Box>
          </Box>

          {/* UBICACIÓN */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
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
              <Typography
                variant="caption"
                sx={{ color: "#64748b", fontWeight: 500, display: "block" }}
              >
                Ubicación
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#1e293b", fontWeight: 700 }}
              >
                Bloque {stand.bloque}
                {stand.pasillo && `, Pasillo ${stand.pasillo}`}
              </Typography>
            </Box>
          </Box>

          {/* INFORMACIÓN ADICIONAL PARA STANDS NO DISPONIBLES (ocupados/cerrados/clausurados) */}
          {mostrarDatosContacto && (
            <>
              {/* TELÉFONO */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
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
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 500, display: "block" }}
                  >
                    Contacto
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#1e293b", fontWeight: 700 }}
                  >
                    {stand.telefonoContacto ?? "No disponible"}
                  </Typography>
                </Box>
              </Box>

              {/* HORARIO */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha("#f59e0b", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f59e0b",
                    flexShrink: 0,
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 500, display: "block" }}
                  >
                    Horario de atención
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#1e293b", fontWeight: 700 }}
                  >
                    {stand.horarioAtencion ?? "No especificado"}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Stack>

        <Divider sx={{ my: 3, borderColor: "#f1f5f9" }} />

        {/* BOTÓN DE ACCIÓN PRINCIPAL */}
        <Button
          variant={esDisponible ? "outlined" : "contained"}
          fullWidth
          size="large"
          endIcon={esDisponible ? undefined : <ArrowForwardIcon />}
          onClick={esDisponible ? undefined : onVerPerfil}
          sx={{
            borderRadius: 3,
            py: 1.5,
            fontWeight: 700,
            textTransform: "none",
            fontSize: "1rem",
            transition: "all 0.3s ease",
            ...(esDisponible
              ? {
                  borderColor: alpha(bloqueColor, 0.3),
                  color: bloqueColor,
                  "&:hover": {
                    borderColor: bloqueColor,
                    bgcolor: alpha(bloqueColor, 0.05),
                    transform: "translateY(-2px)",
                  },
                }
              : {
                  background: `linear-gradient(135deg, ${bloqueColor} 0%, ${alpha(
                    bloqueColor,
                    0.8
                  )} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(bloqueColor, 0.4)}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(
                      bloqueColor,
                      0.9
                    )} 0%, ${alpha(bloqueColor, 0.7)} 100%)`,
                    boxShadow: `0 8px 24px ${alpha(bloqueColor, 0.6)}`,
                    transform: "translateY(-2px)",
                  },
                }),
          }}
        >
          {esDisponible
            ? "Solicitar información para alquilar"
            : "Ver perfil completo del stand"}
        </Button>

        {/* NOTA PARA STANDS DISPONIBLES */}
        {esDisponible && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: alpha("#f59e0b", 0.08),
              border: `1px solid ${alpha("#f59e0b", 0.2)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#92400e",
                fontWeight: 500,
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                lineHeight: 1.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "#f59e0b",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                i
              </Box>
              Este espacio está disponible para alquiler. Contáctanos para más
              información sobre requisitos, tarifas y disponibilidad.
            </Typography>
          </Box>
        )}
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#f8fafc",
          borderTop: "1px solid #f1f5f9",
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: footerDotColor,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            }}
          />
          {footerLabelPrefix}
          Última actualización: Hoy
        </Typography>
      </Box>
    </Paper>
  );
}