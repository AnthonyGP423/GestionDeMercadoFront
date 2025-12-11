// src/pages/categorias/Categoria.tsx

import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useEffect, useMemo, useState } from "react";

import { useToast } from "../../components/ui/Toast";
import CategoryModal from "./components/modals/CategoriaProductModal";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  CategoriaStandRequest,
  CategoriaStandResponse,
  EstadoCategoria,
} from "../../api/categoriaStandApi";

interface CategoriaItem {
  id: number;
  nombre: string;
  descripcion: string;
  colorHex?: string | null;
  iconoUrl?: string | null;
  estado: EstadoCategoria; // "Activo" | "Inactivo"
}

type FormCategoriaModal = {
  nombre: string;
  descripcion: string;
  estado: EstadoCategoria;
};

const mapResponseToItem = (c: CategoriaStandResponse): CategoriaItem => ({
  id: c.id,
  nombre: c.nombre,
  descripcion: c.descripcion,
  colorHex: c.colorHex,
  iconoUrl: c.iconoUrl,
  estado: c.estado ? "Activo" : "Inactivo",
});

const EstadoChip = ({ estado }: { estado: EstadoCategoria }) => {
  const isActivo = estado === "Activo";

  return (
    <Chip
      label={estado}
      size="small"
      sx={{
        bgcolor: isActivo ? "#bbf7d0" : "#e5e7eb",
        color: isActivo ? "#166534" : "#4b5563",
        fontWeight: 600,
        borderRadius: "999px",
        fontSize: 12,
      }}
    />
  );
};

export default function Categoria() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategoria, setEditingCategoria] =
    useState<CategoriaItem | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<
    "Todos" | EstadoCategoria
  >("Todos");

  const { showToast } = useToast();

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await listarCategorias();
      setCategorias(data.map(mapResponseToItem));
    } catch (error) {
      console.error(error);
      showToast("No se pudieron cargar las categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // ===== STATS =====
  const total = categorias.length;
  const activas = categorias.filter((c) => c.estado === "Activo").length;
  const inactivas = categorias.filter((c) => c.estado === "Inactivo").length;

  // ===== ORDEN + FILTRO =====
  const categoriasOrdenadas = useMemo(
    () =>
      [...categorias].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      ),
    [categorias]
  );

  const categoriasFiltradas = useMemo(
    () =>
      categoriasOrdenadas.filter((c) =>
        filtroEstado === "Todos" ? true : c.estado === filtroEstado
      ),
    [categoriasOrdenadas, filtroEstado]
  );

  // ===== CREAR =====
  const crearCategoriaHandler = async (form: FormCategoriaModal) => {
    const payload: CategoriaStandRequest = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      colorHex: null,
      iconoUrl: null,
      estado: form.estado === "Activo",
    };

    const creada = await crearCategoria(payload);
    setCategorias((prev) => [...prev, mapResponseToItem(creada)]);
    showToast(`Categoría ${creada.nombre} creada correctamente`, "success");
  };

  // ===== EDITAR =====
  const editarCategoriaHandler = async (
    cat: CategoriaItem,
    form: FormCategoriaModal
  ) => {
    const payload: CategoriaStandRequest = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      colorHex: cat.colorHex || null,
      iconoUrl: cat.iconoUrl || null,
      estado: form.estado === "Activo",
    };

    const actualizada = await actualizarCategoria(cat.id, payload);

    setCategorias((prev) =>
      prev.map((c) =>
        c.id === cat.id ? mapResponseToItem(actualizada) : c
      )
    );

    showToast(`Categoría ${actualizada.nombre} actualizada`, "success");
  };

  // Decide si crea o edita según haya categoría en edición
  const handleSubmitModal = async (form: FormCategoriaModal) => {
    try {
      if (editingCategoria) {
        await editarCategoriaHandler(editingCategoria, form);
      } else {
        await crearCategoriaHandler(form);
      }
    } catch (error) {
      console.error(error);
      showToast("Ocurrió un error al guardar la categoría", "error");
    } finally {
      setModalOpen(false);
      setEditingCategoria(null);
    }
  };

  // Cambiar estado
  const handleToggleEstado = async (
    cat: CategoriaItem,
    nuevoEstado: EstadoCategoria
  ) => {
    try {
      const body: CategoriaStandRequest = {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        colorHex: cat.colorHex || null,
        iconoUrl: cat.iconoUrl || null,
        estado: nuevoEstado === "Activo",
      };

      const actualizada = await actualizarCategoria(cat.id, body);

      setCategorias((prev) =>
        prev.map((c) =>
          c.id === cat.id ? mapResponseToItem(actualizada) : c
        )
      );

      showToast(
        `${cat.nombre} ahora está ${
          actualizada.estado ? "Activo" : "Inactivo"
        }`,
        actualizada.estado ? "success" : "warning"
      );
    } catch (error) {
      console.error(error);
      showToast("No se pudo cambiar el estado de la categoría", "error");
    }
  };

  // Eliminar
  const handleDelete = async (cat: CategoriaItem) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;

    try {
      await eliminarCategoria(cat.id);
      setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
      showToast(`Categoría ${cat.nombre} eliminada`, "success");
    } catch (error) {
      console.error(error);
      showToast("Error al eliminar la categoría", "error");
    }
  };

  const cardStyle = {
    borderRadius: 4,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    bgcolor: "#ffffff",
  } as const;

  return (
    <>
      {/* CABECERA */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily:
                `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
            }}
          >
            Categorías de Stands
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 480, mt: 0.5 }}>
            Define los rubros principales de los puestos del mercado. Estas
            categorías se usan para agrupar y mantener ordenado el mapa del
            mercado.
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{
            borderRadius: "999px",
            px: 4,
            py: 1.2,
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
            setEditingCategoria(null);
            setModalOpen(true);
          }}
        >
          + Nueva categoría
        </Button>
      </Box>

      {/* MODAL (crear / editar) */}
      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategoria(null);
        }}
        onSubmit={handleSubmitModal}
        initialData={
          editingCategoria
            ? {
                nombre: editingCategoria.nombre,
                descripcion: editingCategoria.descripcion,
                estado: editingCategoria.estado,
              }
            : undefined
        }
      />

      {/* LOADING INICIAL */}
      {loading && categorias.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 6,
          }}
        >
          <CircularProgress />
        </Box>
      ) : categorias.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            border: "1px dashed #e5e7eb",
            bgcolor: "#f9fafb",
          }}
          elevation={0}
        >
          <Typography variant="h6" fontWeight={600}>
            Aún no hay categorías registradas
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Crea tu primera categoría para comenzar a organizar los stands del
            mercado.
          </Typography>
          <Button
            variant="outlined"
            sx={{
              mt: 2,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={() => {
              setEditingCategoria(null);
              setModalOpen(true);
            }}
          >
            Crear categoría
          </Button>
        </Paper>
      ) : (
        <>
          {/* STATS + FILTRO */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
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
                Total categorías
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {total}
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
                Activas
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
              >
                {activas}
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
                Inactivas
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="#b91c1c">
                {inactivas}
              </Typography>
            </Paper>

            <Box sx={{ flexGrow: 1 }} />

            <ToggleButtonGroup
              value={filtroEstado}
              exclusive
              onChange={(_, value) => {
                if (value) setFiltroEstado(value);
              }}
              size="small"
            >
              <ToggleButton value="Todos">Todas</ToggleButton>
              <ToggleButton value="Activo">Activas</ToggleButton>
              <ToggleButton value="Inactivo">Inactivas</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* LISTA MODERNA (tabla) */}
          <Paper sx={{ ...cardStyle, p: 0 }} elevation={0}>
            {loading && (
              <Box
                sx={{
                  py: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={22} />
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
                    <TableCell sx={{ width: "28%" }}>Nombre</TableCell>
                    <TableCell sx={{ width: "42%" }}>Descripción</TableCell>
                    <TableCell sx={{ width: "10%" }}>Estado</TableCell>
                    <TableCell sx={{ width: "20%" }} align="right">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {categoriasFiltradas.map((cat) => {
                    const colorDot = cat.colorHex || "#4F46E5";

                    return (
                      <TableRow
                        key={cat.id}
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
                        {/* Nombre + color */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "999px",
                                bgcolor: colorDot,
                                border: "2px solid #e5e7eb",
                              }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{ fontWeight: 700, color: "#111827" }}
                                noWrap
                              >
                                {cat.nombre}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID #{cat.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Descripción */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            title={cat.descripcion}
                          >
                            {cat.descripcion || "Sin descripción"}
                          </Typography>
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <EstadoChip estado={cat.estado} />
                        </TableCell>

                        {/* Acciones */}
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Editar categoría">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingCategoria(cat);
                                  setModalOpen(true);
                                }}
                              >
                                <EditIcon
                                  fontSize="small"
                                  sx={{ color: "#f59e0b" }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title={
                                cat.estado === "Activo"
                                  ? "Marcar como inactiva"
                                  : "Marcar como activa"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleToggleEstado(
                                    cat,
                                    cat.estado === "Activo"
                                      ? "Inactivo"
                                      : "Activo"
                                  )
                                }
                              >
                                <AutorenewIcon
                                  fontSize="small"
                                  sx={{ color: "#22c55e" }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar categoría">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(cat)}
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
                    );
                  })}

                  {!loading && categoriasFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Box
                          sx={{
                            py: 4,
                            textAlign: "center",
                            color: "text.secondary",
                          }}
                        >
                          No se encontraron categorías con el filtro actual.
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>
        </>
      )}
    </>
  );
}