import { useState, FormEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Registrate = () => {
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !user.trim() || !pass.trim() || !confirmPass.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    if (pass !== confirmPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    alert("Cuenta creada exitosamente (simulado)");
  };

  const handleGoLogin = () => {
    navigate("/login");
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
          width: "380px",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" textAlign="center" mb={3}>
          Crear Cuenta
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre completo"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <TextField
            label="Confirmar contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          {/* Volver al login */}
          <Stack direction="row" justifyContent="end" mt={1} mb={1}>
            <Button variant="text" size="small" onClick={handleGoLogin}>
              ¿Ya tienes cuenta?
            </Button>
          </Stack>

          <Button fullWidth type="submit" variant="contained" sx={{ mt: 1 }}>
            Registrarse
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Registrate;
