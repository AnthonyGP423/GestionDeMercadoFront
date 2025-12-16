import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useState, useEffect } from "react";
import { IncidenciaResponseDto } from "../../../api/admin/incidenciasAdminApi";
import { usuarioApi, UsuarioRow } from "../../../api/admin/usuarioApi";

interface Props {
  open: boolean;
  onClose: () => void;
  incidencia: IncidenciaResponseDto | null;
  onSubmit: (idResponsable: number) => void;
}

interface UsuarioOption {
  idUsuario: number;
  nombreCompleto: string;
  rol: string;
  tipo: "TRABAJADOR" | "SOCIO" | "OTRO";
}

export default function IncidenciaResponsableDialog({
  open,
  onClose,
  incidencia,
  onSubmit,
}: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioOption | null>(
    null
  );

  // Cargar usuarios cuando se abre el diálogo
  useEffect(() => {
    if (!open) return;

    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);

        // Traemos todos los usuarios y filtramos a ACTIVO
        const data: UsuarioRow[] = await usuarioApi.listar();
        const activos = data.filter(
          (u) =>
            (u.estado || "").toUpperCase() === "ACTIVO" ||
            u.estado === "" ||
            u.estado == null
        );

        const opciones: UsuarioOption[] = activos.map((u) => {
          const rol = (u.rol || "").toUpperCase();

          let tipo: UsuarioOption["tipo"] = "OTRO";
          if (rol === "ADMIN" || rol === "SUPERVISOR" || rol === "TRABAJADOR") {
            tipo = "TRABAJADOR";
          } else if (rol === "SOCIO") {
            tipo = "SOCIO";
          }

          return {
            idUsuario: u.id,
            nombreCompleto: u.nombre,
            rol,
            tipo,
          };
        });

        // Orden: TRABAJADOR -> SOCIO -> OTRO, y dentro alfabético
        opciones.sort((a, b) => {
          const peso = (t: UsuarioOption["tipo"]) =>
            t === "TRABAJADOR" ? 0 : t === "SOCIO" ? 1 : 2;

          const pa = peso(a.tipo);
          const pb = peso(b.tipo);

          if (pa !== pb) return pa - pb;
          return a.nombreCompleto.localeCompare(b.nombreCompleto);
        });

        setUsuarios(opciones);

        // Si la incidencia ya tiene responsable, seleccionarlo
        if (incidencia?.idResponsable) {
          const encontrado = opciones.find(
            (o) => o.idUsuario === incidencia.idResponsable
          );
          setSelectedUsuario(encontrado || null);
        } else {
          setSelectedUsuario(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, [open, incidencia]);

  const handleConfirm = () => {
    if (!selectedUsuario) return;
    onSubmit(selectedUsuario.idUsuario);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Asignar responsable</DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        {incidencia && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Incidencia #{incidencia.idIncidencia}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {incidencia.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stand: {incidencia.nombreStand || "-"} ({incidencia.bloque} -{" "}
              {incidencia.numeroStand})
            </Typography>
          </Stack>
        )}

        <Autocomplete
          fullWidth
          size="small"
          options={usuarios}
          value={selectedUsuario}
          onChange={(_, newValue) => setSelectedUsuario(newValue)}
          loading={loadingUsuarios}
          // 🔍 búsqueda por nombre + rol
          filterOptions={(options, state) =>
            options.filter((opt) =>
              `${opt.nombreCompleto} ${opt.rol}`
                .toLowerCase()
                .includes(state.inputValue.toLowerCase())
            )
          }
          getOptionLabel={(option) =>
            `${option.nombreCompleto} (${option.rol || "SIN ROL"})`
          }
          groupBy={(option) =>
            option.tipo === "TRABAJADOR"
              ? "Trabajadores"
              : option.tipo === "SOCIO"
              ? "Socios"
              : "Otros"
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Responsable"
              placeholder="Busca por nombre o rol..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingUsuarios ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText={
            loadingUsuarios ? "Cargando usuarios..." : "No se encontraron usuarios"
          }
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
          }}
          disabled={!selectedUsuario}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}