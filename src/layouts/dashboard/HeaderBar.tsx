import {
  AppBar,
  Toolbar,
  Box,
  Breadcrumbs,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const drawerWidth = 260;

function getCurrentLabel(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);

  // dashboard/<sección>
  if (parts[0] === "dashboard") {
    if (parts.length === 1) return "Panel de control";
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
      incidencias: "Incidencias",
      "credenciales-qr": "Credencial QR",
      "ping-test": "Prueba de conexión",
    };
    return map[parts[1]] ?? parts[1];
  }

  // socio/<sección>
  if (parts[0] === "socio") {
    if (parts.length === 1) return "Panel de control";
    const map: Record<string, string> = {
      principal: "Panel de control",
      "mis-stands": "Mis puestos",
      "mis-cuotas": "Cuotas y pagos",
      productos: "Productos y precios",
      incidencias: "Incidencias",
      "credencial-qr": "Credencial QR",
    };
    return map[parts[1]] ?? parts[1];
  }

  return "Inicio";
}

function normalizeRole(raw?: string) {
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

function getRoleUI(rolRaw?: string) {
  const rol = normalizeRole(rolRaw);

  const isSocio = rol === "SOCIO";
  const isSupervisor = rol === "SUPERVISOR";
  const isAdmin = rol === "ADMIN";

  // Admin/Supervisor: verde claro; Socio: ámbar
  const palette = isSocio
    ? {
        primary: "#b45309", // amber-700
        soft: "#fffbeb", // amber-50
        soft2: "#fef3c7", // amber-100
        ring: "rgba(245, 158, 11, 0.35)",
        label: "Panel Socio",
      }
    : {
        primary: "#15803d", // green-700 (más claro que #166534)
        soft: "#f0fdf4", // green-50
        soft2: "#dcfce7", // green-100
        ring: "rgba(34, 197, 94, 0.30)",
        label: isSupervisor ? "Panel Supervisor" : "Panel Admin",
      };

  return { rol, isSocio, isSupervisor, isAdmin, ...palette };
}

export default function HeaderBar() {
  const location = useLocation();
  const currentLabel = getCurrentLabel(location.pathname);
  const { user } = useAuth();

  const displayName =
    user?.nombreCompleto || user?.email?.split("@")[0] || "Usuario";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const roleUI = getRoleUI(user?.rol);

  // Responsivo: si estás en /tienda u otra ruta pública, NO descontar drawer
  const onPanel = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/socio");

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: {
          xs: "100%",
          sm: onPanel ? `calc(100% - ${drawerWidth}px)` : "100%",
        },
        ml: { xs: 0, sm: onPanel ? `${drawerWidth}px` : 0 },
        bgcolor: "rgba(255,255,255,0.9)",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* IZQUIERDA */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, minWidth: 0 }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              fontSize: 13,
              "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" },
              "& .MuiBreadcrumbs-li": { minWidth: 0 },
            }}
          >
            <Typography
              noWrap
              sx={{ fontSize: 13, color: roleUI.primary, fontWeight: 700 }}
            >
              Inicio
            </Typography>

            <Typography
              noWrap
              sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
            >
              {currentLabel}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#0f172a",
              }}
            >
              {currentLabel}
            </Typography>

            {/* Chip cambia por rol */}
            <Chip
              label={roleUI.label}
              size="small"
              sx={{
                height: 24,
                px: 0.75,
                fontSize: 11,
                fontWeight: 900,
                backgroundColor: roleUI.soft2,
                color: roleUI.primary,
                borderRadius: "999px",
                textTransform: "uppercase",
                display: { xs: "none", sm: "inline-flex" }, // responsivo
              }}
            />
          </Box>
        </Box>

        {/* DERECHA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          {/* Usuario (md+) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
              pr: 1,
              mr: 0.5,
              borderRight: "1px solid",
              borderColor: "divider",
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: roleUI.primary,
                fontWeight: 900,
                fontSize: 14,
                boxShadow: `0 10px 22px ${roleUI.ring}`,
              }}
            >
              {avatarInitial}
            </Avatar>

            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".08em",
                }}
              >
                {roleUI.rol || "USUARIO"}
              </Typography>
            </Box>
          </Box>

          {/* Iconos */}
          <Tooltip title="Notificaciones">
            <IconButton
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
                "&:hover": { bgcolor: roleUI.soft },
              }}
            >
              <NotificationsNoneOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Mi cuenta">
            <IconButton
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fff",
                "&:hover": { bgcolor: roleUI.soft },
              }}
            >
              <AccountCircleOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}