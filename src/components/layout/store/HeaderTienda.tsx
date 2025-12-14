// src/components/layout/store/HeaderTienda.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LanguageIcon from "@mui/icons-material/Language";
import { Link } from "react-router-dom";

export default function HeaderTienda() {
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
          {/* BLOQUE CLIENTE DEL MERCADO */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              component={Link}
              to="/auth/login-cliente"
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
              to="/auth/registro-cliente"
              variant="text"
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                color: "#16a34a",
                px: 0.5,
                "&:hover": { color: "#0f766e", backgroundColor: "transparent" },
              }}
            >
              Registrarme
            </Button>
          </Box>

          {/* BLOQUE ADMIN / INTRANET (más a la derecha y diferente color) */}
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
            {isLoggedIn ? (
              <Button
                component={Link}
                to="/"
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
                Panel
              </Button>
            ) : (
              <Button
                component={Link}
                to="/login" // login de intranet
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