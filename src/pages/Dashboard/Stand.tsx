
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
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
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Autorenew";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

import StandModal from "./components/modals/StandModal";
import { useToast } from "../../components/ui/Toast";

import standsAdminApi, {
  StandRow,
  EstadoStand,
  StandRequestDto,
  StandBackend,
} from "../../api/standsAdminApi";
import propietariosApi, {
  PropietarioOption,
} from "../../api/propietariosApi";

export default function Stand() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stands, setStands] = useState<StandRow[]>([]);
  const [propietarios, setPropietarios] = useState<PropietarioOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filtroBloque, setFiltroBloque] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState<"Todos" | EstadoStand>(
    "Todos"
  );

  const [openModal, setOpenModal] = useState(false);
  const [editingStand, setEditingStand] = useState<StandBackend | null>(null);

  // === CARGA INICIAL ===
  const fetchStands = async () => {
    setLoading(true);
    try {
      const data = await standsAdminApi.listar();
      setStands(data);
    } catch (e: any) {
      console.error(e);
      showToast("No se pudieron cargar los stands", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPropietarios = async () => {
    try {
      const data = await propietariosApi.listar();
      setPropietarios(data);
    } catch (e: any) {
      console.error(e);
      showToast("No se pudieron cargar los propietarios", "error");
    }
  };

  useEffect(() => {
    fetchStands();
    fetchPropietarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === OPCIONES DINÁMICAS ===
  const bloques = useMemo(
    () => Array.from(new Set(stands.map((s) => s.bloque))).filter(Boolean),
    [stands]
  );
  const categorias = useMemo(
    () =>
      Array.from(new Set(stands.map((s) => s.categoria))).filter(Boolean),
    [stands]
  );
  const estados = ["ABIERTO", "CERRADO", "CLAUSURADO"] as EstadoStand[];

  // === FILTRADO ===
  const filtered = useMemo(
    () =>
      stands.filter((s) => {
        const matchesSearch =
          s.nombreComercial.toLowerCase().includes(search.toLowerCase()) ||
          s.numeroStand.includes(search) ||
          s.codigoStand.toLowerCase().includes(search.toLowerCase());

        const matchesBloque =
          filtroBloque === "Todos" || s.bloque === filtroBloque;

        const matchesCategoria =
          filtroCategoria === "Todos" || s.categoria === filtroCategoria;

        const matchesEstado =
          filtroEstado === "Todos" || s.estado === filtroEstado;

        return (
          matchesSearch && matchesBloque && matchesCategoria && matchesEstado
        );
      }),
    [stands, search, filtroBloque, filtroCategoria, filtroEstado]
  );

  // === MAPEO MODAL <-> DTO ===
  const mapModalDataToRequest = (data: any): StandRequestDto => ({
    idPropietario: data.id_propietario ? Number(data.id_propietario) : null,
    idCategoriaStand: data.id_categoria_stand
      ? Number(data.id_categoria_stand)
      : null,
    bloque: data.bloque,
    numeroStand: data.numero_stand,
    nombreComercial: data.nombre_comercial,
    descripcionNegocio: data.descripcion_negocio,
    latitud: data.latitud !== "" ? Number(data.latitud) : null,
    longitud: data.longitud !== "" ? Number(data.longitud) : null,
  });

  // Usamos SIEMPRE StandBackend como fuente para el modal
  const mapBackendToModal = (s: StandBackend | null) =>
    !s
      ? undefined
      : {
          id_propietario:
            s.idPropietario != null ? String(s.idPropietario) : "",
          id_categoria_stand:
            s.idCategoriaStand != null ? String(s.idCategoriaStand) : "",
          bloque: s.bloque ?? "",
          numero_stand: s.numeroStand ?? "",
          nombre_comercial: s.nombreComercial ?? "",
          descripcion_negocio: s.descripcionNegocio ?? "",
          latitud: s.latitud != null ? String(s.latitud) : "",
          longitud: s.longitud != null ? String(s.longitud) : "",
          estado: "Activo",
        };

  const handleSubmitModal = async (formData: any) => {
    const payload = mapModalDataToRequest(formData);

    try {
      if (editingStand) {
        const actualizado = await standsAdminApi.actualizar(
          editingStand.id,
          payload
        );
        setStands((prev) =>
          prev.map((s) => (s.id === actualizado.id ? actualizado : s))
        );
        showToast("Stand actualizado", "success");
      } else {
        const nuevo = await standsAdminApi.crear(payload);
        setStands((prev) => [...prev, nuevo]);
        showToast("Nuevo stand registrado", "success");
      }
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo guardar el stand", "error");
    } finally {
      setOpenModal(false);
      setEditingStand(null);
    }
  };

  // === EDITAR DESDE TABLA (carga detalle completo) ===
  const handleEditarDesdeTabla = async (row: StandRow) => {
    try {
      setLoading(true);
      const detalle = await standsAdminApi.obtener(row.id); // StandBackend
      setEditingStand(detalle);
      setOpenModal(true);
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo cargar el detalle del stand", "error");
    } finally {
      setLoading(false);
    }
  };

  // === CAMBIAR ESTADO: SOLO ABIERTO <-> CERRADO ===
  const toggleAbiertoCerrado = (estado: EstadoStand): EstadoStand =>
    estado === "ABIERTO" ? "CERRADO" : "ABIERTO";

  const handleCambiarEstado = async (stand: StandRow) => {
  if (stand.estado === "CLAUSURADO") {
    showToast(
      "Este stand está CLAUSURADO. Modifica su estado desde el detalle.",
      "warning"
    );
    return;
  }

  const nuevo = toggleAbiertoCerrado(stand.estado);
  try {
    await standsAdminApi.cambiarEstado(stand.id, nuevo);

    // ⬅️ Refrescamos todo el listado
    await fetchStands();

    showToast(
      `Estado del stand ${stand.codigoStand} actualizado a ${nuevo}`,
      "success"
    );
  } catch (e: any) {
    console.error(e);
    showToast("No se pudo cambiar el estado del stand", "error");
  }
};

  // === ELIMINAR ===
  const handleDelete = async (stand: StandRow) => {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el stand ${stand.codigoStand}?`
    );
    if (!ok) return;

    try {
      await standsAdminApi.eliminar(stand.id);
      setStands((prev) => prev.filter((s) => s.id !== stand.id));
      showToast("Stand eliminado", "success");
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo eliminar el stand", "error");
    }
  };

  // === CHIP ESTADO ===
  const EstadoChip = ({ estado }: { estado: EstadoStand }) => {
    let bg = "#e5e7eb";
    let text = "#374151";

    if (estado === "ABIERTO") {
      bg = "#dcfce7";
      text = "#166534";
    } else if (estado === "CERRADO") {
      bg = "#fee2e2";
      text = "#b91c1c";
    } else if (estado === "CLAUSURADO") {
      bg = "#fef3c7";
      text = "#92400e";
    }

    return (
      <Chip
        label={estado}
        size="small"
        sx={{ bgcolor: bg, color: text, fontWeight: 600 }}
      />
    );
  };

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
            Stands del mercado
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 700 }}
          >
            Administra los <strong>espacios físicos</strong> del mercado,
            su estado operativo y el socio que los administra.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 999 }}
          onClick={() => {
            setEditingStand(null);
            setOpenModal(true);
          }}
        >
          Nuevo stand
        </Button>
      </Box>

      {/* FILTROS */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#f9fafb",
        }}
        elevation={0}
      >
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            sx={{ minWidth: 260 }}
            size="small"
            placeholder="Buscar por nombre, código o número…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
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

          <FormControl size="small" sx={{ minWidth: 200 }}>
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

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtroEstado}
              label="Estado"
              onChange={(e) =>
                setFiltroEstado(e.target.value as "Todos" | EstadoStand)
              }
            >
              <MenuItem value="Todos">Todos</MenuItem>
              {estados.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            size="small"
            variant="text"
            startIcon={<RefreshIcon />}
            onClick={fetchStands}
          >
            Actualizar
          </Button>
        </Stack>
      </Paper>

      {/* TABLA */}
      <Paper sx={{ p: 2, borderRadius: 3 }} elevation={0}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f3f4f6" }}>
              <TableCell>
                <strong>Código</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre comercial</strong>
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
              <TableRow key={s.id} hover>
                <TableCell>{s.codigoStand}</TableCell>
                <TableCell>
                  <Typography fontWeight={600}>
                    {s.nombreComercial}
                  </Typography>
                </TableCell>
                <TableCell>{s.categoria}</TableCell>
                <TableCell>{s.propietario}</TableCell>
                <TableCell>
                  <EstadoChip estado={s.estado} />
                </TableCell>

                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/dashboard/stands/${s.id}`)
                        }
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Editar stand">
                      <IconButton
                        size="small"
                        onClick={() => handleEditarDesdeTabla(s)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Abrir / cerrar">
                      <IconButton
                        size="small"
                        onClick={() => handleCambiarEstado(s)}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(s)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box
                    sx={{
                      py: 4,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    No se encontraron stands con los filtros aplicados.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* MODAL */}
      <StandModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingStand(null);
        }}
        initialData={mapBackendToModal(editingStand)}
        onSubmit={handleSubmitModal}
        categorias={[]} // cuando tengas categorías de stand, pásalas aquí
        propietarios={propietarios}
      />
    </Box>
  );
}

