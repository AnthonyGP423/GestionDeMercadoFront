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

  const [user, setUser] = useState<string>("");    // email
  const [pass, setPass] = useState<string>("");    // password
  const [loading, setLoading] = useState(false);   
  const [errorMsg, setErrorMsg] = useState("");    

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user.trim() === "" || pass.trim() === "") {
      alert("Por favor completa todos los campos.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // Llamamos a /api/auth/login
      const response = await authApi.login({
        email: user,
        password: pass,
      });

      const data = response.data; // { token, tipoToken, email, rol }

      // Guardamos token y datos de usuario en el contexto (y localStorage)
      login(data.token, {
        email: data.email,
        rol: data.rol,
      });

      // Navegamos al panel principal
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
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: "350px",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" textAlign="center" mb={3} fontWeight="bold">
          Gestión De Mercado Mayorista
        </Typography>

        <Typography variant="body1" textAlign="center" mb={1} color="gray">
          Control de stands, socios y supervisión del mercado mayorista
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            mb={1}
          >
            <Typography variant="body2">¿No tienes cuenta?</Typography>

            <Button size="small" variant="text" onClick={handleRegister}>
              Regístrate
            </Button>
          </Stack>

          {/* Mensaje de error si el backend responde con error */}
          {errorMsg && (
            <Typography
              variant="body2"
              color="error"
              mt={1}
              textAlign="center"
            >
              {errorMsg}
            </Typography>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
