import { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import QRCode from "react-qr-code";

import { useToast } from "../../../components/ui/Toast";
import credencialesQrAdminApi, {
  CredencialResponseDto,
} from "../../../api/admin/credencialesQrAdminApi";
import { usuarioApi, UsuarioRow } from "../../../api/admin/usuarioApi";

type TipoUsuario = "TRABAJADOR" | "SOCIO" | "OTRO";

interface UsuarioOption {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  tipo: TipoUsuario;
}

// Para vista de validación rápida (seguridad)
interface ValidacionQrResponseDto {
  valida: boolean;
  mensaje: string;
  idUsuario?: number;
  nombres?: string;
  apellidos?: string;
  estadoUsuario?: string;
  tipoCredencial?: string;
  fechaEmision?: string;
  fechaVencimiento?: string | null;
  vigente?: boolean;
}

const todayPlusOneYearISO = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function CredencialesQrAdmin() {
  const { showToast } = useToast();

  const [usuarios, setUsuarios] = useState<UsuarioOption[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioOption | null>(
    null
  );

  const [tipoCredencial, setTipoCredencial] = useState<string>("SOCIO");
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(
    todayPlusOneYearISO()
  );

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [credencialGenerada, setCredencialGenerada] =
    useState<CredencialResponseDto | null>(null);

  // Historial de credenciales del usuario
  const [historial, setHistorial] = useState<CredencialResponseDto[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Validación de QR (p.e. seguridad en móvil)
  const [codigoValidar, setCodigoValidar] = useState("");
  const [loadingValidacion, setLoadingValidacion] = useState(false);
  const [resultadoValidacion, setResultadoValidacion] =
    useState<ValidacionQrResponseDto | null>(null);

  // 🔹 ref para imprimir solo el carnet
  const cardRef = useRef<HTMLDivElement | null>(null);

  // ===== CARGAR USUARIOS ACTIVO =====
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);
        const data: UsuarioRow[] = await usuarioApi.listar();

        const activos = data.filter(
          (u) =>
            (u.estado || "").toUpperCase() === "ACTIVO" ||
            u.estado === "" ||
            u.estado == null
        );

        const opciones: UsuarioOption[] = activos.map((u) => {
          const rol = (u.rol || "").toUpperCase();
          let tipo: TipoUsuario = "OTRO";

          if (rol === "ADMIN" || rol === "SUPERVISOR" || rol === "TRABAJADOR") {
            tipo = "TRABAJADOR";
          } else if (rol === "SOCIO") {
            tipo = "SOCIO";
          }

          return {
            idUsuario: u.id,
            nombreCompleto: u.nombre,
            email: u.email,
            rol,
            tipo,
          };
        });

        // Orden: TRABAJADOR -> SOCIO -> OTRO y luego por nombre
        opciones.sort((a, b) => {
          const peso = (t: TipoUsuario) =>
            t === "TRABAJADOR" ? 0 : t === "SOCIO" ? 1 : 2;

          const pa = peso(a.tipo);
          const pb = peso(b.tipo);

          if (pa !== pb) return pa - pb;
          return a.nombreCompleto.localeCompare(b.nombreCompleto);
        });

        setUsuarios(opciones);
      } catch (e) {
        console.error(e);
        showToast("No se pudieron cargar los usuarios activos", "error");
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando se selecciona usuario, limpiar credencial mostrada y cargar historial
  useEffect(() => {
    setCredencialGenerada(null);
    setHistorial([]);
    setResultadoValidacion(null);

    const fetchHistorial = async () => {
      if (!selectedUsuario) return;
      try {
        setLoadingHistorial(true);
        const data = await credencialesQrAdminApi.listarHistorialPorUsuario(
          selectedUsuario.idUsuario
        );
        setHistorial(data);
      } catch (error) {
        console.error(error);
        showToast("No se pudo cargar el historial de credenciales", "error");
      } finally {
        setLoadingHistorial(false);
      }
    };

    fetchHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsuario]);

  // Texto resumen de usuario
  const usuarioResumen = useMemo(() => {
    if (!selectedUsuario) {
      return "Selecciona un usuario para generar la credencial.";
    }
    return `${selectedUsuario.nombreCompleto} • ${selectedUsuario.email} • Rol: ${selectedUsuario.rol}`;
  }, [selectedUsuario]);

  // ===== GENERAR CREDENCIAL =====
  const handleGenerar = async () => {
    if (!selectedUsuario) {
      showToast("Selecciona un usuario primero", "warning");
      return;
    }

    try {
      setLoadingSubmit(true);
      const body = {
        idUsuario: selectedUsuario.idUsuario,
        fechaVencimiento: fechaVencimiento || undefined,
        tipoCredencial: tipoCredencial || undefined,
      };

      const cred = await credencialesQrAdminApi.crear(body);
      setCredencialGenerada(cred);
      showToast("Credencial generada correctamente", "success");

      // Refrescamos historial después de generar
      try {
        const data = await credencialesQrAdminApi.listarHistorialPorUsuario(
          selectedUsuario.idUsuario
        );
        setHistorial(data);
      } catch {
        // si falla, solo ignoramos
      }
    } catch (error: any) {
      console.error(error);
      showToast(
        error?.response?.data?.mensaje ||
          "No se pudo generar la credencial QR",
        "error"
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ===== IMPRIMIR / PDF SOLO CARNET =====
  const printCardOnly = () => {
    if (!cardRef.current) {
      showToast("No se encontró la credencial para imprimir", "error");
      return;
    }

    const cardHtml = cardRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=500,height=700");

    if (!printWindow) {
      showToast("No se pudo abrir la ventana de impresión", "error");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Credencial QR - Mercado Mayorista</title>
          <meta charset="utf-8" />
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background: #f3f4f6;
            }
            .card-wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <div>
              ${cardHtml}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // printWindow.close(); // opcional
  };

  const handleImprimir = () => {
    if (!credencialGenerada) {
      showToast("Genera primero una credencial", "warning");
      return;
    }
    printCardOnly();
  };

  const handleExportarPdf = () => {
    if (!credencialGenerada) {
      showToast("Genera primero una credencial", "warning");
      return;
    }
    showToast(
      "En el cuadro de impresión selecciona 'Guardar como PDF'.",
      "info"
    );
    printCardOnly();
  };

  // ===== VALIDAR CÓDIGO QR (vista móvil / seguridad) =====
  const handleValidarCodigo = async () => {
    if (!codigoValidar.trim()) {
      showToast("Ingresa un código QR para validar", "warning");
      return;
    }

    try {
      setLoadingValidacion(true);
      const result =
        await credencialesQrAdminApi.validarPorCodigo(codigoValidar.trim());
      setResultadoValidacion(result);
      showToast(result.mensaje, result.valida ? "success" : "error");
    } catch (error: any) {
      console.error(error);
      showToast(
        error?.response?.data?.mensaje ||
          "No se pudo validar el código QR",
        "error"
      );
    } finally {
      setLoadingValidacion(false);
    }
  };

  const tipoChipColor = (tipo: TipoUsuario) => {
    if (tipo === "TRABAJADOR") {
      return { bgcolor: "#dbeafe", color: "#1d4ed8" };
    }
    if (tipo === "SOCIO") {
      return { bgcolor: "#dcfce7", color: "#166534" };
    }
    return { bgcolor: "#e5e7eb", color: "#374151" };
  };

  const vigenteChipColor = (vigente?: boolean | null) => {
    if (vigente) {
      return { bgcolor: "#dcfce7", color: "#166534" };
    }
    return { bgcolor: "#fee2e2", color: "#b91c1c" };
  };

  return (
    <>
      {/* CABECERA AL ESTILO PANEL */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily:
              '"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont',
          }}
        >
          Credenciales QR
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 620 }}
        >
          Genera credenciales QR para socios y personal autorizado. Al crear
          una nueva credencial, la anterior se marca automáticamente como no
          vigente. También puedes validar códigos QR y revisar el historial.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        {/* Layout principal sin Grid, usando Box */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* IZQUIERDA: FORMULARIO */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Configuración de credencial
            </Typography>

            <Stack spacing={2.5}>
              {/* SELECCIÓN DE USUARIO */}
              <Autocomplete
                options={usuarios}
                loading={loadingUsuarios}
                value={selectedUsuario}
                onChange={(_, newValue) => setSelectedUsuario(newValue)}
                getOptionLabel={(opt) =>
                  `${opt.nombreCompleto} (${opt.rol || "SIN ROL"})`
                }
                filterOptions={(options, state) =>
                  options.filter((opt) =>
                    `${opt.nombreCompleto} ${opt.email} ${opt.rol}`
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  )
                }
                groupBy={(opt) =>
                  opt.tipo === "TRABAJADOR"
                    ? "Trabajadores"
                    : opt.tipo === "SOCIO"
                    ? "Socios"
                    : "Otros"
                }
                noOptionsText={
                  loadingUsuarios
                    ? "Cargando usuarios..."
                    : "No se encontraron usuarios"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Usuario"
                    placeholder="Busca por nombre, correo o rol..."
                    size="small"
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
              />

              {/* RESUMEN DEL USUARIO + CHIP TIPO */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#f9fafb",
                  border: "1px dashed #e5e7eb",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                    {usuarioResumen}
                  </Typography>
                  {selectedUsuario && (
                    <Chip
                      label={
                        selectedUsuario.tipo === "TRABAJADOR"
                          ? "Personal"
                          : selectedUsuario.tipo === "SOCIO"
                          ? "Socio"
                          : "Otro"
                      }
                      size="small"
                      sx={{
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        ...tipoChipColor(selectedUsuario.tipo),
                      }}
                    />
                  )}
                </Stack>
              </Box>

              {/* TIPO DE CREDENCIAL */}
              <TextField
                select
                fullWidth
                label="Tipo de credencial"
                size="small"
                value={tipoCredencial}
                onChange={(e) => setTipoCredencial(e.target.value)}
                helperText="Define el tipo de acceso asociado al QR."
              >
                <MenuItem value="SOCIO">SOCIO</MenuItem>
                <MenuItem value="TRABAJADOR">TRABAJADOR</MenuItem>
                <MenuItem value="SEGURIDAD">SEGURIDAD</MenuItem>
                <MenuItem value="VISITANTE">VISITANTE</MenuItem>
              </TextField>

              {/* FECHA DE VENCIMIENTO */}
              <TextField
                fullWidth
                label="Fecha de vencimiento"
                type="date"
                size="small"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              {/* BOTONES DE ACCIÓN */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={handleGenerar}
                  disabled={loadingSubmit || !selectedUsuario}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1.1,
                  }}
                >
                  {loadingSubmit ? "Generando..." : "Generar credencial QR"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleImprimir}
                  disabled={!credencialGenerada}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Imprimir credencial / QR
                </Button>

                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleExportarPdf}
                  disabled={!credencialGenerada}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Exportar como PDF
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* DERECHA: VISTA PREVIA + HISTORIAL */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Vista previa en formato carnet
            </Typography>

            {credencialGenerada ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  bgcolor: "#f9fafb",
                  mb: 2.5,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {/* 👇 SOLO ESTE BOX SE IMPRIME / EXPORTA */}
                <Box
                  ref={cardRef}
                  sx={{
                    width: 360,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header verde */}
                  <Box
                    sx={{
                      bgcolor: "#16a34a",
                      color: "#ecfdf5",
                      px: 2,
                      py: 1.2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 0.3,
                      }}
                    >
                      Mercado Mayorista de Santa Anita
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Credencial de acceso
                    </Typography>
                  </Box>

                  {/* Contenido carnet */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      p: 1.5,
                      gap: 1.5,
                    }}
                  >
                    {/* QR lado izquierdo */}
                    <Box
                      sx={{
                        flex: 0.95,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                      }}
                    >
                      <QRCode
                        value={credencialGenerada.codigoQr}
                        size={140}
                        style={{ display: "block" }}
                      />
                    </Box>

                    {/* Datos lado derecho */}
                    <Box
                      sx={{
                        flex: 1.3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.4,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {credencialGenerada.nombres}{" "}
                        {credencialGenerada.apellidos}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {credencialGenerada.email}
                      </Typography>

                      <Chip
                        label={credencialGenerada.tipoCredencial}
                        size="small"
                        sx={{
                          alignSelf: "flex-start",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: "#dcfce7",
                          color: "#166534",
                          mb: 0.5,
                        }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        Emisión:{" "}
                        <strong>{credencialGenerada.fechaEmision}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Vence:{" "}
                        <strong>
                          {credencialGenerada.fechaVencimiento || "—"}
                        </strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Código interno:{" "}
                        <strong>{credencialGenerada.codigoQr}</strong>
                      </Typography>

                      <Chip
                        label={
                          credencialGenerada.vigente
                            ? "Vigente"
                            : "No vigente"
                        }
                        size="small"
                        sx={{
                          mt: 0.8,
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: credencialGenerada.vigente
                            ? "#dbeafe"
                            : "#fee2e2",
                          color: credencialGenerada.vigente
                            ? "#1d4ed8"
                            : "#b91c1c",
                          alignSelf: "flex-start",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px dashed #e5e7eb",
                  textAlign: "center",
                  color: "text.secondary",
                  mb: 2.5,
                }}
              >
                <Typography variant="body2">
                  Aún no se ha generado ninguna credencial. Completa los datos
                  del usuario y haz clic en{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    “Generar credencial QR”
                  </Box>{" "}
                  para ver la vista previa en formato carnet.
                </Typography>
              </Box>
            )}

            {/* HISTORIAL DE CREDENCIALES */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Historial de credenciales
              </Typography>

              {loadingHistorial ? (
                <Box sx={{ py: 2, textAlign: "center" }}>
                  <CircularProgress size={20} />
                </Box>
              ) : historial.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No hay credenciales previas para este usuario.
                </Typography>
              ) : (
                <Stack spacing={1.2} sx={{ maxHeight: 210, overflowY: "auto" }}>
                  {historial.map((h) => (
                    <Box
                      key={h.idCredencial}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.3,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          ID #{h.idCredencial}
                        </Typography>
                        <Chip
                          label={h.vigente ? "Vigente" : "No vigente"}
                          size="small"
                          sx={{
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 600,
                            ...vigenteChipColor(h.vigente),
                          }}
                        />
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Tipo: <strong>{h.tipoCredencial}</strong> • Emisión:{" "}
                        <strong>{h.fechaEmision}</strong> • Vence:{" "}
                        <strong>{h.fechaVencimiento || "—"}</strong>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        Código: {h.codigoQr}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* SECCIÓN: VALIDACIÓN RÁPIDA DE CÓDIGO QR (pensada para móvil / seguridad) */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 4,
          border: "1px dashed #e5e7eb",
          bgcolor: "#f9fafb",
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700 }}
              >
                Validación rápida de QR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresa o escanea el código QR para validar si la credencial es
                válida, está vigente y pertenece a un usuario activo.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              fullWidth
              label="Código QR"
              size="small"
              value={codigoValidar}
              onChange={(e) => setCodigoValidar(e.target.value)}
              placeholder="Pega o escanea el código QR..."
            />
            <Button
              variant="contained"
              onClick={handleValidarCodigo}
              disabled={loadingValidacion || !codigoValidar.trim()}
              sx={{
                whiteSpace: "nowrap",
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
              }}
            >
              {loadingValidacion ? "Validando..." : "Validar QR"}
            </Button>
          </Stack>

          {resultadoValidacion && (
            <>
              <Divider />
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    label={
                      resultadoValidacion.valida
                        ? "Credencial válida"
                        : "No válida"
                    }
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: resultadoValidacion.valida
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: resultadoValidacion.valida
                        ? "#166534"
                        : "#b91c1c",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {resultadoValidacion.mensaje}
                  </Typography>
                </Stack>

                {resultadoValidacion.nombres && (
                  <Typography variant="body2">
                    Usuario:{" "}
                    <strong>
                      {resultadoValidacion.nombres}{" "}
                      {resultadoValidacion.apellidos}
                    </strong>{" "}
                    • Estado:{" "}
                    <strong>{resultadoValidacion.estadoUsuario}</strong>
                  </Typography>
                )}

                {resultadoValidacion.tipoCredencial && (
                  <Typography variant="body2" color="text.secondary">
                    Tipo de credencial:{" "}
                    <strong>{resultadoValidacion.tipoCredencial}</strong>
                  </Typography>
                )}

                {(resultadoValidacion.fechaEmision ||
                  resultadoValidacion.fechaVencimiento) && (
                  <Typography variant="body2" color="text.secondary">
                    Emisión:{" "}
                    <strong>
                      {resultadoValidacion.fechaEmision || "—"}
                    </strong>{" "}
                    • Vence:{" "}
                    <strong>
                      {resultadoValidacion.fechaVencimiento || "—"}
                    </strong>
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </>
  );
}