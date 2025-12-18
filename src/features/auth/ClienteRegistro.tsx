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
import { useNavigate } from "react-router-dom";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";

// ✅ Importar la API real
import { clientePublicApi } from "../../api/public/clientePublicApi";

const Registrate = () => {
  const navigate = useNavigate();

  const [nombres, setNombres] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Validación con los campos correctos
    if (!nombres.trim() || !apellidos.trim() || !email.trim() || !pass.trim() || !confirmPass.trim()) {
      setErrorMsg("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (pass !== confirmPass) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // ✅ Llamada REAL al API de registro de clientes
      await clientePublicApi.registrar({
        email: email.trim(),
        password: pass,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim() || undefined,
      });

      // ✅ Redirigir al LOGIN DE CLIENTE después de registrar exitosamente
      navigate("/cliente/login", { replace: true });
    } catch (error: any) {
      console.error("Error al registrar cliente:", error);
      const mensajeBackend =
        error?.response?.data?.mensaje ||
        error?.response?.data?.error ||
        "No se pudo crear la cuenta. Intenta nuevamente.";
      setErrorMsg(mensajeBackend);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navegar al LOGIN DE CLIENTE, no al admin
  const handleGoLogin = () => navigate("/cliente/login");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)",
          animation: "float 15s ease-in-out infinite reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(30px, -30px) scale(1.05)" },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 500,
          borderRadius: 5,
          bgcolor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
          border: "1px solid rgba(245,158,11,0.08)",
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 30px 60px -15px rgba(0,0,0,0.12), 0 0 0 1px rgba(245,158,11,0.15)",
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
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(245,158,11,0.3)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: "22px",
                padding: "2px",
                background: "linear-gradient(135deg, rgba(245,158,11,0.4), rgba(217,119,6,0.2))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
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
              color: "#f59e0b",
              textTransform: "uppercase",
              display: "block",
              mb: 1.5,
            }}
          >
            Registro de Cliente
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              background: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
              lineHeight: 1.2,
            }}
          >
            Crear Cuenta
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 400,
              mx: "auto",
            }}
          >
            Regístrate para acceder a favoritos, calificaciones y funciones de la tienda
          </Typography>
        </Box>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Nombres"
              variant="outlined"
              fullWidth
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": {
                    borderColor: "rgba(245,158,11,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f59e0b !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#f59e0b",
                  },
                },
              }}
            />

            <TextField
              label="Apellidos"
              variant="outlined"
              fullWidth
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": {
                    borderColor: "rgba(245,158,11,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f59e0b !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#f59e0b",
                  },
                },
              }}
            />

            <TextField
              label="Teléfono (opcional)"
              variant="outlined"
              fullWidth
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphoneOutlinedIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": {
                    borderColor: "rgba(245,158,11,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f59e0b !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#f59e0b",
                  },
                },
              }}
            />

            <TextField
              label="Correo electrónico"
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": {
                    borderColor: "rgba(245,158,11,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f59e0b !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#f59e0b",
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
                    <LockOutlinedIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
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
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": {
                    borderColor: "rgba(245,158,11,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f59e0b !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#f59e0b",
                  },
                },
              }}
            />

            <TextField
              label="Confirmar contraseña"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CheckCircleOutlineIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "text.secondary" }}
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: "#fffbeb",
                  "& fieldset": {
                    borderColor: "rgba(245,158,11,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(245,158,11,0.3) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#f59e0b !important",
                    borderWidth: "2px !important",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#f59e0b",
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
                boxShadow: "0 10px 25px rgba(245,158,11,0.35)",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
                  opacity: 0,
                  transition: "opacity 0.3s",
                },
                "&:hover": {
                  background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                  boxShadow: "0 15px 35px rgba(217,119,6,0.45)",
                  transform: "translateY(-1px)",
                  "&::before": {
                    opacity: 1,
                  },
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <Box
              sx={{
                mt: 2,
                pt: 2.5,
                borderTop: "1px solid #fef3c7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 14 }}>
                ¿Ya tienes cuenta?
              </Typography>

              <Button
                size="small"
                variant="text"
                onClick={handleGoLogin}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#f59e0b",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": {
                    bgcolor: "rgba(245,158,11,0.08)",
                    color: "#d97706",
                  },
                }}
              >
                Inicia sesión
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Registrate;