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
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PaymentsIcon from "@mui/icons-material/Payments";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useAuth } from "../../auth/useAuth"; // ajusta la ruta según tu proyecto

const drawerWidth = 260;

// Colores institucionales
const primary = "#166534"; // verde
const accent = "#f59e0b"; // amarillo

export default function Sidebar() {
  const [openStands, setOpenStands] = useState(false);
  const [openProductos, setOpenProductos] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    if (user?.nombreCompleto) return user.nombreCompleto;
    if (user?.email) return user.email.split("@")[0];
    return "Administrador";
  }, [user]);

  const avatarInitial = displayName.charAt(0).toUpperCase();
  const rolLabel = user?.rol ?? "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const itemBaseSx = {
    borderRadius: "999px",
    px: 1.5,
    my: 0.3,
    "& .MuiListItemIcon-root": {
      minWidth: 40,
    },
  };

  const selectedSx = {
    backgroundColor: `${primary}15`,
    "&::before": {
      content: '""',
      position: "absolute",
      left: 8,
      top: "50%",
      transform: "translateY(-50%)",
      width: 4,
      height: 24,
      borderRadius: 999,
      backgroundColor: primary,
    },
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: { xs: 220, sm: drawerWidth },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: 220, sm: drawerWidth },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          backgroundColor: "#f9fafb", // fondo suave
          borderRight: "1px solid #e5e7eb",
        },
      }}
    >
      {/* HEADER / BRAND + USUARIO */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        {/* Marca */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              background: `${primary}10`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: primary,
            }}
          >
            <StorefrontIcon />
          </Box>
          <Box sx={{ lineHeight: 1.1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: "uppercase",
                fontSize: 10,
                letterSpacing: ".16em",
                color: "#6b7280",
              }}
            >
              Panel Admin
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Mercado Mayorista
            </Typography>
          </Box>
        </Box>

        {/* Tarjeta de usuario */}
        <Box
          sx={{
            borderRadius: 3,
            p: 1.5,
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: primary,
              fontWeight: "bold",
              fontSize: 22,
            }}
          >
            {avatarInitial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 600, color: "#111827" }}
            >
              {displayName}
            </Typography>
            {user?.email && (
              <Typography
                variant="caption"
                noWrap
                sx={{ color: "#6b7280", display: "block" }}
              >
                {user.email}
              </Typography>
            )}
            <Chip
              label={rolLabel}
              size="small"
              sx={{
                mt: 0.5,
                height: 22,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: `${primary}10`,
                color: primary,
                textTransform: "uppercase",
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* MENÚ SCROLLABLE */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1,
            mb: 0.5,
            textTransform: "uppercase",
            letterSpacing: ".16em",
            color: "#9ca3af",
            fontWeight: 600,
            fontSize: 10,
          }}
        >
          Administración
        </Typography>

        <List disablePadding>
          {/* DASHBOARD */}
          <ListItemButton
            component={Link}
            to="/dashboard/principal"
            selected={isActive("/dashboard/principal")}
            sx={{
              ...itemBaseSx,
              position: "relative",
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon sx={{ color: primary }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          {/* USUARIOS */}
          <ListItemButton
            component={Link}
            to="/dashboard/usuario"
            selected={isActive("/dashboard/usuario")}
            sx={{
              ...itemBaseSx,
              position: "relative",
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon sx={{ color: primary }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItemButton>

          {/* ROLES */}
          <ListItemButton
            component={Link}
            to="/dashboard/rol"
            selected={isActive("/dashboard/rol")}
            sx={{
              ...itemBaseSx,
              position: "relative",
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon sx={{ color: primary }}>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText primary="Roles" />
          </ListItemButton>

          {/* SEPARADOR LÓGICO */}
          <Typography
            variant="caption"
            sx={{
              px: 1,
              mt: 1.5,
              mb: 0.5,
              textTransform: "uppercase",
              letterSpacing: ".16em",
              color: "#9ca3af",
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            Mercado
          </Typography>

          {/* PRODUCTOS */}
          <ListItemButton
            onClick={() => setOpenProductos(!openProductos)}
            sx={{
              ...itemBaseSx,
            }}
          >
            <ListItemIcon sx={{ color: primary }}>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Productos" />
            {openProductos ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openProductos} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1 }}>
              <ListItemButton
                component={Link}
                to="/dashboard/producto"
                selected={isActive("/dashboard/producto")}
                sx={{
                  ...itemBaseSx,
                  position: "relative",
                  "&.Mui-selected": selectedSx,
                }}
              >
                <ListItemText primary="Lista de productos" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/dashboard/categoria-producto"
                selected={isActive("/dashboard/categoria-producto")}
                sx={{
                  ...itemBaseSx,
                  position: "relative",
                  "&.Mui-selected": selectedSx,
                }}
              >
                <ListItemText primary="Categorías de producto" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* STANDS */}
          <ListItemButton
            onClick={() => setOpenStands(!openStands)}
            sx={{
              ...itemBaseSx,
            }}
          >
            <ListItemIcon sx={{ color: primary }}>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Stands" />
            {openStands ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openStands} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1 }}>
              <ListItemButton
                component={Link}
                to="/dashboard/stand"
                selected={isActive("/dashboard/stand")}
                sx={{
                  ...itemBaseSx,
                  position: "relative",
                  "&.Mui-selected": selectedSx,
                }}
              >
                <ListItemText primary="Lista de stands" />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/dashboard/categoria-stand"
                selected={isActive("/dashboard/categoria-stand")}
                sx={{
                  ...itemBaseSx,
                  position: "relative",
                  "&.Mui-selected": selectedSx,
                }}
              >
                <ListItemText primary="Categorías de stands" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* PAGOS */}
          <ListItemButton
            component={Link}
            to="/dashboard/pagos"
            selected={isActive("/dashboard/pagos")}
            sx={{
              ...itemBaseSx,
              position: "relative",
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon sx={{ color: primary }}>
              <PaymentsIcon />
            </ListItemIcon>
            <ListItemText primary="Pagos" />
          </ListItemButton>

          {/* REPORTES */}
          <ListItemButton
            component={Link}
            to="/dashboard/reporte"
            selected={isActive("/dashboard/reporte")}
            sx={{
              ...itemBaseSx,
              position: "relative",
              "&.Mui-selected": {
                ...selectedSx,
                "&::before": {
                  ...selectedSx["&::before"],
                  backgroundColor: accent,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: accent }}>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Reportes" />
          </ListItemButton>
        </List>
      </Box>

      {/* FOOTER / LOGOUT */}
      <Box sx={{ px: 1.5, pb: 2, pt: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            ...itemBaseSx,
            borderRadius: "999px",
            "&:hover": {
              backgroundColor: "#fee2e2",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#b91c1c" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}