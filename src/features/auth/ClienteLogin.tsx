import { useNavigate, useLocation } from "react-router-dom";
import { useState, FormEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import { authApi } from "../../api/auth/authApi";
import { useAuth } from "../../auth/useAuth";

const amber = "#f59e0b";
const amberDark = "#b45309";

export default function ClienteLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // ✅ si vienes desde PerfilStand, PerfilUsuario, etc.
  const from = (location.state as any)?.from || "/tienda";

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user.trim() || !pass.trim()) {
      setErrorMsg("Por favor completa todos los campos.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const response = await authApi.login({ email: user, password: pass });
      const data = response.data;

      const rol = String(data.rol ?? "").toUpperCase();

      // ✅ Login Cliente: SOLO CLIENTE
      if (rol !== "CLIENTE" && rol !== "ROLE_CLIENTE") {
        setErrorMsg(
          rol === "ADMIN" || rol === "SUPERVISOR"
            ? "Este acceso es para clientes. Usa el Login Administrativo."
            : rol === "SOCIO"
            ? "Este acceso es para clientes. Usa el Login de Socio."
            : "Rol no permitido para el Login de Cliente."
        );
        return;
      }

      // ✅ guarda token + user (mejor: rol normalizado)
      login(data.token, { email: data.email, rol: "CLIENTE" });

      // ✅ vuelve a donde estaba (stand, perfil, etc.)
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error(error);
      const mensajeBackend =
        error?.response?.data?.mensaje ||
        error?.response?.data?.error ||
        "Credenciales inválidas. Verifica tu correo y contraseña.";
      setErrorMsg(mensajeBackend);
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
          "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-45%",
          right: "-10%",
          width: "620px",
          height: "620px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-35%",
          left: "-10%",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(180,83,9,0.08) 0%, transparent 70%)",
          animation: "float 16s ease-in-out infinite reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(28px, -28px) scale(1.05)" },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 440,
          borderRadius: 5,
          bgcolor: "#ffffff",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.03)",
          border: "1px solid rgba(245,158,11,0.15)",
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(18px)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              "0 30px 60px -15px rgba(0,0,0,0.14), 0 0 0 1px rgba(245,158,11,0.25)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Icono */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${amber} 0%, ${amberDark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(245,158,11,0.35)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: "22px",
                padding: "2px",
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.45), rgba(180,83,9,0.20))",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              },
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 38, color: "white" }} />
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: "0.2em",
              fontSize: 10.5,
              fontWeight: 700,
              color: amber,
              textTransform: "uppercase",
              display: "block",
              mb: 1.5,
            }}
          >
            Acceso de Cliente
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              background: `linear-gradient(135deg, ${amberDark} 0%, ${amber} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily:
                '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
              lineHeight: 1.2,
            }}
          >
            Mercado Mayorista de Santa Anita
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 340,
              mx: "auto",
            }}
          >
            Inicia sesión para guardar favoritos, calificar stands y ver tu
            experiencia personalizada.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Correo electrónico"
              fullWidth
              value={user}
              onChange={(e) => setUser(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: amber, fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": { borderColor: "rgba(245,158,11,0.20)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.35) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: `${amber} !important`,
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: { "&.Mui-focused": { color: amber } },
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: amber, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": { borderColor: "rgba(245,158,11,0.20)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.35) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: `${amber} !important`,
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: { "&.Mui-focused": { color: amber } },
              }}
            />

            {errorMsg && (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2.5,
                  bgcolor: "#fff1f2",
                  border: "1px solid #fecdd3",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    color: "#be123c",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {errorMsg}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1.5,
                borderRadius: "999px",
                py: 1.5,
                textTransform: "none",
                fontWeight: 800,
                fontSize: 15,
                boxShadow: "0 10px 25px rgba(245,158,11,0.35)",
                background: `linear-gradient(135deg, ${amber} 0%, ${amberDark} 100%)`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${amberDark} 0%, #92400e 100%)`,
                  boxShadow: "0 15px 35px rgba(180,83,9,0.45)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>

            <Box
              sx={{
                mt: 2,
                pt: 2.5,
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: 14 }}
              >
                ¿No tienes cuenta?
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => navigate("/cliente/registro")}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: 14,
                  color: amberDark,
                  borderRadius: 2,
                  px: 2,
                  "&:hover": { bgcolor: "rgba(245,158,11,0.10)" },
                }}
              >
                Regístrate
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}