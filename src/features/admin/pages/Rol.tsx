import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";

import FiltersBar from "../../../components/shared/FiltersBar";
import RolModal from "../components/modals/RolModal";
import { useToast } from "../../../components/ui/Toast";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import rolesApi, {
  RolDto,
  RolCreateRequest,
  RolUpdateRequest,
} from "../../../api/admin/rolesApi";

export default function Rol() {
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRol, setSelectedRol] = useState<RolDto | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== CARGA =====
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

  // Filtros (por ahora sin combos)
  const filtros: any[] = [];

  const rolesOrdenados = useMemo(
  () => [...roles].sort((a, b) => a.idRol - b.idRol),
  [roles]
);



  // Datos filtrados
  const datosFiltrados = useMemo(
  () =>
    rolesOrdenados
      .filter((rol) => rol.estadoRegistro === 1)
      .filter((rol) =>
        rol.nombreRol.toLowerCase().includes(busqueda.toLowerCase())
      ),
  [rolesOrdenados, busqueda]
);

  // ===== PERMISOS VISUALES (chips) =====
  const getPermisosPorRol = (nombreRol: string): string[] => {
    const n = nombreRol.toUpperCase();

    if (n === "ADMIN") return ["Todos"];
    if (n === "SUPERVISOR") return ["Stands", "Reportes"];
    if (n === "SOCIO") return ["Stand propio"];

    // Rol genérico
    return ["Personalizado"];
  };

  // ===== HANDLERS =====
  const handleAdd = () => {
    setSelectedRol(null);
    setModalMode("create");
    setOpenModal(true);
  };

  const handleEditClick = (row: RolDto) => {
    setSelectedRol(row);
    setModalMode("edit");
    setOpenModal(true);
  };

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
      {/* CABECERA AL ESTILO MOCK */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
          }}
        >
          Roles
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 520 }}
        >
          Administra los roles de usuario y sus permisos en el sistema.
        </Typography>
      </Box>

      {/* BARRA DE FILTROS + BOTÓN NUEVO */}
      <FiltersBar
        filters={filtros}
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onFilterChange={() => {}}
        onAdd={handleAdd}
        addLabel="Nuevo rol"
        // 👇 estilo de botón más redondo y moderno
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

      {/* TABLA MODERNA */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#f9fafb",
                  "& th": {
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  },
                }}
              >
                <TableCell sx={{ width: "10%" }}>ID</TableCell>
                <TableCell sx={{ width: "25%" }}>Nombre del rol</TableCell>
                <TableCell sx={{ width: "40%" }}>Descripción</TableCell>
                <TableCell sx={{ width: "15%" }}>Permisos</TableCell>
                <TableCell sx={{ width: "10%" }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {datosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        py: 5,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      No se encontraron roles con los criterios actuales.
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                datosFiltrados.map((rol) => (
                  <TableRow
                    key={rol.idRol}
                    hover
                    sx={{
                      "& td": {
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 14,
                      },
                    }}
                  >
                    <TableCell>{rol.idRol}</TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      {rol.nombreRol}
                    </TableCell>

                    <TableCell>{rol.descripcion}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {getPermisosPorRol(rol.nombreRol).map((perm) => (
                          <Chip
                            key={perm}
                            label={perm}
                            size="small"
                            sx={{
                              bgcolor:
                                perm === "Todos"
                                  ? "#bbf7d0"
                                  : "#e5e7eb",
                              color:
                                perm === "Todos"
                                  ? "#166534"
                                  : "#374151",
                              fontWeight: 600,
                              borderRadius: 999,
                              fontSize: 12,
                            }}
                          />
                        ))}
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(rol)}
                        >
                          <EditIcon fontSize="small" sx={{ color: "#f59e0b" }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(rol)}
                        >
                          <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* MODAL CREAR / EDITAR */}
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