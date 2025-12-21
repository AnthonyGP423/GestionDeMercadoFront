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

import PublicHeader from "../../../layouts/store/HeaderTienda";
import PublicFooter from "../../../layouts/store/FooterTienda";

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

      <Box sx={{ flexGrow: 1, py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* CABECERA DE LA PÁGINA REESTRUCTURADA */}
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 5, md: 8 }, // Aumentamos margen para separar de los formularios
              px: { xs: 1, sm: 0 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Título Principal */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2, // Espacio antes del Chip
                fontFamily: '"Inter","Poppins",sans-serif',
                color: "#1e293b",
                position: "relative",
                display: "inline-block",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 50,
                  height: 4,
                  bgcolor: "#16a34a",
                  borderRadius: 2,
                },
              }}
            >
              Contáctanos
            </Typography>

            {/* Chip debajo de Contáctanos */}
            <Chip
              label="Centro de ayuda"
              size="small"
              sx={{
                mb: 3, // Espacio antes del párrafo
                mt: 1,
                px: 1.5,
                py: 0.5,
                bgcolor: "rgba(22,163,74,0.08)",
                color: "#166534",
                fontWeight: 700,
                borderRadius: 2, // Estilo más moderno
                fontSize: { xs: 11, sm: 12 },
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            />

            {/* Descripción */}
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.7,
                fontSize: { xs: "1rem", sm: "1.1rem" },
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
              flexDirection: { xs: "column-reverse", md: "row" },
              gap: { xs: 4, md: 5 },
              alignItems: { xs: "stretch", md: "flex-start" },
            }}
          >
            {/* COLUMNA INFORMACIÓN */}
            <Box sx={{ flex: { xs: "none", md: 4.5 }, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 5,
                  bgcolor: "#ffffff",
                  boxShadow: "0 10px 40px rgba(15,23,42,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 4,
                    color: "#0f172a",
                    fontSize: { xs: "1.2rem", sm: "1.3rem" },
                  }}
                >
                  Datos de contacto
                </Typography>

                <Stack spacing={4}>
                  {[
                    {
                      icon: <PlaceIcon />,
                      title: "Dirección",
                      desc: "Av. Los Comerciantes 123, SJM, Lima",
                    },
                    {
                      icon: <PhoneIcon />,
                      title: "Teléfono",
                      desc: "(+51) 987 654 321",
                    },
                    {
                      icon: <EmailIcon />,
                      title: "Correo",
                      desc: "soporte@adminmarket.pe",
                    },
                    {
                      icon: <AccessTimeIcon />,
                      title: "Horario",
                      desc: "Lun-Sáb: 5am - 6pm / Dom: 6am - 2pm",
                    },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 2.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 3,
                          bgcolor: "rgba(22,163,74,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#16a34a",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: "#334155",
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: 14, mt: 0.5, lineHeight: 1.4 }}
                        >
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  <Divider />

                  <Box sx={{ display: "flex", gap: 2.5, alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        bgcolor: "rgba(22,163,74,0.1)",
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
                        sx={{ fontWeight: 800, fontSize: 14 }}
                      >
                        Síguenos
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 14 }}
                      >
                        Facebook · Instagram · WhatsApp
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* COLUMNA FORMULARIO */}
            <Box sx={{ flex: { xs: "none", md: 7.5 }, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 5 },
                  borderRadius: 5,
                  bgcolor: "#ffffff",
                  boxShadow: "0 10px 40px rgba(15,23,42,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 4,
                    color: "#0f172a",
                    fontSize: { xs: "1.2rem", sm: "1.3rem" },
                  }}
                >
                  Envíanos un mensaje
                </Typography>

                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: "#fcfcfc",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      type="email"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: "#fcfcfc",
                        },
                      }}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Asunto"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#fcfcfc",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mensaje"
                    variant="outlined"
                    multiline
                    minRows={6}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#fcfcfc",
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      alignSelf: { xs: "stretch", sm: "flex-start" },
                      px: { xs: 0, sm: 8 },
                      fontWeight: 800,
                      textTransform: "none",
                      fontSize: "1.05rem",
                      bgcolor: "#16a34a",
                      boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)",
                      "&:hover": { bgcolor: "#15803d" },
                    }}
                  >
                    Enviar mensaje
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Box>

          {/* MAPA */}
          <Box sx={{ mt: { xs: 5, md: 8 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 5,
                bgcolor: "#ffffff",
                boxShadow: "0 10px 40px rgba(15,23,42,0.05)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <Box sx={{ mb: 3, px: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
                >
                  ¿Cómo llegar?
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 14 }}
                >
                  Estamos ubicados en el corazón de San Juan de Miraflores.
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  height: { xs: 280, sm: 400 },
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Box
                  component="iframe"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15601.766341490226!2d-76.963283!3d-12.14995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0 }}
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
