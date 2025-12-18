// src/layouts/store/HeaderTienda.tsx
import React from "react";
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
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import LanguageIcon from "@mui/icons-material/Language";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LogoutIcon from "@mui/icons-material/Logout";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const isClienteRole = (rol?: string) => {
  const r = String(rol ?? "").toUpperCase();
  return r === "CLIENTE" || r === "ROLE_CLIENTE" || r.includes("CLIENTE");
};

export default function HeaderTienda() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth() as any;

  const rol = String(user?.rol ?? "");
  const isCliente = Boolean(isAuthenticated && isClienteRole(rol));

  // ===== menu cliente =====
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const displayName =
    user?.nombreCompleto?.trim?.() ||
    user?.nombre?.trim?.() ||
    user?.nombres?.trim?.() ||
    (user?.email ? String(user.email).split("@")[0] : "Cliente");

  const initial = String(displayName || "C").charAt(0).toUpperCase();

  const goPerfil = () => {
    handleCloseMenu();
    navigate("/tienda/perfil-usuario");
  };

  const goFavoritos = () => {
    handleCloseMenu();
    navigate("/tienda/favoritos");
  };

  const doLogout = () => {
    handleCloseMenu();
    logout?.();
    navigate("/tienda", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        color: "text.primary",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* LOGO + NOMBRE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 4 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: "#22c55e1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StorefrontIcon sx={{ color: "#16a34a" }} />
          </Box>

          <Typography
            component={Link}
            to="/tienda"
            variant="h6"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 800,
              fontFamily:
                '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
            }}
          >
            Mercado Santa Anita
          </Typography>
        </Box>

        {/* LINKS PRINCIPALES */}
        <Box
          sx={{
            display: "flex",
            gap: 2.5,
            flexGrow: 1,
            alignItems: "center",
            fontSize: 14,
          }}
        >
          <Button
            component={Link}
            to="/tienda"
            color="inherit"
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            Inicio
          </Button>

          <Button
            component={Link}
            to="/tienda/mapa-stand"
            color="inherit"
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            Mapa
          </Button>

          <Button
            component={Link}
            to="/tienda/precios-productos"
            color="inherit"
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            Precios
          </Button>

          <Button
            component={Link}
            to="/tienda/contacto"
            color="inherit"
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            Sobre el mercado
          </Button>
        </Box>

        {/* ACCIONES DERECHA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          {/* ===== BLOQUE CLIENTE ===== */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!isCliente ? (
              <>
                <Button
                  component={Link}
                  to="/cliente/login"
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.5,
                    fontSize: 13,
                    backgroundColor: "#16a34a",
                    boxShadow: "0 8px 18px rgba(22,163,74,0.35)",
                    "&:hover": {
                      backgroundColor: "#15803d",
                      boxShadow: "0 10px 24px rgba(22,163,74,0.45)",
                    },
                  }}
                >
                  Soy cliente
                </Button>

                <Button
                  component={Link}
                  to="/cliente/registro"
                  variant="text"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#16a34a",
                    px: 0.5,
                    "&:hover": {
                      color: "#0f766e",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Registrarme
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleOpenMenu}
                  variant="text"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    px: 1,
                    py: 0.5,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: "#16a34a",
                      fontWeight: 800,
                      fontSize: 14,
                      boxShadow: "0 8px 18px rgba(22,163,74,0.25)",
                    }}
                  >
                    {initial}
                  </Avatar>

                  <Box
                    sx={{
                      display: { xs: "none", sm: "block" },
                      textAlign: "left",
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.1 }}>
                      {displayName}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.1 }}>
                      Cliente
                    </Typography>
                  </Box>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 1,
                      borderRadius: 3,
                      border: "1px solid #e5e7eb",
                      boxShadow:
                        "0 20px 40px rgba(15,23,42,0.10), 0 0 0 1px rgba(0,0,0,0.02)",
                      minWidth: 220,
                      overflow: "hidden",
                    },
                  }}
                >
                  <MenuItem onClick={goPerfil}>
                    <ListItemIcon>
                      <PersonOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    Mi perfil
                  </MenuItem>

                  <MenuItem onClick={goFavoritos}>
                    <ListItemIcon>
                      <FavoriteBorderIcon fontSize="small" />
                    </ListItemIcon>
                    Mis favoritos
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={doLogout} sx={{ color: "#b91c1c" }}>
                    <ListItemIcon sx={{ color: "#b91c1c" }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* ===== BLOQUE ADMIN / INTRANET ===== */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pl: 2,
              ml: 1,
              borderLeft: "1px solid #e5e7eb",
            }}
          >
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                fontSize: 13,
                bgcolor: "#0f172a",
                color: "#f9fafb",
                "&:hover": { bgcolor: "#020617" },
              }}
            >
              Intranet
            </Button>

            <IconButton
              size="small"
              sx={{
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                ml: 0.5,
              }}
            >
              <LanguageIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}