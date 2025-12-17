import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Alert,
  Box,
  Chip,
  Paper,
  MenuItem,
} from "@mui/material";

import type { SocioStandDto } from "../../../../api/socio/standsSocioApi";
import type { IncidenciaCreateRequest } from "../../../../api/socio/incidenciasSocioApi";

function nonEmpty(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : "";
}

export default function IncidenciaModal({
  open,
  onClose,
  stands,
  defaultStandId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  stands: SocioStandDto[];
  defaultStandId?: number | "";
  onSave: (payload: IncidenciaCreateRequest) => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tipoOptions = useMemo(() => ["LUZ","DESAGUE","LIMPIEZA","AGUA","ELECTRICIDAD","SEGURIDAD","RESIDUOS","INFRAESTRUCTURA","HIGIENE","RUIDO","VENTILACION","OTRO"], []);
  const prioridadOptions = useMemo(() => ["BAJA", "MEDIA", "ALTA", "CRITICA"], []);

  const [form, setForm] = useState<IncidenciaCreateRequest>({
    idStand: typeof defaultStandId === "number" ? defaultStandId : 0,
    titulo: "",
    descripcion: "",
    tipo: "MANTENIMIENTO",
    prioridad: "MEDIA",
    fotoUrl: "",
  });

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setBusy(false);

    const firstStand = stands?.[0]?.id ?? 0;
    setForm((p) => ({
      ...p,
      idStand: typeof defaultStandId === "number" ? defaultStandId : (p.idStand || firstStand),
      titulo: "",
      descripcion: "",
      tipo: p.tipo || "MANTENIMIENTO",
      prioridad: p.prioridad || "MEDIA",
      fotoUrl: "",
    }));
  }, [open, stands, defaultStandId]);

  const standActual = useMemo(
    () => stands.find((s) => Number(s.id) === Number(form.idStand)) ?? null,
    [stands, form.idStand]
  );

  const submit = async () => {
    setErr(null);

    if (!form.idStand || Number(form.idStand) <= 0) return setErr("Selecciona un stand.");
    const titulo = nonEmpty(form.titulo);
    if (!titulo) return setErr("El título es obligatorio.");
    const descripcion = nonEmpty(form.descripcion);
    if (!descripcion) return setErr("La descripción es obligatoria.");

    try {
      setBusy(true);

      const payload: IncidenciaCreateRequest = {
        idStand: Number(form.idStand),
        titulo,
        descripcion,
        tipo: nonEmpty(form.tipo) || "OTRO",
        prioridad: nonEmpty(form.prioridad) || "MEDIA",
        fotoUrl: nonEmpty(form.fotoUrl) || undefined,
      };

      await onSave(payload);
    } catch (e) {
      console.error(e);
      setErr("No se pudo registrar la incidencia.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: { xs: "92vh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>Nueva incidencia</Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Reporta un problema para que administración lo gestione.
            </Typography>
          </Box>

          {standActual && (
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              <Chip
                label={standActual.nombreComercial ?? `Stand ${standActual.numeroStand ?? standActual.id}`}
                sx={{ fontWeight: 900, bgcolor: "#f1f5f9" }}
              />
              <Chip
                label={`Bloque ${standActual.bloque ?? "—"} · Puesto ${standActual.numeroStand ?? "—"}`}
                sx={{ fontWeight: 900, bgcolor: "#f8fafc" }}
              />
            </Stack>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, overflow: "auto", py: 2 }}>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* Form */}
          <Box>
            <Stack spacing={1.6}>
              <TextField
                select
                label="Stand"
                value={form.idStand || ""}
                onChange={(e) => setForm((p) => ({ ...p, idStand: Number(e.target.value) }))}
                disabled={busy}
                fullWidth
              >
                {stands.length === 0 ? (
                  <MenuItem value="">Sin stands</MenuItem>
                ) : (
                  stands.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nombreComercial ?? `Stand ${s.numeroStand ?? s.id}`} · {s.bloque ?? "—"}-{s.numeroStand ?? "—"}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <TextField
                label="Título"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                disabled={busy}
                fullWidth
              />

              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                disabled={busy}
                fullWidth
                multiline
                minRows={5}
              />

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                <TextField
                  select
                  label="Tipo"
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                  disabled={busy}
                  fullWidth
                >
                  {tipoOptions.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Prioridad"
                  value={form.prioridad}
                  onChange={(e) => setForm((p) => ({ ...p, prioridad: e.target.value }))}
                  disabled={busy}
                  fullWidth
                >
                  {prioridadOptions.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                label="Foto URL (opcional)"
                value={form.fotoUrl ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, fotoUrl: e.target.value }))}
                disabled={busy}
                fullWidth
              />
            </Stack>
          </Box>

          {/* Preview / resumen */}
          <Box sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
            <Paper variant="outlined" sx={{ borderColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <Box sx={{ p: 1.5, borderBottom: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontWeight: 900 }}>Resumen</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Lo que se enviará al sistema.
                </Typography>
              </Box>

              <Box sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>Stand</Typography>
                    <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                      {standActual?.nombreComercial ?? (form.idStand ? `Stand ${form.idStand}` : "—")}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip size="small" label={`Tipo: ${form.tipo || "—"}`} sx={{ fontWeight: 900, bgcolor: "#f1f5f9" }} />
                    <Chip size="small" label={`Prioridad: ${form.prioridad || "—"}`} sx={{ fontWeight: 900, bgcolor: "#fffbeb", color: "#b45309" }} />
                  </Box>

                  {form.fotoUrl?.trim() ? (
                    <Box
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        overflow: "hidden",
                        height: { xs: 160, md: 220 },
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <img
                        src={String(form.fotoUrl)}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        border: "1px dashed #e5e7eb",
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                        height: { xs: 160, md: 220 },
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                        px: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                        (Opcional) agrega una URL de imagen
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          bgcolor: "#fff",
          position: "sticky",
          bottom: 0,
          zIndex: 2,
        }}
      >
        <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none", fontWeight: 900 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={busy}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            bgcolor: "#b45309",
            "&:hover": { bgcolor: "#92400e" },
            minWidth: 160,
          }}
        >
          {busy ? "Registrando..." : "Registrar incidencia"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}