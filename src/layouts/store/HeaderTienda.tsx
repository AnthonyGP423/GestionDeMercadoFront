// src/layouts/store/HeaderTienda.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import LanguageIcon from "@mui/icons-material/Language";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const isClienteRole = (rol?: string) => {
  const r = String(rol ?? "").toUpperCase();
  return r === "CLIENTE" || r === "ROLE_CLIENTE" || r.includes("CLIENTE");
};

// 🔹 Aquí definimos las rutas correctas
const navLinks = [
  { label: "Inicio", path: "/tienda" },
  { label: "Mapa", path: "/tienda/mapa-stand" },
  { label: "Precios", path: "/tienda/precios-productos" },
  { label: "Sobre el mercado", path: "/tienda/contacto" },
];

export default function HeaderTienda() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth() as any;

  const rol = String(user?.rol ?? "");
  const isCliente = Boolean(isAuthenticated && isClienteRole(rol));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ===== Menu Cliente (Desktop) =====
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const displayName =
    user?.nombreCompleto?.trim?.() ||
    user?.nombre?.trim?.() ||
    user?.nombres?.trim?.() ||
    (user?.email ? String(user.email).split("@")[0] : "Cliente");

  const initial = String(displayName || "C")
    .charAt(0)
    .toUpperCase();

  const handleAction = (path: string) => {
    handleCloseMenu();
    navigate(path);
  };

  const doLogout = () => {
    handleCloseMenu();
    logout?.();
    navigate("/tienda", { replace: true });
  };

  // ===== Drawer Móvil =====
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobileDrawer = (open: boolean) => () => setMobileOpen(open);

  const handleNavMobile = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const mobileDrawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <Avatar sx={{ bgcolor: "#16a34a", width: 40, height: 40 }}>
          <StorefrontIcon />
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1 }}
          >
            Santa Anita
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Market Digital
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 1 }}>
        {navLinks.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => handleNavMobile(item.path)}
            sx={{ borderRadius: 2 }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1, mx: 2 }} />

      <Box sx={{ p: 2 }}>
        {!isCliente ? (
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/cliente/login"
              sx={{
                borderRadius: 3,
                bgcolor: "#16a34a",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Soy cliente
            </Button>
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/cliente/registro"
              sx={{
                borderRadius: 3,
                color: "#16a34a",
                borderColor: "#16a34a",
                textTransform: "none",
              }}
            >
              Registrarme
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Typography
              variant="overline"
              sx={{ px: 1, color: "text.secondary" }}
            >
              Mi Cuenta
            </Typography>
            <ListItemButton
              onClick={() => handleNavMobile("/tienda/perfil-usuario")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <PersonOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Mi Perfil" />
            </ListItemButton>
            <ListItemButton
              onClick={() => handleNavMobile("/tienda/favoritos")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <FavoriteBorderIcon />
              </ListItemIcon>
              <ListItemText primary="Favoritos" />
            </ListItemButton>
            <ListItemButton
              onClick={doLogout}
              sx={{ borderRadius: 2, color: "error.main" }}
            >
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItemButton>
          </Stack>
        )}
      </Box>

      <Box sx={{ p: 2, mt: "auto" }}>
        <Button
          fullWidth
          component={Link}
          to="/login"
          variant="contained"
          sx={{ bgcolor: "#0f172a", borderRadius: 3, textTransform: "none" }}
        >
          Intranet
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          color: "text.primary",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1400,
            mx: "auto",
            width: "100%",
            minHeight: { xs: 70, md: 85 },
            px: { xs: 2, sm: 3, md: 5 },
          }}
        >
          {/* LOGO */}
          <Box
            component={Link}
            to="/tienda"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
              mr: { md: 4, lg: 6 },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
              }}
            >
              <StorefrontIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
              }}
            >
              Santa Anita{" "}
              <Box
                component="span"
                sx={{ color: "#16a34a", display: { xs: "none", sm: "inline" } }}
              >
                Market
              </Box>
            </Typography>
          </Box>

          {/* LINKS CENTRO (Desktop) */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
              {navLinks.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: "#64748b",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    fontSize: "0.95rem",
                    "&:hover": { color: "#16a34a", bgcolor: "transparent" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* ACCIONES DERECHA (Desktop) */}
          {!isMobile && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ ml: 2 }}
            >
              {!isCliente ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    to="/cliente/login"
                    variant="contained"
                    sx={{
                      borderRadius: 999,
                      bgcolor: "#16a34a",
                      px: 3,
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#15803d" },
                    }}
                  >
                    Soy cliente
                  </Button>
                  <Button
                    component={Link}
                    to="/cliente/registro"
                    sx={{
                      color: "#16a34a",
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    Registrarme
                  </Button>
                </Stack>
              ) : (
                <Button
                  onClick={handleOpenMenu}
                  sx={{
                    textTransform: "none",
                    borderRadius: 4,
                    px: 1.5,
                    py: 0.7,
                    bgcolor: openMenu ? "#f8fafc" : "transparent",
                    color: "text.primary",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: "#16a34a",
                      mr: 1.5,
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {initial}
                  </Avatar>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}
                    >
                      {displayName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      Cliente
                    </Typography>
                  </Box>
                </Button>
              )}

              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: 28, my: "auto" }}
              />

              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{
                  bgcolor: "#0f172a",
                  borderRadius: 2.5,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                Intranet
              </Button>
            </Stack>
          )}

          {/* BOTÓN MÓVIL */}
          {isMobile && (
            <IconButton
              onClick={toggleMobileDrawer(true)}
              sx={{
                ml: "auto",
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Menú Dropdown Cliente (Desktop) */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            borderRadius: 3,
            minWidth: 200,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            overflow: "hidden",
          },
        }}
      >
        <MenuItem
          onClick={() => handleAction("/tienda/perfil-usuario")}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>
        <MenuItem
          onClick={() => handleAction("/tienda/favoritos")}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FavoriteBorderIcon fontSize="small" />
          </ListItemIcon>
          Favoritos
        </MenuItem>
        <Divider />
        <MenuItem onClick={doLogout} sx={{ py: 1.5, color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>

      {/* Sidebar Móvil */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleMobileDrawer(false)}
      >
        {mobileDrawer}
      </Drawer>
    </>
  );
}
