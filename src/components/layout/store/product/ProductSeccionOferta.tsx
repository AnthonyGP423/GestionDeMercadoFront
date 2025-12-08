import { Box, Typography, Paper, Stack, Chip, Rating } from "@mui/material";

type StandOferta = {
  id: number;
  nombreStand: string;
  bloque: string;
  numeroStand: string;
  precio: number;
  unidad: string;
  rating: number;
  totalValoraciones: number;
};

interface Props {
  ofertas: StandOferta[];
}

export default function ProductOffersSection({ ofertas }: Props) {
  if (!ofertas || ofertas.length === 0) return null;

  return (
    <Box sx={{ mt: 10 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        Otras opciones de compra
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Compara precios de otros stands que venden este mismo producto.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {ofertas.map((oferta) => (
          <Paper
            key={oferta.id}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                >
                  {oferta.nombreStand}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  📍 Bloque {oferta.bloque}, Puesto {oferta.numeroStand}
                </Typography>
              </Box>
              <Chip
                label="Alternativa"
                size="small"
                sx={{
                  bgcolor: "#f3f4f6",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Precio
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="baseline">
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "text.primary" }}
                  >
                    S/. {oferta.precio.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    / {oferta.unidad}
                  </Typography>
                </Stack>
              </Box>

              <Stack alignItems="flex-end">
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    bgcolor: "#fffbeb",
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  <Rating
                    value={oferta.rating}
                    readOnly
                    size="small"
                    sx={{ color: "#fbbf24", fontSize: "1rem" }}
                  />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {oferta.rating.toFixed(1)}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {oferta.totalValoraciones} opiniones
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
