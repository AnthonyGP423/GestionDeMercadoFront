import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import { authApi } from "../../api/auth/authApi";
import { useToast } from "../../components/ui/Toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [params] = useSearchParams();

  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      showToast("Enlace inválido o incompleto.", "error");
      navigate("/tienda", { replace: true });
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres.", "warning");
      return;
    }

    if (password !== confirm) {
      showToast("Las contraseñas no coinciden.", "warning");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: password,
      });

      setSuccess(true);
      showToast("Contraseña actualizada correctamente.", "success");

      setTimeout(() => {
        navigate("/tienda", { replace: true });
      }, 2500);
    } catch (error: any) {
        const status = error?.response?.status;
        const backendMsg =
            error?.response?.data?.mensaje ||
            error?.response?.data?.error ||
            "";

        // Token expirado o inválido
        if (
            status === 401 ||
            backendMsg.toLowerCase().includes("expir")
        ) {
            showToast(
                "El enlace de recuperación ha expirado por seguridad. Solicita nuevamente la recuperación de tu contraseña.",
                "warning"
            );

            // Redirige a forgot-password
            setTimeout(() => {
                navigate("/forgot-password", { replace: true });
            }, 2000);

            return;
        }

        // Error genérico
        showToast(
            "No fue posible actualizar la contraseña. Intenta nuevamente.",
            "error"
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
          "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)",
        position: "relative",
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
          border: "1px solid rgba(34,197,94,0.15)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 30px 60px -15px rgba(0,0,0,0.14), 0 0 0 1px rgba(34,197,94,0.25)",
          },
        }}
      >
        {!success ? (
          <>
            {/* Icono */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px rgba(34,197,94,0.35)",
                }}
              >
                <SecurityOutlinedIcon sx={{ fontSize: 38, color: "white" }} />
              </Box>
            </Box>

            <Typography variant="h5" fontWeight={800} mb={1} textAlign="center">
              Restablecer contraseña
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mb={3}
              textAlign="center"
            >
              Ingresa tu nueva contraseña para continuar.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Nueva contraseña"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#22c55e" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirmar contraseña"
                  type="password"
                  fullWidth
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#22c55e" }} />
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
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    boxShadow: "0 10px 25px rgba(34,197,94,0.35)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    },
                  }}
                >
                  {loading ? "Guardando..." : "Cambiar contraseña"}
                </Button>
              </Stack>
            </form>
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 64, color: "#16a34a", mb: 2 }}
            />
            <Typography variant="h6" fontWeight={800}>
              Contraseña actualizada
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Serás redirigido a la tienda.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}