import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

export default function Contacto() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP BAR PÚBLICA */}
      <PublicHeader />

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{ flexGrow: 1, py: 6 }}>
        <Container maxWidth="lg">
          {/* TÍTULO + DESCRIPCIÓN */}
          <Box sx={{ textAlign: "center", mb: 5, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Contáctanos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ¿Tienes dudas sobre los stands, productos o la plataforma?
              Escríbenos y el equipo de <strong>AdminMarket</strong> te
              responderá lo antes posible.
            </Typography>
          </Box>

          {/* LAYOUT PRINCIPAL */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              alignItems: "start",
            }}
          >
            {/* --- COLUMNA IZQUIERDA: INFORMACIÓN --- */}
            <Box sx={{ flex: { xs: 1, md: 5 }, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Información del Mercado
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Dirección
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Av. Los Comerciantes 123
                      <br />
                      San Juan de Miraflores, Lima – Perú
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Teléfono
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (+51) 987 654 321
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Correo electrónico
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      soporte@adminmarket.pe
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Horario de atención
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lunes a Sábado: 5:00 a.m. – 6:00 p.m.
                      <br />
                      Domingo: 6:00 a.m. – 2:00 p.m.
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Redes sociales
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Facebook · Instagram · WhatsApp
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* --- COLUMNA DERECHA: FORMULARIO --- */}
            <Box sx={{ flex: { xs: 1, md: 7 }, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Envíanos un mensaje
                </Typography>

                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      type="email"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Asunto"
                    variant="outlined"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Mensaje"
                    variant="outlined"
                    multiline
                    minRows={4}
                  />

                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ borderRadius: 999, alignSelf: "flex-start" }}
                  >
                    Enviar mensaje
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Box>

          {/* MAPA / CÓMO LLEGAR */}
          <Box sx={{ mt: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "#ffffff",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                ¿Cómo llegar?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Visualiza la ubicación del mercado directamente en el mapa.
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box
                  component="iframe"
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3900.4019921225045!2d-76.98261291466386!3d-12.153011957388744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTLCsDA5JzEwLjgiUyA3NsKwNTgnMzkuOSJX!5e0!3m2!1ses-419!2sus!4v1765327369647!5m2!1ses-419!2sus"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0 }}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <PublicFooter />
    </Box>
  );
}
