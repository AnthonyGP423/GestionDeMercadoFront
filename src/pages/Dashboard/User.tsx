import { useState } from "react";
import { Typography } from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
import DataTable from "../../components/shared/DataTable";
import NewUserModal from "./components/modals/UserModal";
import { useToast } from "../../components/ui/Toast";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Usuario() {
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Datos de ejemplo
  const rows = [
    {
      nombre: "Alejandro Martínez",
      email: "alejandro.martinez@email.com",
      rol: "ADMIN",
      estado: "ACTIVO",
    },
    {
      nombre: "Beatriz González",
      email: "beatriz.gonzalez@email.com",
      rol: "SUPERVISOR",
      estado: "ACTIVO",
    },
    {
      nombre: "Carlos Sánchez",
      email: "carlos.sanchez@email.com",
      rol: "SOCIO",
      estado: "SUSPENDIDO",
    },
    {
      nombre: "Daniela Rojas",
      email: "daniela.rojas@email.com",
      rol: "SOCIO",
      estado: "BAJA",
    },
  ];

  // 🔹 Filtros configurables
  const filtros = [
    { label: "Rol", field: "rol", options: ["ADMIN", "SUPERVISOR", "SOCIO"] },
    {
      label: "Estado",
      field: "estado",
      options: ["ACTIVO", "SUSPENDIDO", "BAJA"],
    },
  ];

  // 🔹 Columnas de DataTable (IMPORTANTE: type está tipado con literals)
  const columnas = [
    { title: "Nombre completo", field: "nombre", type: "text" as const },
    { title: "Email", field: "email", type: "text" as const },
    { title: "Rol", field: "rol", type: "text" as const },
    { title: "Estado", field: "estado", type: "status" as const },
  ];

  // 🔹 Filtrado real
  const datosFiltrados = rows.filter((row) => {
    const coincideRol = filtroRol === "Todos" || row.rol === filtroRol;
    const coincideEstado =
      filtroEstado === "Todos" || row.estado === filtroEstado;
    const coincideBusqueda =
      row.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      row.email.toLowerCase().includes(busqueda.toLowerCase());

    return coincideRol && coincideEstado && coincideBusqueda;
  });

  // 🔹 Acciones por fila
  const acciones = [
    {
      icon: <VisibilityIcon color="primary" />,
      onClick: (row: any) => console.log("Ver usuario:", row),
    },
    {
      icon: <EditIcon color="warning" />,
      onClick: (row: any) => console.log("Editar usuario:", row),
    },
    {
      icon: <DeleteIcon color="error" />,
      onClick: (row: any) => console.log("Eliminar usuario:", row),
    },
  ];

  // 🔹 Acción cuando se guarda en el modal
  const handleSubmit = (data: any) => {
    console.log("Nuevo usuario:", data);
    showToast("Usuario creado correctamente", "success");
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 5, fontWeight: "bold" }}>
        Gestión de Usuarios
      </Typography>

      <FiltersBar
        filters={filtros}
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onFilterChange={(field, value) => {
          if (field === "rol") setFiltroRol(value);
          if (field === "estado") setFiltroEstado(value);
        }}
        onAdd={() => setOpenModal(true)}
        addLabel="Nuevo usuario"
      />

      <DataTable columns={columnas} data={datosFiltrados} actions={acciones} />

      <NewUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
