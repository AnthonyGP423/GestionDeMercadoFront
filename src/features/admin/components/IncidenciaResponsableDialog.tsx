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
  Box,
  Paper,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useState, useEffect, useMemo } from "react";
import { IncidenciaResponseDto } from "../../../api/admin/incidenciasAdminApi";
import { usuarioApi, UsuarioRow } from "../../../api/admin/usuarioApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}
function buildImgSrc(raw: string) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (v.startsWith("/")) return `${API_BASE_URL}${v}`;
  if (isAbsoluteUrl(v)) return v;
  return `${API_BASE_URL}/${v}`;
}

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

  // preview foto incidencia
  const fotoOk = Boolean(
    incidencia?.fotoUrl && String(incidencia.fotoUrl).trim()
  );
  const fotoSrc = useMemo(
    () => (fotoOk ? buildImgSrc(String(incidencia!.fotoUrl)) : ""),
    [fotoOk, incidencia]
  );

  // Cargar usuarios cuando se abre el diálogo
  useEffect(() => {
    if (!open) return;

    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);

        // Traemos todos los usuarios
        const data: UsuarioRow[] = await usuarioApi.listar();

        // Filtrar ACTIVO
        const activos = data.filter(
          (u) =>
            (u.estado || "").toUpperCase() === "ACTIVO" ||
            u.estado === "" ||
            u.estado == null
        );

        // Excluir CLIENTE como responsable
        const sinCliente = activos.filter(
          (u) => (u.rol || "").toUpperCase() !== "CLIENTE"
        );

        const opciones: UsuarioOption[] = sinCliente.map((u) => {
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>Asignar responsable</DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {incidencia && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Incidencia #{incidencia.idIncidencia}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
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
            loadingUsuarios
              ? "Cargando usuarios..."
              : "No se encontraron usuarios"
          }
        />

        {/* FOTO */}
        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            borderRadius: 3,
            overflow: "hidden",
            borderColor: "#e5e7eb",
          }}
        >
          <Box
            sx={{
              p: 1.25,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: 13 }}>
              Foto adjunta
            </Typography>
          </Box>

          <Box sx={{ p: 1.25 }}>
            {fotoOk ? (
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  overflow: "hidden",
                  height: 220,
                  bgcolor: "#f8fafc",
                }}
              >
                <img
                  src={fotoSrc}
                  alt="foto incidencia"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 220,
                  border: "1px dashed #e5e7eb",
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  px: 2,
                }}
              >
                <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
                  Sin foto
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 800,
          }}
          disabled={!selectedUsuario}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}