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

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user.trim() === "" || pass.trim() === "") {
      alert("Por favor completa todos los campos.");
      return;
    }

    alert(`Bienvenido, ${user}!`);
    navigate("/dashboard/principal");
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

          <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
