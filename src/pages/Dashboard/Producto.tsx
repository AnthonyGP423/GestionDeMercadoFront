import { useState } from "react";
import { Typography } from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
import DataTable from "../../components/shared/DataTable";
import { useToast } from "../../components/ui/Toast";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProductModal from "./components/modals/ProductModal";

export default function Producto() {
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroStand, setFiltroStand] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [search, setSearch] = useState("");

  // Data fake de ejemplo
  const rows = [
    {
      nombre: "Tomates Frescos",
      categoria: "Verduras",
      stand: "A-101",
      unidad: "Kg",
      precio: 4.5,
      oferta: true,
      precioOferta: 3.8,
      visible: true,
      estado: "Activo",
    },
    {
      nombre: "Pollo Entero",
      categoria: "Carnes",
      stand: "B-204",
      unidad: "Unidad",
      precio: 12,
      oferta: false,
      precioOferta: null,
      visible: true,
      estado: "Activo",
    },
    {
      nombre: "Gaseosa Cola",
      categoria: "Abarrotes",
      stand: "A-115",
      unidad: "Litro",
      precio: 3.5,
      oferta: false,
      precioOferta: null,
      visible: false,
      estado: "Inactivo",
    },
  ];

  // Filtros configurables
  const filtros = [
    {
      label: "Categoría",
      field: "categoria",
      options: ["Verduras", "Carnes", "Abarrotes"],
    },
    {
      label: "Stand",
      field: "stand",
      options: ["A-101", "B-204", "A-115"],
    },
    {
      label: "Estado",
      field: "estado",
      options: ["Activo", "Inactivo"],
    },
  ];

  // Columnas de DataTable
  const columnas = [
    { title: "Nombre", field: "nombre", type: "text" as const },
    { title: "Categoría", field: "categoria", type: "text" as const },
    { title: "Stand", field: "stand", type: "text" as const },
    { title: "Unidad", field: "unidad", type: "text" as const },
    { title: "Precio", field: "precio", type: "text" as const },
    { title: "Oferta", field: "oferta", type: "status" as const },
    { title: "Visible", field: "visible", type: "status" as const },
    { title: "Estado", field: "estado", type: "status" as const },
  ];

  // Filtrado real
  const datosFiltrados = rows.filter((row) => {
    const c1 = filtroCategoria === "Todos" || row.categoria === filtroCategoria;
    const c2 = filtroStand === "Todos" || row.stand === filtroStand;
    const c3 = filtroEstado === "Todos" || row.estado === filtroEstado;
    const c4 =
      row.nombre.toLowerCase().includes(search.toLowerCase()) ||
      row.categoria.toLowerCase().includes(search.toLowerCase());

    return c1 && c2 && c3 && c4;
  });

  // Acciones por fila
  const acciones = [
    {
      icon: <VisibilityIcon color="primary" />,
      onClick: (row: any) => showToast("Detalles de: " + row.nombre, "info"),
    },
    {
      icon: <EditIcon color="warning" />,
      onClick: (row: any) => showToast("Editar: " + row.nombre, "warning"),
    },
    {
      icon: <DeleteIcon color="error" />,
      onClick: (row: any) => showToast("Eliminar: " + row.nombre, "error"),
    },
  ];

  return (
    <>
      <Typography variant="h4" sx={{ mb: 5, fontWeight: "bold" }}>
        Gestión de Productos
      </Typography>

      <FiltersBar
        filters={filtros}
        searchValue={search}
        onSearchChange={setSearch}
        onFilterChange={(field, value) => {
          if (field === "categoria") setFiltroCategoria(value);
          if (field === "stand") setFiltroStand(value);
          if (field === "estado") setFiltroEstado(value);
        }}
        onAdd={() => setOpenModal(true)}
        addLabel="Nuevo producto"
      />

      <DataTable columns={columnas} data={datosFiltrados} actions={acciones} />

      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(data) => showToast("Producto creado", "success")}
      />
    </>
  );
}
