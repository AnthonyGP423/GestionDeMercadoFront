import { Box, Typography, Paper, Stack, Chip, Rating } from "@mui/material";

export type StandOferta = {
  id: number; // id de la oferta / relación
  nombreStand: string; // viene de la API
  bloque: string; // bloque del stand
  numeroStand: string; // número de puesto
  precio: number; // Number(precio) en el mapeo desde el backend
  unidad: string; // "kg", "unidad", etc.
  rating?: number | null; // puede venir null o no venir
  totalValoraciones?: number | null;
  imagenUrl?: string | null;
};

interface Props {
  ofertas: StandOferta[];
}

const FALLBACK_IMG = "https://via.placeholder.com/800x600?text=Sin+imagen";

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
        {ofertas.map((oferta) => {
          const ratingValue = oferta.rating ?? 0;
          const totalValoraciones = oferta.totalValoraciones ?? 0;

          return (
            <Paper
              key={oferta.id}
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 3,
                bgcolor: "#ffffff",
                overflow: "hidden",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                },
              }}
            >
              {/* ✅ IMAGEN (sin romper: si no viene, muestra fallback) */}
              <Box
                sx={{
                  width: "100%",
                  height: 160,
                  backgroundImage: oferta.imagenUrl
                    ? `url(${oferta.imagenUrl})`
                    : `url(${FALLBACK_IMG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                {/* chip arriba para mantener identidad visual */}
                <Chip
                  label="Alternativa"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: "rgba(243,244,246,0.92)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    backdropFilter: "blur(6px)",
                  }}
                />
              </Box>

              {/* CONTENIDO */}
              <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                    {ratingValue > 0 ? (
                      <>
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
                            value={ratingValue}
                            readOnly
                            size="small"
                            precision={0.5}
                            sx={{ color: "#fbbf24", fontSize: "1rem" }}
                          />
                          <Typography variant="subtitle2" fontWeight={700}>
                            {ratingValue.toFixed(1)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {totalValoraciones} opiniones
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin valoraciones
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}