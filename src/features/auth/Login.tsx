import { useNavigate } from "react-router-dom";
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
import { authApi } from "../../api/auth/authApi";
import { useAuth } from "../../auth/useAuth";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import StorefrontIcon from "@mui/icons-material/Storefront";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user.trim() === "" || pass.trim() === "") {
      setErrorMsg("Por favor completa todos los campos.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const response = await authApi.login({
        email: user,
        password: pass,
      });

      const data = response.data;

      login(data.token, {
        email: data.email,
        rol: data.rol,
      });

      navigate("/dashboard/principal");
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

  const handleRegister = () => {
    navigate("/registrate");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        background: "linear-gradient(to bottom right, #f5f5f5, #e5e7eb)", // mismo tono claro, más moderno
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 440,
          borderRadius: 5,
          bgcolor: "#ffffff",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
          border: "1px solid rgba(34,197,94,0.08)",
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              "0 30px 60px -15px rgba(0,0,0,0.12), 0 0 0 1px rgba(34,197,94,0.15)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Icono decorativo */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(34,197,94,0.3)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: "22px",
                padding: "2px",
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.4), rgba(22,163,74,0.2))",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              },
            }}
          >
            <StorefrontIcon sx={{ fontSize: 38, color: "white" }} />
          </Box>
        </Box>

        {/* Cabecera */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: "0.2em",
              fontSize: 10.5,
              fontWeight: 700,
              color: "#22c55e",
              textTransform: "uppercase",
              display: "block",
              mb: 1.5,
            }}
          >
            Panel Administrativo
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              fontFamily: `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
            }}
          >
            Mercado Mayorista
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
            Gestión integral de stands, socios y supervisión del mercado
          </Typography>
        </Box>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Correo electrónico"
              variant="outlined"
              fullWidth
              value={user}
              onChange={(e) => setUser(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon
                      sx={{ color: "#22c55e", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#f9fafb",
                  "& fieldset": {
                    borderColor: "rgba(34,197,94,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(34,197,94,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#22c55e !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#22c55e",
                  },
                },
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#22c55e", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
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
                  bgcolor: "#f9fafb",
                  "& fieldset": {
                    borderColor: "rgba(34,197,94,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(34,197,94,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#22c55e !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#22c55e",
                  },
                },
              }}
            />

            {errorMsg && (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2.5,
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  animation: "shake 0.4s",
                  "@keyframes shake": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "25%": { transform: "translateX(-8px)" },
                    "75%": { transform: "translateX(8px)" },
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    color: "#dc2626",
                    fontWeight: 500,
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
                fontWeight: 700,
                fontSize: 15,
                boxShadow: "0 10px 25px rgba(34,197,94,0.35)",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
                  opacity: 0,
                  transition: "opacity 0.3s",
                },
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  boxShadow: "0 15px 35px rgba(22,163,74,0.45)",
                  transform: "translateY(-1px)",
                  "&::before": {
                    opacity: 1,
                  },
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&:disabled": {
                  background:
                    "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
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
                onClick={handleRegister}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#22c55e",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": {
                    bgcolor: "rgba(34,197,94,0.08)",
                    color: "#16a34a",
                  },
                }}
              >
                Regístrate aquí
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
