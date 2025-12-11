import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";

import { useToast } from "../../components/ui/Toast";

import categoriasProductosApi, {
  CategoriaRow,
  EstadoCategoria,
} from "../../api/categoriasProductosApi";

import CategoryProductModal, {
  CategoryData,
} from "./components/modals/CategoriaProductModal";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

type ModalMode = "create" | "edit";

const getColorForCategoria = (nombre: string): string => {
  const n = nombre.toLowerCase();

  if (n.includes("carne")) return "#ef4444"; // rojo - carnes
  if (n.includes("pesc")) return "#0ea5e9"; // celeste - pescados
  if (n.includes("marisco")) return "#0284c7"; // azul más intenso
  if (n.includes("fruta")) return "#22c55e"; // verde - frutas
  if (n.includes("verdura") || n.includes("hortaliza")) return "#16a34a";
  if (n.includes("tubérculo") || n.includes("tuberculo")) return "#a16207"; // ocre
  if (n.includes("grano") || n.includes("cereal")) return "#f97316"; // naranja
  if (n.includes("lácteo") || n.includes("lacteo")) return "#6366f1"; // violeta
  if (n.includes("hierba") || n.includes("especia")) return "#10b981"; // menta
  if (n.includes("bebida")) return "#3b82f6"; // azul medio

  return "#4F46E5";
};

export default function Categoria() {
  const { showToast } = useToast();

  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCategoria, setSelectedCategoria] =
    useState<CategoriaRow | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<"Todos" | EstadoCategoria>(
    "Todos"
  );

  // ===== CARGA INICIAL =====
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasProductosApi.listar();
      setCategorias(data);
    } catch (error: any) {
      console.error(error);
      showToast("No se pudieron cargar las categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // ===== MÉTRICAS RÁPIDAS =====
  const total = categorias.length;
  const activas = categorias.filter((c) => c.estado === "Activo").length;
  const inactivas = categorias.filter((c) => c.estado === "Inactivo").length;

  // ===== FILTRO POR ESTADO =====
  const categoriasFiltradas = useMemo(
    () =>
      categorias.filter((c) =>
        filtroEstado === "Todos" ? true : c.estado === filtroEstado
      ),
    [categorias, filtroEstado]
  );

  // ===== HANDLERS DEL MODAL =====
  const abrirModalCrear = () => {
    setSelectedCategoria(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const abrirModalEditar = (cat: CategoriaRow) => {
    setSelectedCategoria(cat);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmitModal = async (data: CategoryData) => {
    try {
      if (modalMode === "create") {
        const nueva = await categoriasProductosApi.crear({
          nombre: data.nombre,
          descripcion: data.descripcion,
          estado: data.estado,
        });

        setCategorias((prev) => [...prev, nueva]);
        showToast(`Categoría "${nueva.nombre}" creada`, "success");
      } else if (modalMode === "edit" && selectedCategoria) {
        const actualizada = await categoriasProductosApi.actualizar(
          selectedCategoria.id,
          {
            nombre: data.nombre,
            descripcion: data.descripcion,
            estado: data.estado,
          }
        );

        setCategorias((prev) =>
          prev.map((c) => (c.id === actualizada.id ? actualizada : c))
        );
        showToast(
          `Categoría "${actualizada.nombre}" actualizada`,
          "success"
        );
      }
    } catch (error: any) {
      console.error(error);
      showToast("No se pudo guardar la categoría", "error");
    } finally {
      setModalOpen(false);
      setSelectedCategoria(null);
    }
  };

  // ===== CAMBIAR ESTADO ACTIVO/INACTIVO =====
  const handleToggleEstado = async (
    categoria: CategoriaRow,
    nuevoEstado: EstadoCategoria
  ) => {
    try {
      const actualizada = await categoriasProductosApi.cambiarEstado(
        categoria,
        nuevoEstado
      );

      setCategorias((prev) =>
        prev.map((c) => (c.id === actualizada.id ? actualizada : c))
      );

      showToast(
        `${actualizada.nombre} ahora está ${actualizada.estado}`,
        actualizada.estado === "Activo" ? "success" : "warning"
      );
    } catch (error: any) {
      console.error(error);
      showToast("No se pudo cambiar el estado", "error");
    }
  };

  // ===== ELIMINAR =====
  const handleDelete = async (categoria: CategoriaRow) => {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`
    );
    if (!ok) return;

    try {
      await categoriasProductosApi.eliminar(categoria.id);
      setCategorias((prev) => prev.filter((c) => c.id !== categoria.id));
      showToast("Categoría eliminada", "success");
    } catch (error: any) {
      console.error(error);
      showToast("No se pudo eliminar la categoría", "error");
    }
  };

  return (
    <>
      {/* HEADER AL ESTILO ROLES / PRODUCTOS */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
            Categorías de productos
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 620, mt: 0.5 }}
          >
            Organiza los productos del mercado en{" "}
            <strong>rubros claros</strong>. Estas categorías se usan en el
            directorio público y en el portal de SOCIOS para clasificar
            los stands y sus productos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={abrirModalCrear}
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
        >
          + Nueva categoría
        </Button>
      </Box>

      {/* STATS + FILTRO DE ESTADO */}
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
            border: "1px solid",
            borderColor: "#bbf7d0",
            bgcolor: "#f0fdf4",
          }}
        >
          <Typography variant="caption" color="success.main">
            Activas
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {activas}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "#fee2e2",
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

      {/* LISTA MODERNA (EN VEZ DE CARDS) */}
      {loading ? (
        <Box
          sx={{
            mt: 6,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
        >
          {/* Encabezado tipo lista */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#6b7280",
                flex: 3,
              }}
            >
              Categoría
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#6b7280",
                flex: 4,
              }}
            >
              Descripción
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#6b7280",
                flex: 1.5,
              }}
            >
              Estado
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                color: "#6b7280",
                flex: 1.5,
                textAlign: "center",
              }}
            >
              Acciones
            </Typography>
          </Box>

          {categoriasFiltradas.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="subtitle1" fontWeight="medium">
                No hay categorías para mostrar
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Crea tu primera categoría para comenzar a organizar el
                mercado.
              </Typography>
              <Button
                variant="outlined"
                color="success"
                sx={{ mt: 2, borderRadius: "999px" }}
                onClick={abrirModalCrear}
              >
                Crear categoría
              </Button>
            </Box>
          ) : (
            categoriasFiltradas.map((cat, index) => {
              const color = getColorForCategoria(cat.nombre);
              const esActiva = cat.estado === "Activo";

              return (
                <Box key={cat.id}>
                  {index > 0 && <Divider sx={{ mx: 3 }} />}
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* Columna 1: nombre + icono de color */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{ flex: 3, minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "999px",
                          bgcolor: `${color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CategoryIcon
                          sx={{ fontSize: 18, color: color }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: "#111827" }}
                          noWrap
                        >
                          {cat.nombre}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          ID #{cat.id}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Columna 2: descripción */}
                    <Box sx={{ flex: 4, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                      >
                        {cat.descripcion || "Sin descripción"}
                      </Typography>
                    </Box>

                    {/* Columna 3: estado con chip y botón toggle */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ flex: 1.5, minWidth: 0 }}
                    >
                      <Chip
                        label={cat.estado}
                        size="small"
                        sx={{
                          borderRadius: "999px",
                          fontSize: 12,
                          fontWeight: 600,
                          bgcolor: esActiva ? "#bbf7d0" : "#fee2e2",
                          color: esActiva ? "#166534" : "#b91c1c",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleToggleEstado(
                            cat,
                            esActiva ? "Inactivo" : "Activo"
                          )
                        }
                      >
                        <PowerSettingsNewIcon
                          fontSize="small"
                          sx={{ color: esActiva ? "#f97316" : "#22c55e" }}
                        />
                      </IconButton>
                    </Stack>

                    {/* Columna 4: acciones */}
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{ flex: 1.5 }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => abrirModalEditar(cat)}
                      >
                        <EditIcon
                          fontSize="small"
                          sx={{ color: "#f59e0b" }}
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(cat)}
                      >
                        <DeleteIcon
                          fontSize="small"
                          sx={{ color: "#ef4444" }}
                        />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              );
            })
          )}
        </Paper>
      )}

      {/* MODAL CREAR / EDITAR */}
      <CategoryProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategoria(null);
        }}
        onSubmit={handleSubmitModal}
        initialData={
          selectedCategoria
            ? ({
                nombre: selectedCategoria.nombre,
                descripcion: selectedCategoria.descripcion,
                estado: selectedCategoria.estado,
              } as CategoryData)
            : undefined
        }
      />
    </>
  );
}