import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../auth/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [user, setUser] = useState<string>(""); // email
  const [pass, setPass] = useState<string>(""); // password
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

      const data = response.data; // { token, tipoToken, email, rol }

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
        background:
          "linear-gradient(to bottom right, #f5f5f5, #e5e7eb)", // mismo tono claro, más moderno
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 4,
          bgcolor: "#ffffff",
          boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Cabecera */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: "0.16em",
              fontSize: 11,
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            PANEL ADMINISTRATIVO
          </Typography>

          <Typography
            variant="h4"
            textAlign="left"
            sx={{
              mt: 1,
              mb: 1,
              fontWeight: 800,
              fontFamily:
                `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
            }}
          >
            Gestión de Mercado Mayorista
          </Typography>

          <Typography
            variant="body2"
            textAlign="left"
            sx={{ color: "text.secondary" }}
          >
            Control de stands, socios y supervisión del mercado mayorista.
          </Typography>
        </Box>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              size="small"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: 3,
                },
              }}
            />

            <TextField
              label="Contraseña"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: 3,
                },
              }}
            />

            {/* Mensaje de error si el backend responde con error */}
            {errorMsg && (
              <Box
                sx={{
                  mt: 0.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "#fee2e2",
                  border: "1px solid #fecaca",
                }}
              >
                <Typography
                  variant="body2"
                  color="error"
                  textAlign="center"
                  sx={{ fontSize: 13 }}
                >
                  {errorMsg}
                </Typography>
              </Box>
            )}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
            >
              <Typography variant="body2" color="text.secondary">
                ¿No tienes cuenta?
              </Typography>

              <Button
                size="small"
                variant="text"
                onClick={handleRegister}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              >
                Regístrate
              </Button>
            </Stack>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                borderRadius: "999px",
                py: 1.1,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 10px 25px rgba(34,197,94,0.35)",
                backgroundColor: "#22c55e",
                "&:hover": {
                  backgroundColor: "#16a34a",
                  boxShadow: "0 12px 30px rgba(22,163,74,0.45)",
                },
              }}
            >
              {loading ? "Ingresando..." : "Entrar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;