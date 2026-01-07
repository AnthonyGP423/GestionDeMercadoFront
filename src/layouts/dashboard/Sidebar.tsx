import {
  Avatar,
  Box,
  Drawer,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PaymentsIcon from "@mui/icons-material/Payments";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/useAuth";

const drawerWidth = 280;

// Paleta mejorada
const primary = "#16a34a";
const primaryLight = "#22c55e";
const primarySoft = "#dcfce7";
const iconDefault = "#6b7280";
const textMain = "#111827";
const textMuted = "#9ca3af";
const reportColor = "#eab308";
const bgHover = "#f9fafb";

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function normalizeOrigin(apiBase: string) {
  const v = String(apiBase ?? "").trim().replace(/\/$/, "");
  return v.replace(/\/api(\/v\d+)?$/i, "");
}

export default function Sidebar() {
  const [openStands, setOpenStands] = useState(false);
  const [openProductos, setOpenProductos] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const ORIGIN = useMemo(() => normalizeOrigin(RAW_API_BASE_URL), []);

  const displayName = useMemo(() => {
    if (user?.nombreCompleto?.trim()) return user.nombreCompleto.trim();
    if (user?.email) return user.email.split("@")[0];
    return "Administrador";
  }, [user?.nombreCompleto, user?.email]);

  const avatarInitial = displayName.charAt(0).toUpperCase();
  const rolLabel = user?.rol ?? "ADMIN";

  const role = (user?.rol ?? "ADMIN").toUpperCase();
  const isAdmin = role === "ADMIN";
  const canSeeRoles = isAdmin;
  const canSeeCategoriasStand = isAdmin;
  const canSeeCategoriasProducto = isAdmin;

  const [avatarError, setAvatarError] = useState(false);

  const avatarSrc = useMemo(() => {
    const v = (user?.fotoUrl ?? "").trim();
    if (!v) return "";

    let url = "";
    if (v.startsWith("http://") || v.startsWith("https://")) url = v;
    else if (v.startsWith("/")) url = `${ORIGIN}${v}`;
    else url = `${ORIGIN}/${v}`;

    // (Opcional) cache-busting suave para evitar caché vieja
    return `${url}?v=${encodeURIComponent(v)}`;
  }, [user?.fotoUrl, ORIGIN]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  const handleLogout = () => {
    logout();
    navigate("/tienda", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const itemBaseSx = {
    borderRadius: "12px",
    px: 2,
    py: 1.2,
    my: 0.5,
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "3px",
      backgroundColor: "transparent",
      transition: "background-color 0.2s ease",
    },
    "& .MuiListItemIcon-root": {
      minWidth: 40,
      color: iconDefault,
      transition: "all 0.2s ease",
    },
    "& .MuiListItemText-primary": {
      fontSize: 14,
      fontWeight: 500,
      color: textMain,
      transition: "all 0.2s ease",
    },
    "&:hover": {
      backgroundColor: bgHover,
      "&::before": { backgroundColor: primary },
      "& .MuiListItemIcon-root": {
        color: primary,
        transform: "scale(1.1)",
      },
    },
  };

  const selectedSx = {
    backgroundColor: primarySoft,
    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.15)",
    "&::before": { backgroundColor: primary },
    "& .MuiListItemIcon-root": { color: primary },
    "& .MuiListItemText-primary": {
      color: primary,
      fontWeight: 700,
    },
    "&:hover": { backgroundColor: primarySoft },
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: { xs: 240, sm: drawerWidth },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: 240, sm: drawerWidth },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          backgroundColor: "#ffffff",
          borderRight: "none",
          boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
            pb: 2.5,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 16px rgba(22, 163, 74, 0.25)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -1,
                borderRadius: "17px",
                padding: "1px",
                background: `linear-gradient(135deg, rgba(34,197,94,0.3), transparent)`,
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              },
            }}
          >
            <StorefrontIcon sx={{ fontSize: 26 }} />
          </Box>

          <Box sx={{ lineHeight: 1.2, flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: "uppercase",
                fontSize: 9.5,
                letterSpacing: ".2em",
                color: primary,
                fontWeight: 700,
                display: "block",
              }}
            >
              Panel Admin
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: textMain,
                fontSize: "15px",
                lineHeight: 1.3,
                mt: 0.3,
              }}
            >
              Mercado Mayorista
            </Typography>
          </Box>
        </Box>

        {/* Card Usuario */}
        <Box
          sx={{
            borderRadius: "16px",
            p: 1.75,
            background: `linear-gradient(135deg, ${bgHover} 0%, #ffffff 100%)`,
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderColor: primarySoft,
            },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              key={avatarSrc || "no-photo"}
              src={!avatarError && avatarSrc ? avatarSrc : undefined}
              imgProps={{ onError: () => setAvatarError(true) }}
              sx={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 100%)`,
                fontWeight: 800,
                fontSize: 20,
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
              }}
            >
              {avatarInitial}
            </Avatar>

            <Box
              sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={displayName} placement="top">
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: textMain,
                  fontSize: 14,
                  letterSpacing: "-0.01em",
                }}
              >
                {displayName}
              </Typography>
            </Tooltip>

            {user?.email && (
              <Tooltip title={user.email} placement="bottom">
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    color: textMuted,
                    display: "block",
                    fontSize: 12,
                  }}
                >
                  {user.email}
                </Typography>
              </Tooltip>
            )}

            <Chip
              label={rolLabel}
              size="small"
              sx={{
                mt: 0.75,
                height: 22,
                fontSize: 10,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${primarySoft} 0%, #d1fae5 100%)`,
                color: primary,
                textTransform: "uppercase",
                borderRadius: "6px",
                letterSpacing: "0.05em",
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* MENU */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 2,
          py: 1,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "#e5e7eb",
            borderRadius: "10px",
            "&:hover": { background: "#d1d5db" },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1,
            mb: 1,
            mt: 0.5,
            display: "block",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            color: textMuted,
            fontWeight: 700,
            fontSize: 10,
          }}
        >
          Administración
        </Typography>

        <List disablePadding>
          <ListItemButton
            component={Link}
            to="/dashboard/principal"
            selected={isActive("/dashboard/principal")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/dashboard/usuario"
            selected={isActive("/dashboard/usuario")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItemButton>

          {canSeeRoles && (
            <ListItemButton
              component={Link}
              to="/dashboard/rol"
              selected={isActive("/dashboard/rol")}
              sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
            >
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText primary="Roles" />
            </ListItemButton>
          )}

          <ListItemButton
            component={Link}
            to="/dashboard/incidencias"
            selected={isActive("/dashboard/incidencias")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon><ReportProblemIcon /></ListItemIcon>
            <ListItemText primary="Incidencias" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/dashboard/credenciales-qr"
            selected={isActive("/dashboard/credenciales-qr")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon><QrCode2Icon /></ListItemIcon>
            <ListItemText primary="Credencial QR" />
          </ListItemButton>

          <Typography
            variant="caption"
            sx={{
              px: 1,
              mt: 2.5,
              mb: 1,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: ".18em",
              color: textMuted,
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            Mercado
          </Typography>

          <ListItemButton
            onClick={() => setOpenProductos(!openProductos)}
            sx={{
              ...itemBaseSx,
              backgroundColor: openProductos ? bgHover : "transparent",
            }}
          >
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary="Productos" />
            <Box
              sx={{
                transform: openProductos ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <ExpandMore sx={{ fontSize: 20, color: iconDefault }} />
            </Box>
          </ListItemButton>

          <Collapse in={openProductos} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2, mt: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/dashboard/producto"
                selected={isActive("/dashboard/producto")}
                sx={{ ...itemBaseSx, py: 1, "&.Mui-selected": selectedSx }}
              >
                <ListItemText primary="Lista de productos" primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>

              {canSeeCategoriasProducto && (
                <ListItemButton
                  component={Link}
                  to="/dashboard/categoria-producto"
                  selected={isActive("/dashboard/categoria-producto")}
                  sx={{ ...itemBaseSx, py: 1, "&.Mui-selected": selectedSx }}
                >
                  <ListItemText primary="Categorías de producto" primaryTypographyProps={{ fontSize: 13 }} />
                </ListItemButton>
              )}
            </List>
          </Collapse>

          <ListItemButton
            onClick={() => setOpenStands(!openStands)}
            sx={{
              ...itemBaseSx,
              backgroundColor: openStands ? bgHover : "transparent",
            }}
          >
            <ListItemIcon><StoreIcon /></ListItemIcon>
            <ListItemText primary="Stands" />
            <Box
              sx={{
                transform: openStands ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <ExpandMore sx={{ fontSize: 20, color: iconDefault }} />
            </Box>
          </ListItemButton>

          <Collapse in={openStands} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2, mt: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/dashboard/stand"
                selected={isActive("/dashboard/stand")}
                sx={{ ...itemBaseSx, py: 1, "&.Mui-selected": selectedSx }}
              >
                <ListItemText primary="Lista de stands" primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>

              {canSeeCategoriasStand && (
                <ListItemButton
                  component={Link}
                  to="/dashboard/categoria-stand"
                  selected={isActive("/dashboard/categoria-stand")}
                  sx={{ ...itemBaseSx, py: 1, "&.Mui-selected": selectedSx }}
                >
                  <ListItemText primary="Categorías de stands" primaryTypographyProps={{ fontSize: 13 }} />
                </ListItemButton>
              )}
            </List>
          </Collapse>

          <ListItemButton
            component={Link}
            to="/dashboard/pagos"
            selected={isActive("/dashboard/pagos")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon><PaymentsIcon /></ListItemIcon>
            <ListItemText primary="Pagos" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/dashboard/reporte"
            selected={isActive("/dashboard/reporte")}
            sx={{
              ...itemBaseSx,
              "&.Mui-selected": {
                backgroundColor: "#fef3c7",
                boxShadow: "0 2px 8px rgba(234, 179, 8, 0.15)",
                "&::before": { backgroundColor: reportColor },
                "& .MuiListItemIcon-root": { color: reportColor },
                "& .MuiListItemText-primary": { color: "#854d0e", fontWeight: 700 },
              },
              "&:hover": { "& .MuiListItemIcon-root": { color: reportColor } },
            }}
          >
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="Reportes" />
          </ListItemButton>
        </List>
      </Box>

      {/* FOOTER */}
      <Box sx={{ px: 2.5, pb: 3, pt: 2 }}>
        <Divider sx={{ mb: 2, borderColor: "#f3f4f6" }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            ...itemBaseSx,
            borderRadius: "12px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
            "& .MuiListItemIcon-root": { color: "#dc2626" },
            "& .MuiListItemText-primary": { color: "#991b1b", fontWeight: 600 },
            "&:hover": {
              backgroundColor: "#fee2e2",
              borderColor: "#fca5a5",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
              "& .MuiListItemIcon-root": { transform: "scale(1.1)" },
            },
          }}
        >
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}