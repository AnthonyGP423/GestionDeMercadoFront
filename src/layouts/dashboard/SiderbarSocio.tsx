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
  Chip,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../auth/useAuth";

const drawerWidth = 280;

// Paleta ámbar mostaza mejorada
const primary = "#d97706";
const primaryLight = "#f59e0b";
const primarySoft = "#fef3c7";
const iconDefault = "#78716c";
const textMain = "#1c1917";
const textMuted = "#78716c";
const bgHover = "#fafaf9";

export default function SidebarSocio() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    if (user?.nombreCompleto) return user.nombreCompleto;
    if (user?.email) return user.email.split("@")[0];
    return "Socio";
  }, [user]);

  const avatarInitial = displayName.charAt(0).toUpperCase();
  const rolLabel = user?.rol ?? "SOCIO";

  const handleLogout = () => {
    logout();
    navigate("/tienda", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Estilo base mejorado
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
      "&::before": {
        backgroundColor: primary,
      },
      "& .MuiListItemIcon-root": {
        color: primary,
        transform: "scale(1.1)",
      },
    },
  };

  // Estilo seleccionado mejorado
  const selectedSx = {
    backgroundColor: primarySoft,
    boxShadow: "0 2px 8px rgba(217, 119, 6, 0.15)",
    "&::before": {
      backgroundColor: primary,
    },
    "& .MuiListItemIcon-root": {
      color: primary,
    },
    "& .MuiListItemText-primary": {
      color: primary,
      fontWeight: 700,
    },
    "&:hover": {
      backgroundColor: primarySoft,
    },
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
      {/* HEADER MEJORADO */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        {/* Logo y Marca */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
            pb: 2.5,
            borderBottom: "1px solid #f5f5f4",
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
              boxShadow: "0 8px 16px rgba(217, 119, 6, 0.25)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -1,
                borderRadius: "17px",
                padding: "1px",
                background: `linear-gradient(135deg, rgba(245,158,11,0.3), transparent)`,
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
              Panel Socio
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

        {/* Tarjeta de Usuario Mejorada */}
        <Box
          sx={{
            borderRadius: "16px",
            p: 1.75,
            background: `linear-gradient(135deg, ${bgHover} 0%, #ffffff 100%)`,
            border: "1px solid #e7e5e4",
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
              sx={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 100%)`,
                fontWeight: 800,
                fontSize: 20,
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
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
                backgroundColor: "#f59e0b",
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
                background: `linear-gradient(135deg, ${primarySoft} 0%, #fef9c3 100%)`,
                color: primary,
                textTransform: "uppercase",
                borderRadius: "6px",
                letterSpacing: "0.05em",
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* MENÚ SCROLLABLE */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 2,
          py: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#e7e5e4",
            borderRadius: "10px",
            "&:hover": {
              background: "#d6d3d1",
            },
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
          Gestión de Socio
        </Typography>

        <List disablePadding>
          {/* DASHBOARD */}
          <ListItemButton
            component={Link}
            to="/socio/principal"
            selected={isActive("/socio/principal")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          {/* MIS PUESTOS */}
          <ListItemButton
            component={Link}
            to="/socio/mis-stands"
            selected={isActive("/socio/mis-stands")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Mis puestos" />
          </ListItemButton>

          {/* CUOTAS Y PAGOS */}
          <ListItemButton
            component={Link}
            to="/socio/mis-cuotas"
            selected={isActive("/socio/mis-cuotas")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon>
              <PaymentsIcon />
            </ListItemIcon>
            <ListItemText primary="Cuotas y pagos" />
          </ListItemButton>

          {/* PRODUCTOS Y PRECIOS */}
          <ListItemButton
            component={Link}
            to="/socio/productos"
            selected={isActive("/socio/productos")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Productos y precios" />
          </ListItemButton>

          {/* INCIDENCIAS */}
          <ListItemButton
            component={Link}
            to="/socio/incidencias"
            selected={isActive("/socio/incidencias")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon>
              <ReportProblemIcon />
            </ListItemIcon>
            <ListItemText primary="Incidencias" />
          </ListItemButton>

          {/* CREDENCIAL QR */}
          <ListItemButton
            component={Link}
            to="/socio/credencial-qr"
            selected={isActive("/socio/credencial-qr")}
            sx={{ ...itemBaseSx, "&.Mui-selected": selectedSx }}
          >
            <ListItemIcon>
              <QrCode2Icon />
            </ListItemIcon>
            <ListItemText primary="Credencial QR" />
          </ListItemButton>
        </List>
      </Box>

      {/* FOOTER MEJORADO */}
      <Box sx={{ px: 2.5, pb: 3, pt: 2 }}>
        <Divider sx={{ mb: 2, borderColor: "#f5f5f4" }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            ...itemBaseSx,
            borderRadius: "12px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
            "& .MuiListItemIcon-root": {
              color: "#dc2626",
            },
            "& .MuiListItemText-primary": {
              color: "#991b1b",
              fontWeight: 600,
            },
            "&:hover": {
              backgroundColor: "#fee2e2",
              borderColor: "#fca5a5",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
              "& .MuiListItemIcon-root": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}