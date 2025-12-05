// src/components/layout/HeaderTienda.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";

export default function HeaderTienda() {
  // TODO: aquí luego conectas con tu auth real
  const isLoggedIn = false;

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
      <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        {/* LOGO + NOMBRE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 4 }}>
          <StorefrontIcon color="success" />
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 800,
            }}
          >
            AdminMarket
          </Typography>
        </Box>

        {/* LINKS PRINCIPALES */}
        <Box sx={{ display: "flex", gap: 3, flexGrow: 1 }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Inicio
          </Button>

          <Button
            component={Link}
            to="/tienda/precios-productos"
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Productos
          </Button>

          <Button
            component={Link}
            to="/tienda/contacto"
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Contacto
          </Button>
        </Box>

        {/* INICIAR SESIÓN / PERFIL */}
        {isLoggedIn ? (
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        ) : (
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            Iniciar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
