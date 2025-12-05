// src/components/layout/FooterTienda.tsx
import { Box, Typography } from "@mui/material";

export default function FooterTienda() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {year} AdminMarket. Todos los derechos reservados.
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Sistema de gestión de mercado y catálogo de productos.
      </Typography>
    </Box>
  );
}
