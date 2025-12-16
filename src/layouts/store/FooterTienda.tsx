// src/components/layout/store/FooterTienda.tsx
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Stack,
  IconButton,
  alpha,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import CopyrightIcon from "@mui/icons-material/Copyright";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function FooterTienda() {
  const year = new Date().getFullYear();

  const footerLinks = {
    Descubre: [
      { label: "Mapa del Mercado", href: "/tienda/mapa-stand" },
      { label: "Precios Actualizados", href: "/tienda/precios-productos" },
      { label: "Categorías", href: "/tienda/precios-productos" },
      { label: "Stands Destacados", href: "/tienda/mapa-stand" },
    ],
    Información: [
      { label: "Sobre Nosotros", href: "/tienda/contacto" },
      { label: "Horarios", href: "/tienda/contacto" },
      { label: "Normativas", href: "#" },
      { label: "Preguntas Frecuentes", href: "#" },
    ],
    Legal: [
      { label: "Términos de Uso", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Aviso Legal", href: "#" },
      { label: "Accesibilidad", href: "#" },
    ],
  };

  const contactInfo = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 18 }} />,
      text: "Av. Principal s/n, Santa Anita, Lima",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 18 }} />,
      text: "(01) 123-4567",
    },
    {
      icon: <EmailIcon sx={{ fontSize: 18 }} />,
      text: "info@santaanitamarket.pe",
    },
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: "#", label: "Facebook" },
    { icon: <InstagramIcon />, href: "#", label: "Instagram" },
    { icon: <TwitterIcon />, href: "#", label: "Twitter" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "#0f172a",
        color: "#e2e8f0",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #22c55e, transparent)",
        },
      }}
    >
      <Container maxWidth="lg">
        {/* CONTENIDO PRINCIPAL */}
        <Box
          sx={{
            pt: 6,
            pb: 4,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.5fr repeat(3, 1fr)",
            },
            gap: 5,
          }}
        >
          {/* COLUMNA LOGO Y DESCRIPCIÓN */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: "#16a34a",
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(22, 163, 74, 0.3)",
                }}
              >
                <StorefrontIcon />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontFamily: '"Inter", "Poppins", sans-serif',
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Mercado Mayorista de Santa Anita
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                  }}
                ></Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                lineHeight: 1.7,
                mb: 1,
              }}
            >
              Plataforma digital oficial del Mercado Mayorista de Santa Anita.
              Conectamos a productores, comerciantes y clientes en un solo
              lugar.
            </Typography>

            {/* INFO DE CONTACTO */}
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {contactInfo.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: alpha("#22c55e", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#22c55e",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#cbd5e1", fontWeight: 500 }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* REDES SOCIALES */}
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: alpha("#ffffff", 0.05),
                    color: "#94a3b8",
                    "&:hover": {
                      bgcolor: "#22c55e",
                      color: "white",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* COLUMNAS DE ENLACES */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Box key={title}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 2.5,
                  color: "#f8fafc",
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px",
                }}
              >
                {title}
              </Typography>
              <Stack spacing={1.5}>
                {links.map((link) => (
                  <MuiLink
                    key={link.label}
                    href={link.href}
                    underline="none"
                    sx={{
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      "&:hover": {
                        color: "#22c55e",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                      "&::before": {
                        content: '"›"',
                        fontSize: "1.2rem",
                        color: "#22c55e",
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                      },
                      "&:hover::before": {
                        opacity: 1,
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        {/* DIVISOR */}
        <Divider
          sx={{
            my: 2,
            bgcolor: alpha("#ffffff", 0.1),
          }}
        />

        {/* PIE INFERIOR */}
        <Box
          sx={{
            py: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#94a3b8",
            }}
          >
            <CopyrightIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {year} AdminMarket. Todos los derechos reservados.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: "0.75rem",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#94a3b8",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
              Sistema en línea
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <MuiLink
                href="#"
                underline="none"
                sx={{
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  "&:hover": { color: "#22c55e" },
                }}
              >
                Términos
              </MuiLink>
              <MuiLink
                href="#"
                underline="none"
                sx={{
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  "&:hover": { color: "#22c55e" },
                }}
              >
                Privacidad
              </MuiLink>
              <MuiLink
                href="/tienda/contacto"
                underline="none"
                sx={{
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  "&:hover": { color: "#22c55e" },
                }}
              >
                Contacto
              </MuiLink>
            </Box>
          </Box>
        </Box>

        {/* BADGE OFICIAL */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            borderRadius: 3,
            bgcolor: alpha("#22c55e", 0.1),
            border: `1px solid ${alpha("#22c55e", 0.2)}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              animation: "pulse 1.5s infinite",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "#22c55e",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.5px",
            }}
          >
            Plataforma Oficial
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
