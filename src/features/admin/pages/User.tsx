import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Chip } from "@mui/material";

import FiltersBar from "../../../components/shared/FiltersBar";
import NewUserModal, { UsuarioFormData } from "../components/modals/UserModal";
import { useToast } from "../../../components/ui/Toast";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  usuarioApi,
  UsuarioRow,
  UsuarioBackend,
} from "../../../api/admin/usuarioApi";
import DataTable from "../../../components/shared/DataTable";

import rolesApi, { RolDto } from "../../../api/admin/rolesApi";

type ModalMode = "create" | "edit" | "view";

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

  // ✅ roles dinámicos
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const cargarRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await rolesApi.listar();
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoles(false);
    }
  };

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
    void cargarRoles();
    void cargarUsuarios();
  }, []);

  // ==========================
  // FILTROS DINÁMICOS
  // ==========================
  const rolesOptions = useMemo(() => {
    const activos = roles.filter((r) => (r.estadoRegistro ?? 1) === 1);
    const names = activos
      .map((r) => String(r.nombreRol || "").toUpperCase())
      .filter(Boolean);
    return Array.from(new Set(names));
  }, [roles]);

  const filtros = [
    {
      label: "Rol",
      field: "rol",
      options: rolesOptions.length
        ? rolesOptions
        : ["ADMIN", "SUPERVISOR", "SOCIO", "TRABAJADOR", "CLIENTE"],
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

  // ==========================
  // MAPEO BACKEND → FORM
  // ==========================
  const mapBackendToForm = (u: UsuarioBackend): UsuarioFormData => {
    const rolObj =
      typeof u.rol === "object" && u.rol && "idRol" in u.rol ? u.rol : null;

    const nombreRol =
      typeof u.rol === "string" ? u.rol : rolObj?.nombreRol ?? "";

    let rolId = "";
    if (rolObj?.idRol != null) {
      rolId = String(rolObj.idRol);
    } else {
      const found = roles.find(
        (r) =>
          String(r.nombreRol || "").toUpperCase() ===
          String(nombreRol || "").toUpperCase()
      );
      rolId = found ? String(found.idRol) : "";
    }

    return {
      nombre: u.nombres ?? "",
      apellidos: u.apellidos ?? "",
      email: u.email,
      password: "",
      telefono: u.telefono ?? "",
      dni: u.dni ?? "",
      ruc: u.ruc ?? "",
      razonSocial: u.razonSocial ?? u.razon_social ?? "",
      rol: rolId,
      foto: u.fotoUrl ?? u.foto_url ?? "",
      fotoFile: null,
    };
  };

  // ==========================
  // ACCIONES
  // ==========================
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
        err?.response?.data?.mensaje || "No se pudo obtener los datos del usuario.",
        "error"
      );
      setOpenModal(false);
      setUsuarioSeleccionado(null);
    }
  };

  const handleVer = (row: UsuarioRow) => abrirModalConDetalle(row, "view");
  const handleEditar = (row: UsuarioRow) => abrirModalConDetalle(row, "edit");

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
      void cargarUsuarios();
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje ||
          "No se pudo eliminar el usuario. Intenta nuevamente.",
        "error"
      );
    }
  };

  // ==========================
  // CREAR / EDITAR (incluye password opcional + ruc/razon + foto)
  // ==========================
  const handleSubmitModal = async (formData: UsuarioFormData) => {
    try {
      const esEdicion = modalMode === "edit" && usuarioSeleccionado;

      if (esEdicion) {
        const passwordTrim = String(formData.password || "").trim();

        const body: any = {
          nombres: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono || null,
          ruc: formData.ruc || null,
          razonSocial: formData.razonSocial || null,
        };

        // ✅ solo enviar password si realmente escribieron una
        if (passwordTrim.length > 0) {
          body.password = passwordTrim;
        }

        await usuarioApi.actualizar(usuarioSeleccionado!.id, body);

        // ✅ si seleccionó foto, subir a filesApi y guardar url en usuario
        if (formData.fotoFile) {
          await usuarioApi.subirFoto(usuarioSeleccionado!.id, formData.fotoFile);
        }

        showToast("Usuario actualizado correctamente", "success");
      } else {
        const body = {
          idRol: Number(formData.rol),
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono || null,
          dni: formData.dni || null,
          ruc: formData.ruc || null,
          razonSocial: formData.razonSocial || null,
          nombres: formData.nombre,
          apellidos: formData.apellidos,
        };

        const creado = await usuarioApi.crear(body);

        if (formData.fotoFile) {
          await usuarioApi.subirFoto(creado.id, formData.fotoFile);
        }

        showToast("Usuario creado correctamente", "success");
      }

      setOpenModal(false);
      setUsuarioSeleccionado(null);
      setInitialFormData(undefined);
      void cargarUsuarios();
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.mensaje || "No se pudo guardar el usuario. Revisa los datos.",
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

  // ==========================
  // CHIP ESTADO
  // ==========================
  const renderEstadoChip = (estado: string) => {
    const e = estado.toUpperCase();

    if (e === "ACTIVO")
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

    if (e === "SUSPENDIDO")
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

  const columnas = [
    { title: "Nombre completo", field: "nombre", type: "text" as const },
    { title: "Email", field: "email", type: "text" as const },
    { title: "Rol", field: "rol", type: "text" as const },
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

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        <DataTable columns={columnas} data={datosFiltrados} actions={acciones} />
      </Paper>

      <NewUserModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={(data) => {
          void handleSubmitModal(data);
        }}
        initialData={initialFormData}
        mode={modalMode}
        roles={roles}
      />

      {loadingRoles ? null : null}
    </>
  );
}