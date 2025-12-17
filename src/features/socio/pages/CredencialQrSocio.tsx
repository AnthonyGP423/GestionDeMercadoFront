import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import QRCode from "react-qr-code";
import { credencialQrSocioApi, type CredencialQrDto } from "../../../api/socio/credencialQrSocioApi";

const cardBorder = "1px solid #e5e7eb";
const amber = "#b45309";
const green = "#166534";
const greenSoft = "#ecfdf5";
const red = "#b91c1c";
const redSoft = "#fef2f2";

function pickCodigoQr(c: CredencialQrDto | null) {
  if (!c) return "";
  return String(c.codigoQr ?? c.codigo ?? "").trim();
}

export default function CredencialQrSocioPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cred, setCred] = useState<CredencialQrDto | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const codigo = useMemo(() => pickCodigoQr(cred), [cred]);
  const vigente = useMemo(() => Boolean(cred?.vigente), [cred]);

  const vigenteChip = useMemo(() => {
    return vigente
      ? { label: "VIGENTE", bg: greenSoft, color: green, icon: <CheckCircleOutlineIcon /> }
      : { label: "NO VIGENTE", bg: redSoft, color: red, icon: <ErrorOutlineIcon /> };
  }, [vigente]);

  const nombreCompleto = useMemo(() => {
    const n = `${cred?.nombres ?? ""} ${cred?.apellidos ?? ""}`.trim();
    return n || "(Sin nombre)";
  }, [cred]);

  const cargar = async () => {
    try {
      setError(null);
      setBusy(true);
      const res = await credencialQrSocioApi.obtener();
      setCred(res.data ?? null);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar tu credencial. Verifica tu sesión o el servidor.");
      setCred(null);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printCardOnly = () => {
    if (!cardRef.current) return;

    const cardHtml = cardRef.current.innerHTML;
    const w = window.open("", "_blank", "width=520,height=760");
    if (!w) return;

    w.document.open();
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mi Credencial QR - Mercado</title>
          <meta charset="utf-8" />
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background: #f3f4f6;
            }
            .wrap {
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div>${cardHtml}</div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 4, border: cardBorder }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <CircularProgress size={18} />
          <Typography sx={{ fontWeight: 800 }}>Cargando credencial...</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Stack spacing={0.4} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
          Mi Credencial QR
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 900 }}>
          Visualiza tu fotocheck, verifica si está vigente y descárgalo para imprimir o guardar como PDF.
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Top actions */}
      <Paper sx={{ p: 2, borderRadius: 3, border: cardBorder, mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<QrCode2OutlinedIcon />}
            label={cred?.tipoCredencial ? `Tipo: ${cred.tipoCredencial}` : "Tipo: —"}
            sx={{ fontWeight: 900, bgcolor: "#f1f5f9" }}
          />

          <Chip
            icon={vigenteChip.icon}
            label={vigenteChip.label}
            sx={{
              fontWeight: 900,
              bgcolor: vigenteChip.bg,
              color: vigenteChip.color,
            }}
          />

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Recargar">
            <span>
              <IconButton onClick={cargar} disabled={busy}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="outlined"
            onClick={printCardOnly}
            disabled={!codigo || busy || !cred}
            startIcon={<PrintOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 999,
              borderColor: "#f59e0b55",
              color: amber,
              "&:hover": { borderColor: "#f59e0b" },
            }}
          >
            Imprimir fotocheck
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              // UX: guía al usuario, misma técnica que admin
              printCardOnly();
            }}
            disabled={!codigo || busy || !cred}
            startIcon={<PictureAsPdfOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 999,
              bgcolor: amber,
              "&:hover": { bgcolor: "#92400e" },
            }}
          >
            Guardar como PDF
          </Button>
        </Stack>

        <Typography variant="caption" sx={{ color: "#64748b", mt: 1, display: "block" }}>
          Tip: al abrir impresión elige “Guardar como PDF” si quieres exportarlo.
        </Typography>
      </Paper>

      {/* Main layout */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* Preview / fotocheck */}
        <Paper
          sx={{
            flex: "1 1 420px",
            minWidth: 320,
            p: 2.5,
            borderRadius: 3,
            border: cardBorder,
          }}
        >
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Vista previa</Typography>

          {!cred || !codigo ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px dashed #e5e7eb",
                bgcolor: "#f8fafc",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>Aún no tienes credencial</Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                No se encontró una credencial asociada a tu usuario, o el código QR no está disponible.
                Si esperabas verla, revisa con administración.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {/* 👇 SOLO ESTO SE IMPRIME */}
              <Box
                ref={cardRef}
                sx={{
                  width: 380,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <Box sx={{ bgcolor: amber, color: "#fffbeb", px: 2, py: 1.2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
                    Mercado Mayorista
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Fotocheck de Socio
                  </Typography>
                </Box>

                {/* Body */}
                <Box sx={{ display: "flex", gap: 1.5, p: 1.75 }}>
                  {/* QR */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      p: 1.25,
                    }}
                  >
                    <QRCode value={codigo} size={150} style={{ display: "block" }} />
                  </Box>

                  {/* Data */}
                  <Box sx={{ flex: 1.2, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }} noWrap>
                      {nombreCompleto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                      {cred.email ?? "—"}
                    </Typography>

                    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={cred.tipoCredencial ?? "SOCIO"}
                        sx={{ fontWeight: 900, bgcolor: "#f1f5f9", borderRadius: 999 }}
                      />
                      <Chip
                        size="small"
                        label={vigente ? "Vigente" : "No vigente"}
                        sx={{
                          fontWeight: 900,
                          bgcolor: vigente ? greenSoft : redSoft,
                          color: vigente ? green : red,
                          borderRadius: 999,
                        }}
                      />
                    </Stack>

                    <Divider sx={{ my: 1.2 }} />

                    <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                      Emisión: <strong>{cred.fechaEmision ?? "—"}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                      Vence: <strong>{cred.fechaVencimiento ?? "—"}</strong>
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        mt: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      Código: {codigo}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Status + tips */}
        <Paper
          sx={{
            flex: "1 1 320px",
            minWidth: 280,
            p: 2.5,
            borderRadius: 3,
            border: cardBorder,
            bgcolor: "#fff",
          }}
        >
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Estado & detalles</Typography>

          {!cred ? (
            <Alert severity="warning">
              No hay datos de credencial disponibles para mostrar.
            </Alert>
          ) : (
            <Stack spacing={1}>
              <Chip
                label={vigente ? "Tu credencial está vigente" : "Tu credencial NO está vigente"}
                sx={{
                  fontWeight: 900,
                  bgcolor: vigente ? greenSoft : redSoft,
                  color: vigente ? green : red,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              />

              <Typography variant="body2" sx={{ color: "#334155" }}>
                <strong>Usuario:</strong> {nombreCompleto}
              </Typography>
              <Typography variant="body2" sx={{ color: "#334155" }}>
                <strong>Email:</strong> {cred.email ?? "—"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#334155" }}>
                <strong>ID credencial:</strong> {cred.idCredencial ?? "—"}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Si tu credencial aparece como <strong>No vigente</strong>, solicita a administración que genere una nueva.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}