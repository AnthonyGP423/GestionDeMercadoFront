import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DeleteIcon from "@mui/icons-material/Delete";
import RoomIcon from "@mui/icons-material/Room";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // 1. Importar el ícono
import { useNavigate } from "react-router-dom";
// 2. Definimos una interface simple para las props, incluyendo la función de volver
interface Props {
  onBack?: () => void;
}

export default function StandDetalle({ onBack }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  // Datos simulados
  const datos = {
    bloque: "A",
    numero: "12",
    nombre_comercial: "Frutas Anita",
    categoria: "Frutas y Verduras",
    propietario: {
      nombre: "Anita Pérez",
      email: "anita.perez@email.com",
      telefono: "+54 9 11 1234-5678",
    },
    descripcion: `Frutas Anita se especializa en la venta de frutas y verduras frescas de temporada, provenientes directamente de agricultores locales. Ofrecemos una amplia variedad de productos orgánicos y convencionales, garantizando la mejor calidad.`,
    ubicacion: {
      lat: -34.6175,
      lng: -58.3683,
    },
    estado: "ABIERTO",
  };

  return (
    <Box>
      {/* --- BOTÓN VOLVER --- */}
      {/* Lo ponemos al inicio para una navegación natural */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2, textTransform: "none", color: "gray" }}
      >
        Volver a la tabla
      </Button>

      {/* --- ENCABEZADO --- */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: "gray" }}>
          Stands / Detalle
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Stand {datos.bloque}-{datos.numero} – {datos.nombre_comercial}
          </Typography>

          <Chip
            label={datos.estado}
            sx={{
              bgcolor: datos.estado === "ABIERTO" ? "#C8F7C5" : "#F8CACA",
              color: datos.estado === "ABIERTO" ? "green" : "red",
              fontWeight: "bold",
            }}
          />
        </Box>
      </Stack>

      {/* --- BOTONES DE ACCIÓN --- */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Editar stand
        </Button>
        <Button variant="outlined" startIcon={<AutorenewIcon />}>
          Cambiar estado
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
          Eliminar
        </Button>
      </Stack>

      {/* --- CONTENIDO PRINCIPAL (Sin Grid) --- */}
      <Paper sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 6,
          }}
        >
          {/* === COLUMNA IZQUIERDA: INFO STAND === */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Detalles del Stand
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  Bloque y Número
                </Typography>
                <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  Bloque {datos.bloque}, Número {datos.numero}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  Categoría
                </Typography>
                <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  {datos.categoria}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  Descripción
                </Typography>
                <Typography
                  sx={{ whiteSpace: "pre-wrap", mt: 1, lineHeight: 1.6 }}
                >
                  {datos.descripcion}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* === COLUMNA DERECHA: PROPIETARIO Y UBICACIÓN === */}
          <Box sx={{ flex: 1, maxWidth: { md: 400 } }}>
            <Stack spacing={4}>
              {/* Tarjeta Propietario */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Información del propietario
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#FAFAFA" }}>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      {datos.propietario.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {datos.propietario.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {datos.propietario.telefono}
                    </Typography>
                    <Button
                      size="small"
                      sx={{ alignSelf: "flex-start", mt: 1, p: 0 }}
                      color="success"
                    >
                      Ver perfil de socio
                    </Button>
                  </Stack>
                </Paper>
              </Box>

              {/* Ubicación */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Ubicación
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <RoomIcon color="action" />
                  <Typography variant="body2">
                    GPS: {datos.ubicacion.lat}, {datos.ubicacion.lng}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    height: 200,
                    width: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <img
                    src="https://predikdata.com/es/wp-content/uploads/sites/2/2021/08/ejemplo-de-GIS.jpg"
                    alt="Mapa ubicación"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
