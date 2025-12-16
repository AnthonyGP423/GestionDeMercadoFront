import {
  Box,
  Paper,
  Stack,
  Typography,
  Avatar,
  Rating,
  TextField,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";

type Comentario = {
  id: number;
  autor: string;
  fecha: string;
  comentario: string;
  rating: number;
};

export default function ProductReviewsSection() {
  const theme = useTheme();

  const [comentarios] = useState<Comentario[]>([
    {
      id: 1,
      autor: "María López",
      fecha: "Hace 2 días",
      comentario:
        "La calidad es increíble, muy dulces y llegaron en perfecto estado. Definitivamente volveré a comprar a este stand.",
      rating: 5,
    },
    {
      id: 2,
      autor: "Carlos Gómez",
      fecha: "Hace 1 semana",
      comentario:
        "Buen precio y buen tamaño. Algunos estaban un poco más maduros de lo que esperaba, pero estaban ricos.",
      rating: 4,
    },
  ]);

  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nuevoRating, setNuevoRating] = useState<number | null>(5);

  const handleAgregarComentario = () => {
    if (!nuevoComentario.trim() || !nuevoRating) return;
    setNuevoComentario("");
    alert("Comentario enviado (simulado)");
  };

  return (
    <Box sx={{ mt: 10, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        Opiniones de clientes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Descubre lo que otros compradores piensan sobre este producto.
      </Typography>

      {/* Formulario */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack spacing={3}>
          <Typography variant="subtitle1" fontWeight={700}>
            Deja tu valoración
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              component="legend"
              sx={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              Calificación:
            </Typography>
            <Rating
              value={nuevoRating}
              onChange={(_, value) => setNuevoRating(value)}
              size="medium"
              sx={{ color: "#fbbf24" }}
            />
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="¿Qué te pareció el producto? Comparte tu experiencia..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: "#fff" }}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleAgregarComentario}
            sx={{
              alignSelf: "flex-end",
              px: 4,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Publicar opinión
          </Button>
        </Stack>
      </Paper>

      {/* Lista de comentarios */}
      <Stack spacing={3}>
        {comentarios.map((c) => (
          <Paper
            key={c.id}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#ffffff",
              boxShadow:
                "0 2px 4px -2px rgb(0 0 0 / 0.05), 0 4px 6px -1px rgb(0 0 0 / 0.05)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.light,
                  width: 48,
                  height: 48,
                  fontWeight: 700,
                }}
              >
                {c.autor.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.5}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {c.autor}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {c.fecha}
                  </Typography>
                </Stack>
                <Rating
                  value={c.rating}
                  readOnly
                  size="small"
                  sx={{ color: "#fbbf24", mb: 1.5 }}
                />
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {c.comentario}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
