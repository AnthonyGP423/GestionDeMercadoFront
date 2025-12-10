// src/pages/categorias/Categoria.tsx

import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import CardCategoria from "../Dashboard/components/cards/CardCategoria";
import { useToast } from "../../components/ui/Toast";
import CategoryModal from "./components/modals/CategoriaProductModal"; // tu CategoriaStandModal
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
  estado: EstadoCategoria;
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

export default function Categoria() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaItem | null>(
    null
  );

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

  // CREAR
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

  // EDITAR
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

  // Cambiar estado desde la card
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

  return (
    <>
      {/* CABECERA */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Categorías de Stands
          </Typography>
          <Typography color="text.secondary">
            Define los rubros principales de los puestos del mercado.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          sx={{
            borderRadius: 999,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 700,
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

      {/* LISTA DE TARJETAS */}
      {loading ? (
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
        <Typography color="text.secondary">
          Aún no hay categorías registradas.
        </Typography>
      ) : (
        <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 5,                // 🔥 separación amplia entre cards
    rowGap: 6,             // 🔥 aún más separación vertical
    justifyContent: "flex-start",
    pt: 2,
  }}
>
  {categorias.map((cat) => (
    <Box
      key={cat.id}
      sx={{
        flex: "1 1 260px",
        maxWidth: 320,
      }}
    >
      <CardCategoria
        nombre={cat.nombre}
        descripcion={cat.descripcion}
        estado={cat.estado}
        colorHex={cat.colorHex}
        iconoUrl={cat.iconoUrl}
        onToggleEstado={(nuevo) => handleToggleEstado(cat, nuevo)}
        onEdit={() => {
          setEditingCategoria(cat);
          setModalOpen(true);
        }}
        onDelete={() => handleDelete(cat)}
      />
    </Box>
  ))}
</Box>
      )}
    </>
  );
}