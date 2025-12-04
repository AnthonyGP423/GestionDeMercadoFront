import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";

import { useState } from "react";

export default function Reportes() {
  const [reporteSeleccionado, setReporteSeleccionado] = useState("actividad");

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    rol: "Todos",
    estado: "Todos",
  });

  const handleChangeFiltros = (field: string, value: string) => {
    setFiltros({ ...filtros, [field]: value });
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      rol: "Todos",
      estado: "Todos",
    });
  };

  // Función auxiliar para estilos de tarjeta (para no repetir código)
  const getCardStyle = (tipo: string) => ({
    p: 3,
    borderRadius: 3,
    cursor: "pointer",
    border:
      reporteSeleccionado === tipo ? "2px solid #4CAF50" : "1px solid #eee",
    "&:hover": { boxShadow: 3 },
    flex: 1, // Esto hace que ocupen el mismo ancho en la fila flex
  });

  return (
    <Box>
      {/* TÍTULO */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Reportes
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Genera y visualiza informes clave sobre la operación del mercado.
        </Typography>
      </Stack>

      {/* --- CARDS DE TIPOS DE REPORTE (Sin Grid) --- */}
      {/* Usamos Box con flex para la fila responsiva */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Columna en móvil, Fila en PC
          gap: 2,
          mb: 4,
        }}
      >
        {/* Ocupación */}
        <Paper
          elevation={reporteSeleccionado === "ocupacion" ? 3 : 0}
          onClick={() => setReporteSeleccionado("ocupacion")}
          sx={getCardStyle("ocupacion")}
        >
          <AssessmentIcon sx={{ color: "#4CAF50", fontSize: 35 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Ocupación
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Analiza disponibilidad.
          </Typography>
        </Paper>

        {/* Actividad */}
        <Paper
          elevation={reporteSeleccionado === "actividad" ? 3 : 0}
          onClick={() => setReporteSeleccionado("actividad")}
          sx={getCardStyle("actividad")}
        >
          <PeopleIcon sx={{ color: "#4CAF50", fontSize: 35 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Actividad
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Monitorea usuarios.
          </Typography>
        </Paper>

        {/* Estados */}
        <Paper
          elevation={reporteSeleccionado === "estados" ? 3 : 0}
          onClick={() => setReporteSeleccionado("estados")}
          sx={getCardStyle("estados")}
        >
          <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 35 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Estados
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Estado de los stands.
          </Typography>
        </Paper>

        {/* Categorías */}
        <Paper
          elevation={reporteSeleccionado === "categorias" ? 3 : 0}
          onClick={() => setReporteSeleccionado("categorias")}
          sx={getCardStyle("categorias")}
        >
          <StarIcon sx={{ color: "#4CAF50", fontSize: 35 }} />
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            Categorías
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Las más populares.
          </Typography>
        </Paper>
      </Box>

      {/* --- PANEL DE FILTROS (Sin Grid) --- */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography fontWeight="bold" sx={{ mb: 3 }}>
          Filtros de Reporte
        </Typography>

        <Stack spacing={3}>
          {/* Fila 1: Fechas y Rol */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              type="date"
              label="Fecha inicio"
              InputLabelProps={{ shrink: true }}
              value={filtros.fechaInicio}
              onChange={(e) =>
                handleChangeFiltros("fechaInicio", e.target.value)
              }
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha fin"
              InputLabelProps={{ shrink: true }}
              value={filtros.fechaFin}
              onChange={(e) => handleChangeFiltros("fechaFin", e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Rol de usuario</InputLabel>
              <Select
                label="Rol de usuario"
                value={filtros.rol}
                onChange={(e) => handleChangeFiltros("rol", e.target.value)}
              >
                <MenuItem value="Todos">Todos los roles</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Socio">Socio</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Fila 2: Estado (y espacio vacío para alineación) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            {/* Limitamos el ancho del Select de Estado para que se vea ordenado como en el Grid (aprox 33%) */}
            <Box sx={{ flex: 1, maxWidth: { md: "33%" } }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={filtros.estado}
                  onChange={(e) =>
                    handleChangeFiltros("estado", e.target.value)
                  }
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Botones */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              pt: 2,
            }}
          >
            <Button onClick={limpiarFiltros} color="inherit">
              Limpiar Filtros
            </Button>

            <Button variant="contained" color="success">
              Generar Reporte
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
