import { useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
import DataTable from "../../components/shared/DataTable";
import RolModal from "./components/modals/RolModal";
import { useToast } from "../../components/ui/Toast";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import rolesApi, { RolDto, RolCreateRequest, RolUpdateRequest } from "../../api/rolesApi";

export default function Rol() {
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRol, setSelectedRol] = useState<RolDto | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar roles desde el backend
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await rolesApi.listar();
      setRoles(data);
    } catch (error: any) {
      console.error(error);
      showToast("No se pudieron cargar los roles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filtros (no hay combos por ahora)
  const filtros: any[] = [];

  // Columnas de la tabla
  const columnas = [
    { title: "ID", field: "idRol"},
    { title: "Nombre del Rol", field: "nombreRol", type: "text" as const },
    { title: "Descripción", field: "descripcion", type: "text" as const },
  ];

  // Filtrado de datos por búsqueda
  const datosFiltrados = useMemo(
  () =>
    roles
      .filter((rol) => rol.estadoRegistro === 1)  // 👈 extra filtro
      .filter((rol) =>
        rol.nombreRol.toLowerCase().includes(busqueda.toLowerCase())
      ),
  [roles, busqueda]
);

  // Abrir modal en modo crear
  const handleAdd = () => {
    setSelectedRol(null);
    setModalMode("create");
    setOpenModal(true);
  };

  // Abrir modal en modo editar
  const handleEditClick = (row: RolDto) => {
    setSelectedRol(row);
    setModalMode("edit");
    setOpenModal(true);
  };

  // Eliminar rol
  const handleDeleteClick = async (row: RolDto) => {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el rol "${row.nombreRol}"?`
    );
    if (!ok) return;

    try {
      await rolesApi.eliminar(row.idRol);
      setRoles((prev) => prev.filter((r) => r.idRol !== row.idRol));
      showToast("Rol eliminado correctamente", "success");
    } catch (error: any) {
      console.error(error);
      showToast("No se pudo eliminar el rol", "error");
    }
  };

  // Acciones por fila
  const acciones = [
    {
      icon: <EditIcon color="warning" />,
      onClick: (row: RolDto) => handleEditClick(row),
    },
    {
      icon: <DeleteIcon color="error" />,
      onClick: (row: RolDto) => handleDeleteClick(row),
    },
  ];

  // Guardar (crear o actualizar)
  const handleSubmit = async (
    data: RolCreateRequest | RolUpdateRequest
  ) => {
    try {
      if (modalMode === "create") {
        const nuevo = await rolesApi.crear(data);
        setRoles((prev) => [...prev, nuevo]);
        showToast("Rol registrado correctamente", "success");
      } else if (modalMode === "edit" && selectedRol) {
        const actualizado = await rolesApi.actualizar(selectedRol.idRol, data);
        setRoles((prev) =>
          prev.map((r) => (r.idRol === actualizado.idRol ? actualizado : r))
        );
        showToast("Rol actualizado correctamente", "success");
      }
      setOpenModal(false);
      setSelectedRol(null);
    } catch (error: any) {
      console.error(error);
      showToast("Ocurrió un error al guardar el rol", "error");
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 5, fontWeight: "bold" }}>
        Gestión de Roles
      </Typography>

      <FiltersBar
        filters={filtros}
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onFilterChange={() => {}}
        onAdd={handleAdd}
        addLabel="Nuevo rol"
      />

      {loading ? (
        <Typography variant="body1">Cargando roles...</Typography>
      ) : (
        <DataTable
          columns={columnas}
          data={datosFiltrados}
          actions={acciones}
        />
      )}

      <RolModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRol(null);
        }}
        mode={modalMode}
        initialData={selectedRol}
        onSubmit={handleSubmit}
      />
    </>
  );
}