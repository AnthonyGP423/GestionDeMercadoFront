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
  CircularProgress,
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

  // === OPCIONES DINÁMICAS (ordenadas alfabéticamente) ===
  const bloques = useMemo(
    () =>
      Array.from(new Set(stands.map((s) => s.bloque)))
        .filter(Boolean)
        .sort((a, b) =>
          String(a).localeCompare(String(b), "es", {
            sensitivity: "base",
          })
        ),
    [stands]
  );

  const categorias = useMemo(
    () =>
      Array.from(new Set(stands.map((s) => s.categoria)))
        .filter(Boolean)
        .sort((a, b) =>
          String(a).localeCompare(String(b), "es", {
            sensitivity: "base",
          })
        ),
    [stands]
  );

  const estados = ["ABIERTO", "CERRADO", "CLAUSURADO"] as EstadoStand[];

  // === ORDENAR STANDS POR CÓDIGO ===
  const standsOrdenados = useMemo(
    () =>
      [...stands].sort((a, b) =>
        a.codigoStand.localeCompare(b.codigoStand, "es", {
          sensitivity: "base",
          numeric: true,
        })
      ),
    [stands]
  );

  // === FILTRADO (sobre la lista ordenada) ===
  const filtered = useMemo(
    () =>
      standsOrdenados.filter((s) => {
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
    [standsOrdenados, search, filtroBloque, filtroCategoria, filtroEstado]
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
        sx={{
          bgcolor: bg,
          color: text,
          fontWeight: 600,
          borderRadius: "999px",
          fontSize: 12,
        }}
      />
    );
  };

  const totalStands = stands.length;
  const abiertos = stands.filter((s) => s.estado === "ABIERTO").length;
  const cerrados = stands.filter((s) => s.estado === "CERRADO").length;
  const clausurados = stands.filter((s) => s.estado === "CLAUSURADO").length;

  const cardStyle = {
    borderRadius: 4,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    bgcolor: "#ffffff",
  } as const;

  return (
    <Box>
      {/* HEADER con estilo unificado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              fontFamily:
                `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
            }}
          >
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
          startIcon={<AddIcon />}
          sx={{
            borderRadius: "999px",
            px: 3.5,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: "#22c55e",
            boxShadow: "0 6px 14px rgba(34, 197, 94, 0.25)",
            "&:hover": {
              backgroundColor: "#16a34a",
              boxShadow: "0 8px 18px rgba(22, 163, 74, 0.35)",
            },
          }}
          onClick={() => {
            setEditingStand(null);
            setOpenModal(true);
          }}
        >
          Nuevo stand
        </Button>
      </Box>

      {/* STATS RÁPIDAS */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Total stands
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {totalStands}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            border: "1px solid #bbf7d0",
            bgcolor: "#f0fdf4",
          }}
        >
          <Typography variant="caption" color="success.main">
            Abiertos
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {abiertos}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            border: "1px solid #fee2e2",
            bgcolor: "#fef2f2",
          }}
        >
          <Typography variant="caption" color="#b91c1c">
            Cerrados
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="#b91c1c">
            {cerrados}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            border: "1px solid #fef3c7",
            bgcolor: "#fffbeb",
          }}
        >
          <Typography variant="caption" color="#92400e">
            Clausurados
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="#92400e">
            {clausurados}
          </Typography>
        </Paper>
      </Box>

      {/* FILTROS con tarjeta moderna */}
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
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
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
              <MenuItem value="Todos">Todas</MenuItem>
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
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Actualizar
          </Button>
        </Stack>
      </Paper>

      {/* TABLA con estilo moderno + hover destacado */}
      <Paper sx={{ ...cardStyle, p: 0 }} elevation={0}>
        {loading && (
          <Box
            sx={{
              py: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={26} />
          </Box>
        )}

        {!loading && (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#f9fafb",
                  "& th": {
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                    py: 1.5,
                  },
                }}
              >
                <TableCell sx={{ width: "12%" }}>Código</TableCell>
                <TableCell sx={{ width: "24%" }}>Nombre comercial</TableCell>
                <TableCell sx={{ width: "18%" }}>Categoría</TableCell>
                <TableCell sx={{ width: "22%" }}>Propietario</TableCell>
                <TableCell sx={{ width: "12%" }}>Estado</TableCell>
                <TableCell sx={{ width: "12%" }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 14,
                      py: 1.3,
                    },
                    transition:
                      "background-color 0.15s ease, transform 0.15s ease",
                    "&:hover": {
                      bgcolor: "#f9fafb",
                    },
                  }}
                >
                  <TableCell>{s.codigoStand}</TableCell>

                  <TableCell>
                    <Typography
                      sx={{ fontWeight: 700, color: "#111827" }}
                      noWrap
                    >
                      {s.nombreComercial}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >{`Bloque ${s.bloque} · N° ${s.numeroStand}`}</Typography>
                  </TableCell>

                  <TableCell>{s.categoria}</TableCell>

                  <TableCell>
                    <Typography noWrap>{s.propietario}</Typography>
                  </TableCell>

                  <TableCell>
                    <EstadoChip estado={s.estado} />
                  </TableCell>

                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
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
                          <EditIcon fontSize="small" sx={{ color: "#f59e0b" }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Abrir / cerrar">
                        <IconButton
                          size="small"
                          onClick={() => handleCambiarEstado(s)}
                        >
                          <RefreshIcon
                            fontSize="small"
                            sx={{ color: "#22c55e" }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(s)}
                        >
                          <DeleteIcon
                            fontSize="small"
                            sx={{ color: "#ef4444" }}
                          />
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
        )}
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