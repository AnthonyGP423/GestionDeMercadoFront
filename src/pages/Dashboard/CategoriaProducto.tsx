import { useState } from "react";
import { Grid, Typography, Box, IconButton, Button } from "@mui/material";

import CategoryProductModal from "./components/modals/CategoriaProductModal";
import { useToast } from "../../components/ui/Toast";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";

interface CategoriaProducto {
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
}

export default function CategoriaProducto() {
  const { showToast } = useToast();

  // 🔹 DATOS DE EJEMPLO
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([
    {
      nombre: "Bebidas",
      descripcion: "Jugos, gaseosas, bebidas energéticas y más.",
      estado: "Activo",
    },
    {
      nombre: "Snacks",
      descripcion: "Galletas, papas fritas, frutos secos y bocadillos.",
      estado: "Inactivo",
    },
    {
      nombre: "Limpieza",
      descripcion: "Detergentes, jabones, cloro y productos de aseo.",
      estado: "Activo",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleToggleEstado = (index: number) => {
    setCategorias((prev) =>
      prev.map((cat, i) =>
        i === index
          ? {
              ...cat,
              estado: cat.estado === "Activo" ? "Inactivo" : "Activo",
            }
          : cat
      )
    );

    showToast(
      `La categoría ahora está ${
        categorias[index].estado === "Activo" ? "Inactiva" : "Activa"
      }`,
      categorias[index].estado === "Activo" ? "warning" : "success"
    );
  };

  const handleDelete = (index: number) => {
    const nombre = categorias[index].nombre;

    setCategorias((prev) => prev.filter((_, i) => i !== index));
    showToast(`Categoría "${nombre}" eliminada`, "error");
  };

  const handleSave = (data: any) => {
    if (editData !== null) {
      // Editar
      setCategorias((prev) =>
        prev.map((c, i) => (i === editData ? { ...c, ...data } : c))
      );
      showToast("Categoría actualizada", "success");
    } else {
      // Crear
      setCategorias((prev) => [...prev, data]);
      showToast("Categoría creada", "success");
    }

    setEditData(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Categorías de Productos
      </Typography>

      <Box sx={{ textAlign: "right" }}>
        <Button // <--- Cambia esto a Mayúscula
          variant="contained"
          color="success"
          sx={{ borderRadius: 10, px: 4 }}
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          + Nueva categoría
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categorias.map((cat, index) => (
          <Grid>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
              }}
            >
              {/* Nombre */}
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {cat.nombre}
              </Typography>

              {/* Descripción */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, minHeight: 50 }}
              >
                {cat.descripcion}
              </Typography>

              {/* Estado */}

              {/* Switch */}
              <Switch
                checked={cat.estado === "Activo"}
                onChange={() => handleToggleEstado(index)}
              />

              {/* Acciones */}
              <Box sx={{ mt: 1 }}>
                <IconButton
                  color="primary"
                  onClick={() => {
                    setEditData(index);
                    setModalOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton color="error" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* MODAL */}
      <CategoryProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSave}
        initialData={categorias[editData] || null}
      />
    </Box>
  );
}
