import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import StandModal from "./components/modals/StandModal";
import { useToast } from "../../components/ui/Toast";

export default function Stand() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ---------------------------
  // 🔹 DATA SIMULADA
  // ---------------------------
  const [stands, setStands] = useState([
    {
      id: 1,
      bloque: "A",
      numero_stand: "101",
      nombre_comercial: "Frutas Don José",
      categoria: "Frutas y Verduras",
      propietario: "José Pérez",
      estado: "Activo" as "Activo" | "Inactivo",
    },
    {
      id: 2,
      bloque: "B",
      numero_stand: "204",
      nombre_comercial: "Carnicería La Selecta",
      categoria: "Carnes",
      propietario: "María Rodríguez",
      estado: "Inactivo" as "Activo" | "Inactivo",
    },
    {
      id: 3,
      bloque: "A",
      numero_stand: "115",
      nombre_comercial: "Abarrotes El Ahorro",
      categoria: "Abarrotes",
      propietario: "Carlos González",
      estado: "Activo" as "Activo" | "Inactivo",
    },
  ]);

  // ---------------------------
  // 🔹 FILTROS
  // ---------------------------
  const [search, setSearch] = useState("");
  const [filtroBloque, setFiltroBloque] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const bloques = ["A", "B", "C"];
  const categorias = ["Abarrotes", "Frutas y Verduras", "Carnes"];
  const estados = ["Activo", "Inactivo"];

  // ---------------------------
  // 🔹 MODAL
  // ---------------------------
  const [openModal, setOpenModal] = useState(false);
  const [editingStand, setEditingStand] = useState<any>(null);

  const handleSubmit = (data: any) => {
    if (editingStand) {
      setStands((prev) =>
        prev.map((s) => (s.id === editingStand.id ? { ...s, ...data } : s))
      );
      showToast("Stand actualizado", "success");
    } else {
      setStands((prev) => [...prev, { id: Date.now(), ...data }]);
      showToast("Nuevo stand registrado", "success");
    }
  };

  // ---------------------------
  // 🔹 FILTRADO REAL
  // ---------------------------
  const filtered = stands.filter((s) => {
    const matchesSearch =
      s.nombre_comercial.toLowerCase().includes(search.toLowerCase()) ||
      s.numero_stand.includes(search);

    const matchesBloque = filtroBloque === "Todos" || s.bloque === filtroBloque;

    const matchesCategoria =
      filtroCategoria === "Todos" || s.categoria === filtroCategoria;

    const matchesEstado = filtroEstado === "Todos" || s.estado === filtroEstado;

    return matchesSearch && matchesBloque && matchesCategoria && matchesEstado;
  });

  // ---------------------------
  // 🔹 CHIP DE ESTADO
  // ---------------------------
  const StatusChip = ({ estado }: { estado: string }) => (
    <Chip
      label={estado}
      color={estado === "Activo" ? "success" : "default"}
      size="small"
    />
  );

  return (
    <Box>
      {/* Título y botón */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Stands
        </Typography>

        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingStand(null);
            setOpenModal(true);
          }}
        >
          Nuevo stand
        </Button>
      </Box>

      {/* FILTROS SUPERIORES */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2}>
          {/* Buscador */}
          <Grid>
            <TextField
              fullWidth
              placeholder="Buscar por nombre o número…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          {/* Bloque */}
          <Grid>
            <FormControl fullWidth>
              <InputLabel>Bloque</InputLabel>
              <Select
                value={filtroBloque}
                label="Bloque"
                onChange={(e) => setFiltroBloque(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {bloques.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Categoría */}
          <Grid>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filtroCategoria}
                label="Categoría"
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {categorias.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Estado */}
          <Grid>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                label="Estado"
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {estados.map((e) => (
                  <MenuItem key={e} value={e}>
                    {e}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLA */}
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Bloque</strong>
              </TableCell>
              <TableCell>
                <strong>Número</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre Comercial</strong>
              </TableCell>
              <TableCell>
                <strong>Categoría</strong>
              </TableCell>
              <TableCell>
                <strong>Propietario</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.bloque}</TableCell>
                <TableCell>{s.numero_stand}</TableCell>
                <TableCell>
                  <strong>{s.nombre_comercial}</strong>
                </TableCell>
                <TableCell>{s.categoria}</TableCell>
                <TableCell>{s.propietario}</TableCell>
                <TableCell>
                  <StatusChip estado={s.estado} />
                </TableCell>

                {/* ACCIONES */}
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/dashboard/stands/${s.id}`)}
                  >
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal */}
      <StandModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialData={editingStand}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
