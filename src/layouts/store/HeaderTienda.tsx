// src/components/layout/store/HeaderTienda.tsx
import { useState, MouseEvent } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Divider,
  ListItemIcon,
  Chip,
  Stack,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import LanguageIcon from "@mui/icons-material/Language";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
export default function HeaderTienda() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const rolRaw = (user?.rol || "").toUpperCase();
  const isCliente =
    isAuthenticated && (rolRaw === "CLIENTE" || rolRaw === "ROLE_CLIENTE");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleOpenProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    handleCloseProfileMenu();
    navigate(path);
  };

  const handleLogout = () => {
    handleCloseProfileMenu();
    logout();
    navigate("/");
  };

  const displayName = user?.nombreCompleto || user?.email || "Mi cuenta";
  const displayEmail = user?.email;
  const displayRol =
    rolRaw === "CLIENTE" || rolRaw === "ROLE_CLIENTE"
      ? "Cliente"
      : rolRaw || undefined;

  const avatarInitial = displayName.charAt(0).toUpperCase();

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mr: 4,
          }}
        >
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
            to="/"
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
            to="/"
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.5,
          }}
        >
          {/* BLOQUE CLIENTE / INVITADO */}
          {!isCliente && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                component={Link}
                to="/login"
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
                to="/registrate"
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
            </Box>
          )}

          {/* BLOQUE ADMIN / INTRANET */}
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
            {/* Si no está autenticado o no es cliente => mostramos Intranet */}
            {(!isAuthenticated || !isCliente) && (
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
                  "&:hover": {
                    bgcolor: "#020617",
                  },
                }}
              >
                Intranet
              </Button>
            )}

            {/* ICONO DE PERFIL PARA CLIENTE LOGUEADO */}
            {isCliente && (
              <>
                <Tooltip title={displayEmail || "Mi cuenta"}>
                  <IconButton
                    size="small"
                    onClick={handleOpenProfileMenu}
                    sx={{
                      ml: 0.5,
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      padding: 0.3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#16a34a",
                        fontSize: 14,
                      }}
                    >
                      {avatarInitial}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleCloseProfileMenu}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1.4,
                      borderRadius: 3,
                      minWidth: 260,
                      boxShadow: "0 18px 45px rgba(15,23,42,0.25)",
                      overflow: "visible",
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 18,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        boxShadow: "-1px -1px 1px rgba(148,163,184,0.3)",
                      },
                    },
                  }}
                >
                  {/* Cabecera del menú */}
                  <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: "#16a34a",
                          fontWeight: 700,
                        }}
                      >
                        {avatarInitial}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {displayName}
                        </Typography>
                        {displayEmail && (
                          <Typography
                            noWrap
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {displayEmail}
                          </Typography>
                        )}
                        {displayRol && (
                          <Box mt={0.5}>
                            <Chip
                              label={displayRol}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                bgcolor: "#ecfdf3",
                                color: "#166534",
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Opciones del menú */}
                  <MenuItem
                    onClick={() => handleNavigate("/tienda/perfil-usuario")}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    Mi perfil
                  </MenuItem>

                  <MenuItem
                    onClick={() => handleNavigate("/tienda/mis-pedidos")}
                  >
                    <ListItemIcon>
                      <ShoppingBagOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Mis pedidos
                  </MenuItem>

                  <MenuItem onClick={() => handleNavigate("/tienda/favoritos")}>
                    <ListItemIcon>
                      <FavoriteBorderOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Favoritos
                  </MenuItem>

                  <MenuItem
                    onClick={() => handleNavigate("/tienda/mis-resenas")}
                  >
                    <ListItemIcon>
                      <RateReviewOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Mis reseñas
                  </MenuItem>

                  <MenuItem
                    onClick={() =>
                      handleNavigate("/tienda/configuracion-cuenta")
                    }
                  >
                    <ListItemIcon>
                      <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Configuración
                  </MenuItem>

                  <Divider sx={{ my: 1 }} />

                  <MenuItem
                    onClick={handleLogout}
                    sx={{ color: "error.main", fontWeight: 600 }}
                  >
                    <ListItemIcon>
                      <LogoutIcon
                        fontSize="small"
                        sx={{ color: "error.main" }}
                      />
                    </ListItemIcon>
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              </>
            )}

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
