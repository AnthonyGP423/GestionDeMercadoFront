import {
  AppBar,
  Toolbar,
  Box,
  Breadcrumbs,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";

// Debe coincidir con el drawerWidth del Sidebar
const drawerWidth = 260;

// Color institucional
const primary = "#166534";

function getCurrentLabel(pathname: string): string {
  // /dashboard, /dashboard/usuario, etc.
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] !== "dashboard") return "Inicio";

  // solo /dashboard
  if (parts.length === 1) return "Panel de control";

  // dashboard/<sección>
  const map: Record<string, string> = {
    principal: "Panel de control",
    usuario: "Usuarios",
    rol: "Roles",
    "categoria-stand": "Categorías de stands",
    "categoria-producto": "Categorías de productos",
    stand: "Stands",
    producto: "Productos",
    pagos: "Pagos",
    reporte: "Reportes",
    "ping-test": "Prueba de conexión",
  };

  return map[parts[1]] ?? parts[1];
}

export default function HeaderBar() {
  const location = useLocation();
  const currentLabel = getCurrentLabel(location.pathname);
  const { user } = useAuth();

  const displayName =
    user?.nombreCompleto || user?.email?.split("@")[0] || "Administrador";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // Responsivo: en móvil ocupa ancho completo, en desktop deja espacio al drawer
        width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, sm: `${drawerWidth}px` },
        bgcolor: "#ffffff",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* IZQUIERDA: breadcrumb + título */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 13 }}>
            <Typography sx={{ fontSize: 13, color: primary }}>
              Inicio
            </Typography>
            {currentLabel && (
              <Typography
                sx={{ fontSize: 13, fontWeight: 600 }}
                color="text.primary"
              >
                {currentLabel}
              </Typography>
            )}
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              {currentLabel}
            </Typography>
            <Chip
              label="Panel Admin"
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: `${primary}10`,
                color: primary,
                borderRadius: "999px",
                textTransform: "uppercase",
              }}
            />
          </Box>
        </Box>

        {/* DERECHA: acciones / usuario */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Info de usuario (solo en md en adelante) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "flex-end",
              mr: 0.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#111827" }}
            >
              {displayName}
            </Typography>
            {user?.rol && (
              <Typography
                variant="caption"
                sx={{
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontSize: 11,
                }}
              >
                {user.rol}
              </Typography>
            )}
          </Box>

          {/* Iconos */}
          <IconButton size="small">
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton size="small">
            <AccountCircleOutlinedIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
