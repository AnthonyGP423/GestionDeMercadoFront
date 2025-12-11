import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import CardCategoria from "../Dashboard/components/cards/CardCategoria";
import { useToast } from "../../components/ui/Toast";

import categoriasProductosApi, {
  CategoriaRow,
  EstadoCategoria,
} from "../../api/categoriasProductosApi";

import CategoryProductModal, {
  CategoryData,
} from "./components/modals/CategoriaProductModal";

type ModalMode = "create" | "edit";

const getColorForCategoria = (nombre: string): string => {
  const n = nombre.toLowerCase();

  if (n.includes("carne")) return "#ef4444";       // rojo - carnes
  if (n.includes("pesc")) return "#0ea5e9";        // celeste - pescados
  if (n.includes("marisco")) return "#0284c7";     // azul más intenso
  if (n.includes("fruta")) return "#22c55e";       // verde - frutas
  if (n.includes("verdura") || n.includes("hortaliza")) return "#16a34a";
  if (n.includes("tubérculo") || n.includes("tuberculo")) return "#a16207"; // amarillo/ocre
  if (n.includes("grano") || n.includes("cereal")) return "#f97316";        // naranja
  if (n.includes("lácteo") || n.includes("lacteo")) return "#6366f1";       // violeta
  if (n.includes("hierba") || n.includes("especia")) return "#10b981";      // verde menta
  if (n.includes("bebida")) return "#3b82f6";       // azul medio

  // por defecto, un violeta elegante
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

  const [filtroEstado, setFiltroEstado] = useState<
    "Todos" | EstadoCategoria
  >("Todos");

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
      {/* HEADER + CTA */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Categorías de Productos
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600 }}>
            Organiza los productos del mercado en{" "}
            <strong>rubros claros</strong>. Estas categorías se usan en el
            directorio público y en el portal de SOCIOS para clasificar
            los stands y sus productos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          sx={{ borderRadius: 10, px: 4 }}
          onClick={abrirModalCrear}
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

      {/* GRID DE TARJETAS (CSS Grid con Box) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          columnGap: 3,
          rowGap: 8,
        }}
      >
        {categoriasFiltradas.map((cat) => (
          <Box key={cat.id}>
            <CardCategoria
              nombre={cat.nombre}
              descripcion={cat.descripcion}
              estado={cat.estado}
              colorHex={getColorForCategoria(cat.nombre)}
              onToggleEstado={(nuevo) =>
                handleToggleEstado(cat, nuevo as EstadoCategoria)
              }
              onEdit={() => abrirModalEditar(cat)}
              onDelete={() => handleDelete(cat)}
            />
          </Box>
        ))}

        {!loading && categoriasFiltradas.length === 0 && (
          <Box
            sx={{
              gridColumn: "1 / -1", // ocupa todo el ancho del grid
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                No hay categorías para mostrar
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Crea tu primera categoría para comenzar a organizar el mercado.
              </Typography>
              <Button
                variant="outlined"
                color="success"
                sx={{ mt: 2, borderRadius: 10 }}
                onClick={abrirModalCrear}
              >
                Crear categoría
              </Button>
            </Paper>
          </Box>
        )}
      </Box>

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