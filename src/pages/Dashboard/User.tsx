import { useEffect, useMemo, useState } from "react";
import { Typography, CircularProgress, Box } from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
import DataTable from "../../components/shared/DataTable";
import NewUserModal from "./components/modals/UserModal";
import { useToast } from "../../components/ui/Toast";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  usuarioApi,
  UsuarioRow,
  UsuarioBackend,
} from "../../api/usuarioApi";

type ModalMode = "create" | "edit" | "view";

interface UsuarioFormData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
  dni: string;
  ruc: string;
  razonSocial: string;
  rol: string;
  foto?: string;
}

export default function Usuario() {
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioRow | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<UsuarioFormData | undefined>();

  // ===========================
  //   CARGAR LISTA DESDE BACKEND
  // ===========================
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuarioApi.listar();
      setUsuarios(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.mensaje ||
          "Ocurrió un error al cargar la lista de usuarios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // ===========================
  //   FILTROS
  // ===========================
  const filtros = [
    { label: "Rol", field: "rol", options: ["ADMIN", "SUPERVISOR", "SOCIO", "TRABAJADOR", "CLIENTE"] },
    {
      label: "Estado",
      field: "estado",
      options: ["ACTIVO", "SUSPENDIDO", "BAJA"],
    },
  ];

  const columnas = [
    { title: "Nombre completo", field: "nombre", type: "text" as const },
    { title: "Email", field: "email", type: "text" as const },
    { title: "Rol", field: "rol", type: "text" as const },
    { title: "Estado", field: "estado", type: "status" as const },
  ];

  const datosFiltrados = useMemo(
    () =>
      usuarios.filter((row) => {
        const coincideRol = filtroRol === "Todos" || row.rol === filtroRol;
        const coincideEstado =
          filtroEstado === "Todos" || row.estado === filtroEstado;
        const q = busqueda.toLowerCase();

        const coincideBusqueda =
          row.nombre.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q);

        return coincideRol && coincideEstado && coincideBusqueda;
      }),
    [usuarios, filtroRol, filtroEstado, busqueda]
  );

  // ===========================
  //   MAPEO DETALLE → FORM
  // ===========================
  const mapBackendToForm = (u: UsuarioBackend): UsuarioFormData => ({
    nombre: u.nombres ?? "",
    apellidos: u.apellidos ?? "",
    email: u.email,
    password: "",
    telefono: u.telefono ?? "",
    dni: u.dni ?? "",
    ruc: u.ruc ?? "",
    razonSocial: u.razonSocial ?? "",
    rol:
      typeof u.rol === "string"
        ? u.rol
        : u.rol && "nombreRol" in u.rol
        ? u.rol.nombreRol
        : "",
    foto: u.fotoUrl ?? u.foto_url ?? "",
  });

  // ===========================
  //   ACCIONES POR FILA
  // ===========================
  const abrirModalConDetalle = async (row: UsuarioRow, mode: ModalMode) => {
    try {
      setModalMode(mode);
      setUsuarioSeleccionado(row);
      setOpenModal(true);

      const detalle = await usuarioApi.obtener(row.id);
      setInitialFormData(mapBackendToForm(detalle));
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudo obtener los datos del usuario.",
        "error"
      );
      setOpenModal(false);
      setUsuarioSeleccionado(null);
    }
  };

  const handleVer = (row: UsuarioRow) => {
    abrirModalConDetalle(row, "view");
  };

  const handleEditar = (row: UsuarioRow) => {
    abrirModalConDetalle(row, "edit");
  };

  const handleEliminar = async (row: UsuarioRow) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar al usuario "${row.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await usuarioApi.eliminar(row.id);
      showToast("Usuario eliminado correctamente", "success");
      cargarUsuarios();
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudo eliminar el usuario. Intenta nuevamente.",
        "error"
      );
    }
  };

  const acciones = [
    {
      icon: <VisibilityIcon color="primary" />,
      onClick: (row: UsuarioRow) => handleVer(row),
    },
    {
      icon: <EditIcon color="warning" />,
      onClick: (row: UsuarioRow) => handleEditar(row),
    },
    {
      icon: <DeleteIcon color="error" />,
      onClick: (row: UsuarioRow) => handleEliminar(row),
    },
  ];

  // ===========================
  //   CREAR / EDITAR (MODAL)
  // ===========================
  const handleSubmitModal = async (formData: UsuarioFormData) => {
    try {
      const body: any = {
        email: formData.email,
        nombres: formData.nombre,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        dni: formData.dni,
        ruc: formData.ruc,
        razonSocial: formData.razonSocial,
        rol: formData.rol, // si tu backend usa idRol, aquí puedes mapearlo
      };

      if (formData.password) {
        body.password = formData.password;
      }

      if (modalMode === "edit" && usuarioSeleccionado) {
        await usuarioApi.actualizar(usuarioSeleccionado.id, body);
        showToast("Usuario actualizado correctamente", "success");
      } else {
        await usuarioApi.crear(body);
        showToast("Usuario creado correctamente", "success");
      }

      setOpenModal(false);
      setUsuarioSeleccionado(null);
      setInitialFormData(undefined);
      cargarUsuarios();
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudo guardar el usuario. Revisa los datos.",
        "error"
      );
    }
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setUsuarioSeleccionado(null);
    setInitialFormData(undefined);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUsuarioSeleccionado(null);
    setInitialFormData(undefined);
  };

  // ===========================
  //   RENDER
  // ===========================
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Gestión de Usuarios
        </Typography>
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      </>
    );
  }

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
        onAdd={handleOpenCreate}
        addLabel="Nuevo usuario"
      />

      <DataTable columns={columnas} data={datosFiltrados} actions={acciones} />

      <NewUserModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        initialData={initialFormData}
        mode={modalMode}
      />
    </>
  );
}