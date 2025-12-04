import { useState } from "react";
import { Typography } from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
import DataTable from "../../components/shared/DataTable";
import RolModal from "./components/modals/RolModal";
import { useToast } from "../../components/ui/Toast";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Rol() {
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);

  const [busqueda, setBusqueda] = useState("");

  // 🔹 Datos de ejemplo
  const rows = [
    { nombre: "ADMINISTRADOR" },
    { nombre: "SUPERVISOR" },
    { nombre: "SOCIO" },
    { nombre: "INVITADO" },
  ];

  // 🔹 Configuración de filtros (solo búsqueda)
  const filtros: any[] = []; // roles no necesitan combos

  // 🔹 Columnas de tabla
  const columnas = [
    { title: "Nombre del Rol", field: "nombre", type: "text" as const },
  ];

  // 🔹 Filtrado real
  const datosFiltrados = rows.filter((row) =>
    row.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 🔹 Acciones por fila
  const acciones = [
    {
      icon: <EditIcon color="warning" />,
      onClick: (row: any) => console.log("Editar rol:", row),
    },
    {
      icon: <DeleteIcon color="error" />,
      onClick: (row: any) => console.log("Eliminar rol:", row),
    },
  ];

  const handleSubmit = (data: any) => {
    console.log("Rol creado:", data);
    showToast("Rol registrado correctamente", "success");
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 5, fontWeight: "bold" }}>
        Gestión de Roles
      </Typography>

      <FiltersBar
        filters={filtros} // no hay selects aquí
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onFilterChange={() => {}} // no se usa
        onAdd={() => setOpenModal(true)}
        addLabel="Nuevo rol"
      />

      <DataTable columns={columnas} data={datosFiltrados} actions={acciones} />

      <RolModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
