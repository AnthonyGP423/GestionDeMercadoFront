import { Box, Typography } from "@mui/material";
export default function SocioHome() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Dashboard Socio
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        Aquí irá el resumen de puestos, cuotas, incidencias y credencial.
      </Typography>
    </Box>
  );
}