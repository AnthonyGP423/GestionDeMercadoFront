import { Box, Button, Grid, Typography } from "@mui/material";
import CardCategoria from "../../components/cards/CardCategoria";
import { useToast } from "../../components/ui/Toast";
import { useState } from "react";

import CategoryModal from "./components/modals/CategoriaProductModal";
export default function Categoria() {
  const [modalOpen, setModalOpen] = useState(false);

  const { showToast } = useToast();
  type EstadoCategoria = "Activo" | "Inactivo";
  interface CategoriaItem {
    nombre: string;
    descripcion: string;
    estado: EstadoCategoria;
  }
  // ESTADO REAL DE LAS CATEGORÍAS
  const [categorias, setCategorias] = useState<CategoriaItem[]>([
    {
      nombre: "Abarrotes",
      descripcion: "Productos secos y no perecederos.",
      estado: "Activo" as "Activo" | "Inactivo",
    },
    {
      nombre: "Verdulería",
      descripcion: "Frutas y verduras frescas.",
      estado: "Activo",
    },
    {
      nombre: "Carnicería",
      descripcion: "Carnes y embutidos.",
      estado: "Inactivo",
    },
    {
      nombre: "Panadería",
      descripcion: "Pan artesanal y pasteles.",
      estado: "Activo",
    },
    {
      nombre: "Lácteos",
      descripcion: "Productos derivados de la leche.",
      estado: "Activo",
    },
    {
      nombre: "Pescadería",
      descripcion: "Pescados y mariscos frescos.",
      estado: "Activo",
    },
  ]);

  return (
    <>
      {/* TÍTULO */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Categorías de Stands
          </Typography>
          <Typography color="text.secondary">
            Define los rubros principales del mercado.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          sx={{ borderRadius: 10, px: 4 }}
          onClick={() => setModalOpen(true)}
        >
          + Nueva categoría
        </Button>
        <CategoryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={(data) => {
            setCategorias((prev) => [...prev, data]);
            showToast(`Categoría ${data.nombre} agregada`, "success");
          }}
        />
      </Box>

      {/* GRID DE TARJETAS */}
      <Grid container spacing={3}>
        {categorias.map((cat, index) => (
          <Grid key={index}>
            <CardCategoria
              nombre={cat.nombre}
              descripcion={cat.descripcion}
              estado={cat.estado}
              onToggleEstado={(nuevoEstado) => {
                setCategorias((prev) =>
                  prev.map((c, i) =>
                    i === index ? { ...c, estado: nuevoEstado } : c
                  )
                );
                showToast(
                  `${cat.nombre} ahora está ${nuevoEstado}`,
                  nuevoEstado === "Activo" ? "success" : "warning"
                );
              }}
              onEdit={() => showToast("Editar " + cat.nombre, "info")}
              onDelete={() => showToast("Eliminar " + cat.nombre, "error")}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
