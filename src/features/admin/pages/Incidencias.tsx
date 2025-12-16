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
  Tooltip,
} from "@mui/material";

import FiltersBar from "../../../components/shared/FiltersBar";
import { useToast } from "../../../components/ui/Toast";

import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import incidenciaAdminApi, {
  IncidenciaResponseDto,
  IncidenciaEstado,
  IncidenciaPrioridad,
} from "../../../api/admin/incidenciasAdminApi";

import IncidenciaEstadoDialog from "../components/IncidenciasEstadoDialog";
import IncidenciaResponsableDialog from "../components/IncidenciaResponsableDialog";

export default function IncidenciasAdmin() {
  const { showToast } = useToast();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("");

  const [incidencias, setIncidencias] = useState<IncidenciaResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [openEstadoDialog, setOpenEstadoDialog] = useState(false);
  const [openResponsableDialog, setOpenResponsableDialog] = useState(false);
  const [selectedIncidencia, setSelectedIncidencia] =
    useState<IncidenciaResponseDto | null>(null);

  // ===== CARGA =====
  const fetchIncidencias = async () => {
    try {
      setLoading(true);
      const page = await incidenciaAdminApi.listar({
        estado: filtroEstado || undefined,
        tipo: filtroTipo || undefined,
        prioridad: filtroPrioridad || undefined,
        page: 0,
        size: 100, // por ahora un máximo razonable
      });
      setIncidencias(page.content);
    } catch (error) {
      console.error(error);
      showToast("No se pudieron cargar las incidencias", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroTipo, filtroPrioridad]);

  // ===== FILTROS VISUALES (adaptados a tu FiltersBar) =====
  const filtros = [
    {
      label: "Estado",
      field: "estado",
      options: ["ABIERTA", "EN_PROCESO", "RESUELTA", "CERRADA"],
    },
    {
      label: "Tipo",
      field: "tipo",
      options: [
        "LUZ",
        "DESAGUE",
        "LIMPIEZA",
        "AGUA",
        "ELECTRICIDAD",
        "SEGURIDAD",
        "RESIDUOS",
        "INFRAESTRUCTURA",
        "HIGIENE",
        "RUIDO",
        "VENTILACION",
        "OTRO",
      ],
    },
    {
      label: "Prioridad",
      field: "prioridad",
      options: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
    },
  ];

  const handleFilterChange = (field: string, value: string) => {
    // El Select usa "Todos" como valor para limpiar
    const val = value === "Todos" ? "" : value;

    if (field === "estado") setFiltroEstado(val);
    if (field === "tipo") setFiltroTipo(val);
    if (field === "prioridad") setFiltroPrioridad(val);
  };

  // ===== DATOS FILTRADOS (búsqueda local por título / stand) =====
  const datosFiltrados = useMemo(
    () =>
      incidencias.filter((i) => {
        if (!busqueda) return true;

        const texto = (
          (i.titulo || "") +
          " " +
          (i.descripcion || "") +
          " " +
          (i.nombreStand || "") +
          " " +
          (i.bloque || "") +
          " " +
          (i.numeroStand || "")
        )
          .toLowerCase()
          .trim();

        return texto.includes(busqueda.toLowerCase());
      }),
    [incidencias, busqueda]
  );

  // ===== CHIPS DE ESTADO / PRIORIDAD =====
  const getEstadoChipSx = (estado: IncidenciaEstado | string) => {
    const e = (estado || "").toUpperCase();

    if (e === "ABIERTA") {
      return {
        bgcolor: "#fee2e2",
        color: "#b91c1c",
      };
    }
    if (e === "EN_PROCESO") {
      return {
        bgcolor: "#dbeafe",
        color: "#1d4ed8",
      };
    }
    if (e === "RESUELTA") {
      return {
        bgcolor: "#dcfce7",
        color: "#166534",
      };
    }
    if (e === "CERRADA") {
      return {
        bgcolor: "#e5e7eb",
        color: "#374151",
      };
    }
    return {
      bgcolor: "#f3f4f6",
      color: "#4b5563",
    };
  };

  const getPrioridadChipSx = (p: IncidenciaPrioridad | string | null) => {
    const pr = (p || "").toUpperCase();

    if (pr === "CRITICA") {
      return {
        bgcolor: "#fee2e2",
        color: "#b91c1c",
      };
    }
    if (pr === "ALTA") {
      return {
        bgcolor: "#fed7aa",
        color: "#c2410c",
      };
    }
    if (pr === "MEDIA") {
      return {
        bgcolor: "#fef3c7",
        color: "#92400e",
      };
    }
    if (pr === "BAJA") {
      return {
        bgcolor: "#e0f2fe",
        color: "#075985",
      };
    }
    return {
      bgcolor: "#f3f4f6",
      color: "#4b5563",
    };
  };

  // ===== HANDLERS ACCIONES =====
  const handleOpenEstadoDialog = (row: IncidenciaResponseDto) => {
    setSelectedIncidencia(row);
    setOpenEstadoDialog(true);
  };

  const handleOpenResponsableDialog = (row: IncidenciaResponseDto) => {
    setSelectedIncidencia(row);
    setOpenResponsableDialog(true);
  };

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (!selectedIncidencia) return;

    try {
      const updated = await incidenciaAdminApi.cambiarEstado(
        selectedIncidencia.idIncidencia,
        nuevoEstado
      );

      setIncidencias((prev) =>
        prev.map((i) =>
          i.idIncidencia === updated.idIncidencia ? updated : i
        )
      );
      showToast("Estado actualizado correctamente", "success");
    } catch (error: any) {
      console.error(error);
      showToast("No se pudo cambiar el estado", "error");
    } finally {
      setOpenEstadoDialog(false);
      setSelectedIncidencia(null);
    }
  };

  const handleResponsableChange = async (idResponsable: number) => {
    if (!selectedIncidencia) return;

    try {
      const updated = await incidenciaAdminApi.asignarResponsable(
        selectedIncidencia.idIncidencia,
        idResponsable
      );

      setIncidencias((prev) =>
        prev.map((i) =>
          i.idIncidencia === updated.idIncidencia ? updated : i
        )
      );
      showToast("Responsable asignado correctamente", "success");
    } catch (error: any) {
      console.error(error);
      showToast("No se pudo asignar el responsable", "error");
    } finally {
      setOpenResponsableDialog(false);
      setSelectedIncidencia(null);
    }
  };

  return (
    <>
      {/* CABECERA */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily:
              '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
          }}
        >
          Incidencias
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 620 }}
        >
          Monitorea y gestiona las incidencias reportadas en el mercado mayorista.
          Asigna responsables y controla el flujo de estados.
        </Typography>
      </Box>

      {/* BARRA DE FILTROS (sin botón "Nuevo" porque las crea el socio) */}
      <FiltersBar
        filters={filtros}
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onFilterChange={handleFilterChange}
      />

      {/* TABLA */}
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
                <TableCell sx={{ width: "6%" }}>ID</TableCell>
                <TableCell sx={{ width: "16%" }}>Stand</TableCell>
                <TableCell sx={{ width: "20%" }}>Título</TableCell>
                <TableCell sx={{ width: "10%" }}>Tipo</TableCell>
                <TableCell sx={{ width: "10%" }}>Prioridad</TableCell>
                <TableCell sx={{ width: "12%" }}>Estado</TableCell>
                <TableCell sx={{ width: "14%" }}>Reportante</TableCell>
                <TableCell sx={{ width: "14%" }}>Responsable</TableCell>
                <TableCell sx={{ width: "8%" }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {datosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      sx={{
                        py: 5,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      No se encontraron incidencias con los criterios actuales.
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                datosFiltrados.map((i) => (
                  <TableRow
                    key={i.idIncidencia}
                    hover
                    sx={{
                      "& td": {
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 14,
                      },
                    }}
                  >
                    <TableCell>{i.idIncidencia}</TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {i.nombreStand || "(Sin nombre)"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {i.bloque} - {i.numeroStand}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {i.titulo}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {i.descripcion}
                      </Typography>
                    </TableCell>

                    <TableCell>{i.tipo || "-"}</TableCell>

                    <TableCell>
                      <Chip
                        label={i.prioridad || "SIN PRIORIDAD"}
                        size="small"
                        sx={{
                          borderRadius: 999,
                          fontWeight: 600,
                          fontSize: 12,
                          ...getPrioridadChipSx(i.prioridad),
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={i.estado}
                        size="small"
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: 12,
                          ...getEstadoChipSx(i.estado),
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {i.nombreReportante || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {i.nombreResponsable || "Sin asignar"}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title="Asignar responsable">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenResponsableDialog(i)}
                          >
                            <PersonSearchIcon
                              fontSize="small"
                              sx={{ color: "#0ea5e9" }}
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Cambiar estado">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEstadoDialog(i)}
                          >
                            <AutorenewIcon
                              fontSize="small"
                              sx={{ color: "#f97316" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* DIALOGS */}
      <IncidenciaEstadoDialog
        open={openEstadoDialog}
        onClose={() => {
          setOpenEstadoDialog(false);
          setSelectedIncidencia(null);
        }}
        incidencia={selectedIncidencia}
        onSubmit={handleEstadoChange}
      />

      <IncidenciaResponsableDialog
        open={openResponsableDialog}
        onClose={() => {
          setOpenResponsableDialog(false);
          setSelectedIncidencia(null);
        }}
        incidencia={selectedIncidencia}
        onSubmit={handleResponsableChange}
      />
    </>
  );
}