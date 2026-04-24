import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import { authApi } from "../../api/auth/authApi";
import { useToast } from "../../components/ui/Toast";

interface Props {
  variant: "intranet" | "cliente";
}

export default function ForgotPassword({ variant }: Props) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const volverRuta =
    variant === "cliente" ? "/cliente/login" : "/login";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast("Ingresa tu correo electrónico", "warning");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      showToast(
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        "success"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        background:
          variant === "cliente"
            ? "linear-gradient(135deg, #fffbeb, #fef3c7)"
            : "linear-gradient(135deg, #ecfdf5, #d1fae5)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 420,
          borderRadius: 5,
          bgcolor: "#ffffff",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.02)",
          transition: "all 0.3s ease",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background:
                variant === "cliente"
                  ? "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)"
                  : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
          >
            <MarkEmailReadOutlinedIcon
              sx={{ fontSize: 38, color: "white" }}
            />
          </Box>
        </Box>

        <Typography variant="h5" fontWeight={800} textAlign="center" mb={1}>
          Recuperar contraseña
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Ingresa tu correo y te enviaremos un enlace de recuperación.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Correo electrónico"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "999px",
                py: 1.5,
                fontWeight: 800,
              }}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>

            <Button
              startIcon={<ArrowBackIcon />}
              variant="text"
              onClick={() => navigate(volverRuta)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Volver al login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}