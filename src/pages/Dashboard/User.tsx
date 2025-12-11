import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
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
import DataTable from "../../components/shared/DataTable";

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
    {
      label: "Rol",
      field: "rol",
      options: ["ADMIN", "SUPERVISOR", "SOCIO", "TRABAJADOR", "CLIENTE"],
    },
    {
      label: "Estado",
      field: "estado",
      options: ["ACTIVO", "SUSPENDIDO", "BAJA"],
    },
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
        rol: formData.rol,
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
  //   CHIP DE ESTADO
  // ===========================
  const renderEstadoChip = (estado: string) => {
    const e = estado.toUpperCase();

    if (e === "ACTIVO") {
      return (
        <Chip
          label="ACTIVO"
          size="small"
          sx={{
            bgcolor: "#bbf7d0",
            color: "#166534",
            fontWeight: 600,
            borderRadius: 999,
            fontSize: 12,
          }}
        />
      );
    }

    if (e === "SUSPENDIDO") {
      return (
        <Chip
          label="SUSPENDIDO"
          size="small"
          sx={{
            bgcolor: "#fee2e2",
            color: "#b91c1c",
            fontWeight: 600,
            borderRadius: 999,
            fontSize: 12,
          }}
        />
      );
    }

    return (
      <Chip
        label={e}
        size="small"
        sx={{
          bgcolor: "#e5e7eb",
          color: "#374151",
          fontWeight: 600,
          borderRadius: 999,
          fontSize: 12,
        }}
      />
    );
  };

  // ===========================
  //   COLUMNAS + ACCIONES PARA DataTable
  // ===========================
  const columnas = [
    {
      title: "Nombre completo",
      field: "nombre",
      type: "text" as const,
    },
    {
      title: "Email",
      field: "email",
      type: "text" as const,
    },
    {
      title: "Rol",
      field: "rol",
      type: "text" as const,
    },
    {
      title: "Estado",
      field: "estado",
      type: "status" as const,
      render: (row: UsuarioRow) => renderEstadoChip(row.estado),
    },
  ];

  const acciones = [
    {
      icon: <VisibilityIcon fontSize="small" sx={{ color: "#0ea5e9" }} />,
      onClick: (row: UsuarioRow) => handleVer(row),
    },
    {
      icon: <EditIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
      onClick: (row: UsuarioRow) => handleEditar(row),
    },
    {
      icon: <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />,
      onClick: (row: UsuarioRow) => handleEliminar(row),
    },
  ];

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
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 800,
            fontFamily: `"Poppins","Inter",system-ui,-apple-system`,
          }}
        >
          Usuarios
        </Typography>
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      </>
    );
  }

  return (
    <>
      {/* CABECERA — MATCH CON ROLES */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
          }}
        >
          Usuarios
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 520 }}
        >
          Administra los usuarios del sistema y sus roles.
        </Typography>
      </Box>

      {/* BARRA DE FILTROS + BOTÓN NUEVO USUARIO */}
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
        addButtonSx={{
          borderRadius: "999px",
          px: 3,
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
      />

      {/* CARD + TABLA CON PAGINADO INTERNO (DataTable) */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        <DataTable
          columns={columnas}
          data={datosFiltrados}
          actions={acciones}
        />
      </Paper>

      {/* MODAL CREAR / EDITAR / VER */}
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