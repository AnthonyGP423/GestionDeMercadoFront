// src/pages/Store/Contacto.tsx
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Chip,
} from "@mui/material";

import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShareIcon from "@mui/icons-material/Share";

import PublicHeader from "../../components/layout/store/HeaderTienda";
import PublicFooter from "../../components/layout/store/FooterTienda";

export default function Contacto() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        backgroundImage:
          "radial-gradient(circle at 15% 50%, rgba(22, 163, 74, 0.05) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.05) 0%, transparent 25%)",
      }}
    >
      <PublicHeader />

      <Box sx={{ flexGrow: 1, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* CABECERA DE LA PÁGINA */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Chip
              label="Centro de ayuda"
              size="small"
              sx={{
                mb: 2,
                px: 2,
                py: 0.5,
                bgcolor: "rgba(22,163,74,0.08)",
                color: "#166534",
                fontWeight: 600,
                borderRadius: 999,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontFamily: '"Inter","Poppins",sans-serif',
                color: "#1e293b",
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 4,
                  bgcolor: "#16a34a",
                  borderRadius: 2,
                },
              }}
            >
              Contáctanos
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 640,
                mx: "auto",
                fontSize: "1.05rem",
              }}
            >
              ¿Tienes dudas sobre los stands, productos o la plataforma?
              Escríbenos y el equipo de <strong>AdminMarket</strong> te
              responderá lo antes posible.
            </Typography>
          </Box>

          {/* INFORMACIÓN + FORMULARIO */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              alignItems: "stretch",
            }}
          >
            {/* COLUMNA INFORMACIÓN */}
            <Box sx={{ flex: { xs: 1, md: 5 }, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}
                >
                  Información del Mercado
                </Typography>

                <Stack spacing={2.5}>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(22,163,74,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                      }}
                    >
                      <PlaceIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.2 }}
                      >
                        Dirección
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Av. Los Comerciantes 123
                        <br />
                        San Juan de Miraflores, Lima – Perú
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(22,163,74,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                      }}
                    >
                      <PhoneIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.2 }}
                      >
                        Teléfono
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (+51) 987 654 321
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(22,163,74,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                      }}
                    >
                      <EmailIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.2 }}
                      >
                        Correo electrónico
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        soporte@adminmarket.pe
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(22,163,74,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                      }}
                    >
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.2 }}
                      >
                        Horario de atención
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lunes a Sábado: 5:00 a.m. – 6:00 p.m.
                        <br />
                        Domingo: 6:00 a.m. – 2:00 p.m.
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(22,163,74,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.2 }}
                      >
                        Redes sociales
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Facebook · Instagram · WhatsApp
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* COLUMNA FORMULARIO */}
            <Box sx={{ flex: { xs: 1, md: 7 }, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 3, color: "#0f172a" }}
                >
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
                    sx={{
                      borderRadius: 999,
                      alignSelf: "flex-start",
                      px: 4,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
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
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1.5, color: "#0f172a" }}
              >
                ¿Cómo llegar?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Visualiza la ubicación del mercado directamente en el mapa.
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  height: { xs: 260, sm: 320 },
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

      <PublicFooter />
    </Box>
  );
}
