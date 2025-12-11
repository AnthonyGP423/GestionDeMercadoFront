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
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import QrCode2Icon from "@mui/icons-material/QrCode2";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useAuth } from "../../../auth/useAuth";

const drawerWidth = 260;

// Paleta más clara / moderna
const primary = "#16a34a";      // verde principal
const primarySoft = "#dcfce7";  // fondo de item seleccionado / chip
const iconDefault = "#4b5563";  // gris para iconos
const textMain = "#111827";
const textMuted = "#6b7280";     
const reportColor = "#eab308";

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

  // Estilo base de cada opción de menú
  const itemBaseSx = {
    borderRadius: 12, // menos ovalado, más ligero
    px: 2,
    py: 1,
    my: 0.4,
    "& .MuiListItemIcon-root": {
      minWidth: 40,
      color: iconDefault,
    },
    "& .MuiListItemText-primary": {
      fontSize: 14,
      fontWeight: 500,
      color: textMain,
    },
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  };

  // Estilo cuando está seleccionado (pill verde claro, sin barra lateral)
  const selectedSx = {
    backgroundColor: primarySoft,
    "& .MuiListItemIcon-root": {
      color: primary,
    },
    "& .MuiListItemText-primary": {
      color: primary,
      fontWeight: 600,
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
          backgroundColor: "#ffffff",
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
              width: 44,
              height: 44,
              borderRadius: 14,           // cuadrado redondeado, no tan ovalado
              background: primarySoft,
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
                color: textMuted,
              }}
            >
              Panel Admin
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: textMain,
              }}
            >
              Mercado Mayorista de Santa Anita
            </Typography>
          </Box>
        </Box>

        {/* Tarjeta de usuario (más ligera) */}
        <Box
          sx={{
            borderRadius: 2,
            p: 1.25,
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: primary,
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {avatarInitial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 600, color: textMain }}
            >
              {displayName}
            </Typography>
            {user?.email && (
              <Typography
                variant="caption"
                noWrap
                sx={{ color: textMuted, display: "block" }}
              >
                {user.email}
              </Typography>
            )}
            <Chip
              label={rolLabel}
              size="small"
              sx={{
                mt: 0.5,
                height: 20,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: primarySoft,
                color: primary,
                textTransform: "uppercase",
                borderRadius: 999,
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
        {/* === BLOQUE ADMINISTRACIÓN (misma posición) === */}
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
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon>
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
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon>
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
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText primary="Roles" />
          </ListItemButton>

          {/* INCIDENCIAS */}
          <ListItemButton
            component={Link}
            to="/dashboard/incidencias"
            selected={isActive("/dashboard/incidencias")}
            sx={{
              ...itemBaseSx,
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon>
              <ReportProblemIcon />
            </ListItemIcon>
            <ListItemText primary="Incidencias" />
          </ListItemButton>

          {/* CREDENCIAL QR */}
          <ListItemButton
            component={Link}
            to="/dashboard/credenciales-qr"
            selected={isActive("/dashboard/credenciales-qr")}
            sx={{
              ...itemBaseSx,
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon>
              <QrCode2Icon />
            </ListItemIcon>
            <ListItemText primary="Credencial QR" />
          </ListItemButton>

          {/* === BLOQUE MERCADO (misma posición, mismo orden) === */}
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

          {/* PRODUCTOS (colapsable) */}
          <ListItemButton
            onClick={() => setOpenProductos(!openProductos)}
            sx={itemBaseSx}
          >
            <ListItemIcon>
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
                  "&.Mui-selected": selectedSx,
                }}
              >
                <ListItemText primary="Categorías de producto" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* STANDS (colapsable) */}
          <ListItemButton
            onClick={() => setOpenStands(!openStands)}
            sx={itemBaseSx}
          >
            <ListItemIcon>
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
              "&.Mui-selected": selectedSx,
            }}
          >
            <ListItemIcon>
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
    "& .MuiListItemIcon-root": {
      color: reportColor,        // ICONO SIEMPRE AMARILLO
    },
    "&.Mui-selected": {
      backgroundColor: primarySoft,
      "& .MuiListItemIcon-root": {
        color: reportColor,      // ICONO EN SELECCIÓN
      },
      "& .MuiListItemText-primary": {
        color: reportColor,      // TEXTO EN SELECCIÓN
        fontWeight: 600,
      },
    },
  }}
>
  <ListItemIcon>
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
            borderRadius: 999,
            "& .MuiListItemIcon-root": { color: "#b91c1c" },
            "& .MuiListItemText-primary": { color: "#7f1d1d" },
            "&:hover": {
              backgroundColor: "#fee2e2",
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
