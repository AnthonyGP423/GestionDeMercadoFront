import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Divider,
  Skeleton,
  Alert,
  Switch,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import { standsSocioApi, SocioStandDto } from "../../../api/socio/standsSocioApi";
import {
  productosSocioApi,
  type ProductoRequestDto,
  type ProductoResponseDto,
} from "../../../api/socio/productosSocioApi";
import ProductoModal from "../components/modals/ProductoModal";

const cardBorder = "1px solid #e5e7eb";
const amber = "#b45309";
const amberSoft = "#fffbeb";
const green = "#166534";
const greenSoft = "#ecfdf5";
const red = "#b91c1c";
const redSoft = "#fef2f2";

type AnyObj = Record<string, any>;

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

// ✅ Normalización alineada al DTO real del backend
function mapProducto(p: AnyObj) {
  const id = Number(p.idProducto ?? 0);

  const nombre = String(p.nombre ?? "Producto");
  const descripcion = String(p.descripcion ?? "");
  const categoria = String(p.nombreCategoriaProducto ?? "");
  const unidadMedida = String(p.unidadMedida ?? "");
  const imagenUrl = String(p.imagenUrl ?? "");

  const visible = Boolean(p.visibleDirectorio);

  const precioActual = Number(p.precioActual ?? 0);
  const enOferta = Boolean(p.enOferta);
  const precioOferta = Number(p.precioOferta ?? 0);

  return {
    raw: p,
    id,
    nombre,
    descripcion,
    categoria,
    unidadMedida,
    imagenUrl,
    visible,
    precioActual,
    enOferta,
    precioOferta,
  };
}

function money(v: number) {
  return `S/ ${Number(v ?? 0).toFixed(2)}`;
}

export default function ProductosSocioPage() {
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stands, setStands] = useState<SocioStandDto[]>([]);
  const [standId, setStandId] = useState<number | "">("");
  const [productos, setProductos] = useState<AnyObj[]>([]);

  const [q, setQ] = useState("");
  const [soloVisibles, setSoloVisibles] = useState<"" | "VISIBLES" | "OCULTOS">("");

  // modal crear/editar
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<ProductoResponseDto | null>(null);

  // busy por producto (toggle/eliminar)
  const [busyId, setBusyId] = useState<number | null>(null);

  const cargarStands = async () => {
    const res = await standsSocioApi.misStands();
    const arr = toArray<SocioStandDto>(res.data);
    setStands(arr);

    if (arr.length > 0 && standId === "") setStandId(arr[0].id);
  };

  const cargarProductos = async (idStand: number) => {
    setLoadingProducts(true);
    try {
      const res = await productosSocioApi.listarPorStand(idStand);
      const arr = toArray(res.data);
      setProductos(arr);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        await cargarStands();
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar tu panel de productos. Verifica tu sesión o el servidor.");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof standId === "number") {
      cargarProductos(standId).catch((e) => {
        console.error(e);
        setError("No se pudieron cargar los productos del stand seleccionado.");
      });
    }
  }, [standId]);

  const standActual = useMemo(
    () => stands.find((s) => s.id === standId) ?? null,
    [stands, standId]
  );

  const standBloqueado = useMemo(() => {
    const est = String(standActual?.estado ?? "").toUpperCase().trim();
    // ✅ Ajusta si tu backend usa otra palabra
    return est === "CLAUSURADO" || est === "CERRADO";
  }, [standActual]);

  const productosUI = useMemo(() => {
    const norm = (s: string) => s.toUpperCase().trim();
    const query = norm(q);

    let arr = productos.map(mapProducto);

    if (soloVisibles === "VISIBLES") arr = arr.filter((p) => p.visible);
    if (soloVisibles === "OCULTOS") arr = arr.filter((p) => !p.visible);

    if (query) {
      arr = arr.filter((p) => {
        const blob = `${p.nombre} ${p.descripcion} ${p.categoria} ${p.unidadMedida}`.toUpperCase();
        return blob.includes(query);
      });
    }

    arr.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return arr;
  }, [productos, q, soloVisibles]);

  const kpis = useMemo(() => {
    const mapped = productos.map(mapProducto);
    const total = mapped.length;
    const visibles = mapped.filter((p) => p.visible).length;
    const ocultos = total - visibles;

    // ✅ KPI más útil: saldo “potencial” usando precio actual (no suma cualquier cosa)
    const sumaPrecios = mapped.reduce((acc, p) => acc + Number(p.precioActual ?? 0), 0);
    const ofertas = mapped.filter((p) => p.enOferta).length;

    return { total, visibles, ocultos, sumaPrecios, ofertas };
  }, [productos]);

  const abrirCrear = () => {
    if (standBloqueado) return; // ✅ no abrir si está bloqueado
    setEditing(null);
    setOpenModal(true);
  };

  const abrirEditar = (raw: AnyObj) => {
    // ✅ si está bloqueado, permitimos abrir modal SOLO para visualizar
    setEditing(raw as ProductoResponseDto);
    setOpenModal(true);
  };

  const onSave = async (draft: ProductoRequestDto) => {
    if (typeof standId !== "number") return;
    if (standBloqueado) return; // ✅ seguridad extra

    try {
      setError(null);

      // ✅ Payload real (ProductoRequestDto), sin inventar campos
      const payload: ProductoRequestDto = {
        idCategoriaProducto: draft.idCategoriaProducto,
        nombre: draft.nombre,
        descripcion: draft.descripcion,
        unidadMedida: draft.unidadMedida,
        imagenUrl: draft.imagenUrl,
        precioActual: draft.precioActual,
        enOferta: draft.enOferta,
        precioOferta: draft.enOferta ? draft.precioOferta : undefined,
        visibleDirectorio: draft.visibleDirectorio,
      };

      Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

      if (editing) {
        const id = Number(editing.idProducto);
        await productosSocioApi.actualizar(id, payload);
      } else {
        await productosSocioApi.crearEnStand(standId, payload);
      }

      setOpenModal(false);
      setEditing(null);

      await cargarProductos(standId);
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el producto. Revisa los campos y vuelve a intentar.");
    }
  };

  const onDelete = async (raw: AnyObj) => {
    if (standBloqueado) return; // ✅ seguridad extra

    const id = Number(raw.idProducto ?? 0);
    if (!id || typeof standId !== "number") return;

    try {
      setBusyId(id);
      setError(null);

      await productosSocioApi.eliminar(id);
      await cargarProductos(standId);
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar el producto.");
    } finally {
      setBusyId(null);
    }
  };

  const onToggleVisible = async (raw: AnyObj) => {
    if (standBloqueado) return; // ✅ seguridad extra

    const id = Number(raw.idProducto ?? 0);
    if (!id || typeof standId !== "number") return;

    const current = Boolean(raw.visibleDirectorio);
    const next = !current;

    try {
      setBusyId(id);
      setError(null);

      await productosSocioApi.cambiarVisibilidad(id, next);

      // ✅ update optimista correcto con tu DTO
      setProductos((prev) =>
        prev.map((p) => {
          const pid = Number(p.idProducto ?? 0);
          if (pid !== id) return p;
          return { ...p, visibleDirectorio: next };
        })
      );
    } catch (e) {
      console.error(e);
      setError("No se pudo cambiar la visibilidad.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <Stack spacing={1.25}>
        <Skeleton height={90} />
        <Skeleton height={140} />
        <Skeleton height={140} />
      </Stack>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Stack spacing={0.4} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
          Productos
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 900 }}>
          Gestiona tu catálogo por stand. Puedes crear, editar, ocultar o eliminar productos.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {standBloqueado && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Este stand está <strong>{String(standActual?.estado ?? "").toUpperCase()}</strong>. Solo puedes visualizar.
        </Alert>
      )}

      {/* Barra superior: selector + acciones */}
      <Paper sx={{ p: 2, borderRadius: 3, border: cardBorder, mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            label="Stand"
            value={standId}
            onChange={(e) => setStandId(e.target.value === "" ? "" : Number(e.target.value))}
            sx={{ minWidth: 260 }}
          >
            {stands.length === 0 ? (
              <MenuItem value="">Sin stands</MenuItem>
            ) : (
              stands.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.nombreComercial ?? `Stand ${s.numeroStand ?? s.id}`} · {s.bloque ?? "—"}-
                  {s.numeroStand ?? "—"}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            size="small"
            label="Buscar producto"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ width: { xs: "100%", sm: 320 } }}
          />

          <TextField
            select
            size="small"
            label="Visibilidad"
            value={soloVisibles}
            onChange={(e) => setSoloVisibles(e.target.value as any)}
            sx={{ width: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="VISIBLES">Visibles</MenuItem>
            <MenuItem value="OCULTOS">Ocultos</MenuItem>
          </TextField>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Recargar">
            <span>
              <IconButton
                onClick={() => typeof standId === "number" && cargarProductos(standId)}
                disabled={loadingProducts || typeof standId !== "number"}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            onClick={abrirCrear}
            disabled={standBloqueado || typeof standId !== "number" || loadingProducts}
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 3,
              bgcolor: amber,
              "&:hover": { bgcolor: "#92400e" },
            }}
          >
            Nuevo producto
          </Button>
        </Stack>

        {/* “context header” del stand */}
        {standActual && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }} flexWrap="wrap">
            <Chip
              icon={<Inventory2OutlinedIcon />}
              label={standActual.nombreComercial ?? `Stand ${standActual.numeroStand ?? standActual.id}`}
              sx={{ fontWeight: 900, bgcolor: "#f1f5f9" }}
            />
            <Chip
              label={`Bloque ${standActual.bloque ?? "—"} · Puesto ${standActual.numeroStand ?? "—"}`}
              sx={{ fontWeight: 900, bgcolor: "#f8fafc" }}
            />
            <Chip
              label={String(standActual.estado ?? "—").toUpperCase()}
              sx={{ fontWeight: 900, bgcolor: amberSoft, color: amber }}
            />
          </Stack>
        )}
      </Paper>

      {/* KPIs */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {[
          { label: "Total", value: kpis.total, bg: "#fff", color: "#0f172a" },
          { label: "Visibles", value: kpis.visibles, bg: greenSoft, color: green },
          { label: "Ocultos", value: kpis.ocultos, bg: amberSoft, color: amber },
          { label: "En oferta", value: kpis.ofertas, bg: redSoft, color: red },
          //{ label: "Suma precios", value: money(kpis.sumaPrecios), bg: "#fff7ed", color: "#9a3412" },
        ].map((k) => (
          <Paper
            key={k.label}
            sx={{
              flex: "1 1 220px",
              minWidth: 220,
              p: 2,
              borderRadius: 3,
              border: cardBorder,
              bgcolor: k.bg,
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
              {k.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: k.color, mt: 0.5 }}>
              {k.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {loadingProducts ? (
        <Stack spacing={1.25}>
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </Stack>
      ) : productosUI.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3, border: cardBorder }}>
          <Typography sx={{ fontWeight: 900 }}>Sin productos</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Crea tu primer producto para que aparezca en el directorio público.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {productosUI.map((p) => (
            <Paper
              key={p.id}
              sx={{
                p: 2,
                borderRadius: 3,
                border: cardBorder,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                transition: "all .18s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
                  borderColor: "#f59e0b55",
                },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.25,
                      bgcolor: p.visible ? greenSoft : "#f1f5f9",
                      color: p.visible ? green : "#475569",
                      display: "grid",
                      placeItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    {p.visible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography sx={{ fontWeight: 900 }} noWrap>
                        {p.nombre}
                      </Typography>

                      {p.enOferta && (
                        <Chip
                          size="small"
                          icon={<LocalOfferOutlinedIcon />}
                          label="OFERTA"
                          sx={{ fontWeight: 900, bgcolor: redSoft, color: red, borderRadius: 999 }}
                        />
                      )}
                    </Stack>

                    <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                      {p.categoria ? `Categoría: ${p.categoria} · ` : ""}
                      {p.unidadMedida ? `Unidad: ${p.unidadMedida} · ` : ""}
                      {p.enOferta
                        ? `Oferta: ${money(p.precioOferta)} · Regular: ${money(p.precioActual)}`
                        : `Precio: ${money(p.precioActual)}`}
                    </Typography>
                  </Box>
                </Stack>

                {p.descripcion && (
                  <>
                    <Divider sx={{ my: 1.1 }} />
                    <Typography variant="body2" sx={{ color: "#334155" }}>
                      {p.descripcion}
                    </Typography>
                  </>
                )}
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title={p.visible ? "Visible en el directorio" : "Oculto en el directorio"}>
                    <Chip
                      size="small"
                      label={p.visible ? "VISIBLE" : "OCULTO"}
                      sx={{
                        fontWeight: 900,
                        bgcolor: p.visible ? greenSoft : amberSoft,
                        color: p.visible ? green : amber,
                        borderRadius: 999,
                      }}
                    />
                  </Tooltip>

                  <Tooltip title={standBloqueado ? "Stand clausurado/cerrado" : "Cambiar visibilidad"}>
                    <span>
                      <Switch
                        checked={p.visible}
                        onChange={() => onToggleVisible(p.raw)}
                        disabled={standBloqueado || busyId === p.id}
                        size="small"
                      />
                    </span>
                  </Tooltip>
                </Stack>

                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => abrirEditar(p.raw)}
                  disabled={busyId === p.id}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: 999,
                    borderColor: "#f59e0b55",
                    color: amber,
                    "&:hover": { borderColor: "#f59e0b" },
                  }}
                >
                  Editar
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => onDelete(p.raw)}
                  disabled={standBloqueado || busyId === p.id}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: 999,
                    borderColor: "#fecaca",
                    color: red,
                    "&:hover": { borderColor: "#ef4444" },
                  }}
                >
                  Eliminar
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Modal Crear/Editar */}
      <ProductoModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        initial={editing}
        onSave={onSave}
        readOnly={standBloqueado}
      />
    </Box>
  );
}