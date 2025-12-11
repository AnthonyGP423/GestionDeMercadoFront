import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DeleteIcon from "@mui/icons-material/Delete";
import RoomIcon from "@mui/icons-material/Room";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import standsAdminApi, {
  StandBackend,
  EstadoStand,
  StandRequestDto,
} from "../../api/standsAdminApi";
import propietariosApi, {
  PropietarioDetalle,
  PropietarioOption, // para el combo del modal
} from "../../api/propietariosApi";
import { useToast } from "../../components/ui/Toast";

import StandModal from "./components/modals/StandModal";
import CambiarEstadoStandModal from "../Dashboard/components/modals/CambiarEstadosStandModal";

// productos del stand
import productosAdminApi, {
  ProductoRow,
} from "../../api/productosAdminApi";

export default function StandDetalle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [stand, setStand] = useState<StandBackend | null>(null);
  const [propietario, setPropietario] = useState<PropietarioDetalle | null>(
    null
  );
  const [propietarios, setPropietarios] = useState<PropietarioOption[]>([]);
  const [loading, setLoading] = useState(false);

  // productos de este stand
  const [productos, setProductos] = useState<ProductoRow[]>([]);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openEstadoModal, setOpenEstadoModal] = useState(false);

  // === CARGA DE DATOS ===
  const fetchStand = async () => {
    if (!id) return;
    try {
      setLoading(true);

      // 1) Detalle del stand
      const data = await standsAdminApi.obtener(Number(id));
      setStand(data);

      // 2) Propietarios para el combo
      const listaProps = await propietariosApi.listar();
      setPropietarios(listaProps);

      // 3) Detalle de propietario (si existe)
      if (data.idPropietario) {
        const socio = await propietariosApi.obtener(data.idPropietario);
        setPropietario(socio);
      } else {
        setPropietario(null);
      }

      // 4) Productos de este stand
      const listaProductos = await productosAdminApi.listarPorStand(data.id);
      setProductos(listaProductos);
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo cargar el stand", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = () => navigate(-1);

  // === MAPEO PARA MODAL EDIT ===
  const mapBackendToModal = (s: StandBackend | null) =>
    !s
      ? undefined
      : {
          id_propietario:
            s.idPropietario != null ? String(s.idPropietario) : "",
          id_categoria_stand:
            s.idCategoriaStand != null ? String(s.idCategoriaStand) : "",
          bloque: s.bloque ?? "",
          numero_stand: s.numeroStand ?? "",
          nombre_comercial: s.nombreComercial ?? "",
          descripcion_negocio: s.descripcionNegocio ?? "",
          latitud: s.latitud != null ? String(s.latitud) : "",
          longitud: s.longitud != null ? String(s.longitud) : "",
          estado: "Activo",
        };

  const mapModalToRequest = (data: any): StandRequestDto => ({
    idPropietario: data.id_propietario
      ? Number(data.id_propietario)
      : null,
    idCategoriaStand: data.id_categoria_stand
      ? Number(data.id_categoria_stand)
      : null,
    bloque: data.bloque,
    numeroStand: data.numero_stand,
    nombreComercial: data.nombre_comercial,
    descripcionNegocio: data.descripcion_negocio,
    latitud: data.latitud !== "" ? Number(data.latitud) : null,
    longitud: data.longitud !== "" ? Number(data.longitud) : null,
  });

  const handleSaveEdit = async (formData: any) => {
    if (!stand) return;
    const payload = mapModalToRequest(formData);

    try {
      const actualizado = await standsAdminApi.actualizar(
        stand.id,
        payload
      );
      const nuevo = await standsAdminApi.obtener(actualizado.id);
      setStand(nuevo);

      // Si cambiaste de propietario, recargamos su detalle
      if (nuevo.idPropietario) {
        const socio = await propietariosApi.obtener(nuevo.idPropietario);
        setPropietario(socio);
      } else {
        setPropietario(null);
      }

      // recargar productos por si hay cambios futuros
      const listaProductos = await productosAdminApi.listarPorStand(
        nuevo.id
      );
      setProductos(listaProductos);

      showToast("Stand actualizado", "success");
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo actualizar el stand", "error");
    } finally {
      setOpenEditModal(false);
    }
  };

  // === CAMBIAR ESTADO DESDE MODAL ===
  const handleCambiarEstadoModal = async (estado: EstadoStand) => {
    if (!stand) return;

    try {
      await standsAdminApi.cambiarEstado(stand.id, estado);
      await fetchStand();
      showToast(`Estado del stand actualizado a ${estado}`, "success");
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo cambiar el estado", "error");
    } finally {
      setOpenEstadoModal(false);
    }
  };

  // === ELIMINAR ===
  const handleDelete = async () => {
    if (!stand) return;
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el stand ${stand.bloque}-${stand.numeroStand}?`
    );
    if (!ok) return;

    try {
      await standsAdminApi.eliminar(stand.id);
      showToast("Stand eliminado", "success");
      navigate(-1);
    } catch (e: any) {
      console.error(e);
      showToast("No se pudo eliminar el stand", "error");
    }
  };

  // === ESTADOS VISUALES ===
  if (!stand && loading) {
    return (
      <Box
        sx={{
          bgcolor: "#f3f4f6",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography color="text.secondary">
            Cargando información del stand…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!stand && !loading) {
    return (
      <Box
        sx={{
          bgcolor: "#f3f4f6",
          minHeight: "100vh",
          py: 3,
          px: { xs: 2, md: 4 },
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            mb: 2,
            textTransform: "none",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Volver a la tabla
        </Button>
        <Paper
          sx={{
            borderRadius: 4,
            p: 3,
            boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
          }}
          elevation={0}
        >
          <Typography fontWeight={600}>
            No se encontró la información del stand.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!stand) return null;

  const chipColor =
    stand.estado === "ABIERTO"
      ? { bg: "#bbf7d0", text: "#166534" }
      : stand.estado === "CERRADO"
      ? { bg: "#fee2e2", text: "#b91c1c" }
      : { bg: "#fef3c7", text: "#92400e" };

  const dotColor =
    stand.estado === "ABIERTO"
      ? "#22c55e"
      : stand.estado === "CERRADO"
      ? "#ef4444"
      : "#f59e0b";

  return (
    <Box
      sx={{
        bgcolor: "#f3f4f6",
        minHeight: "100vh",
        py: 3,
        px: { xs: 2, md: 4 },
      }}
    >
      {/* VOLVER */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          mb: 2,
          textTransform: "none",
          color: "text.secondary",
          fontWeight: 500,
        }}
      >
        Volver a la tabla
      </Button>

      {/* CARD PRINCIPAL */}
      <Paper
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
          border: "1px solid #e5e7eb",
          bgcolor: "#ffffff",
        }}
        elevation={0}
      >
        {/* HEADER DENTRO DEL CARD */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          {/* Título + estado tipo “dot” */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                letterSpacing: "-0.03em",
                fontFamily:
                  `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
              }}
            >
              Stand {stand.bloque}-{stand.numeroStand} ·{" "}
              {stand.nombreComercial}
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: chipColor.bg,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: dotColor,
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: chipColor.text }}
              >
                {stand.estado}
              </Typography>
            </Box>
          </Box>

          {/* ACCIONES */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: { xs: 1, md: 0 } }}
          >
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditModal(true)}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#22c55e",
                boxShadow: "0 6px 14px rgba(34, 197, 94, 0.25)",
                "&:hover": {
                  backgroundColor: "#16a34a",
                  boxShadow: "0 8px 18px rgba(22, 163, 74, 0.35)",
                },
              }}
            >
              Editar stand
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={() => setOpenEstadoModal(true)}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cambiar estado
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Eliminar
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 6,
          }}
        >
          {/* IZQUIERDA: Detalles + PRODUCTOS */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* Detalles del stand */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#6b7280",
                  }}
                >
                  DETALLES DEL STAND
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  Bloque y número
                </Typography>
                <Typography
                  sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                >
                  Bloque {stand.bloque}, número {stand.numeroStand}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  Categoría
                </Typography>
                <Typography
                  sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                >
                  {stand.nombreCategoriaStand}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "gray", fontSize: "0.9rem" }}>
                  Descripción del negocio
                </Typography>
                <Typography
                  sx={{ whiteSpace: "pre-wrap", mt: 1, lineHeight: 1.6 }}
                >
                  {stand.descripcionNegocio || "Sin descripción registrada."}
                </Typography>
              </Box>
            </Stack>

            {/* PRODUCTOS EN ESTE STAND */}
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#6b7280",
                }}
              >
                PRODUCTOS EN ESTE STAND
              </Typography>

              {productos.length === 0 ? (
                <Typography sx={{ color: "gray", mt: 1.5 }}>
                  Este stand aún no tiene productos registrados.
                </Typography>
              ) : (
                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr",
                    },
                    gap: 3,
                  }}
                >
                  {productos.map((p) => (
                    <Paper
                      key={p.idProducto}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        boxShadow: "0px 6px 14px rgba(15,23,42,0.06)",
                        border: "1px solid #e5e7eb",
                        transition: "0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0px 10px 20px rgba(15,23,42,0.08)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 120,
                          mb: 1.5,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid #eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#fafafa",
                        }}
                      >
                        <img
                          src="https://static.vecteezy.com/system/resources/thumbnails/021/931/379/small/empty-box-icon-3d-empty-cardboard-box-sign-illustration-png.png"
                          alt={p.nombre}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>

                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        {p.nombre}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: "gray" }}
                      >
                        {p.categoria} · {p.unidad}
                      </Typography>

                      <Box sx={{ mt: 1.5 }}>
                        {p.tieneOferta ? (
                          <>
                            <Typography
                              sx={{
                                fontWeight: "bold",
                                color: "#d32f2f",
                                fontSize: "1.05rem",
                              }}
                            >
                              {p.precioOfertaTexto}
                            </Typography>
                            <Typography
                              sx={{
                                textDecoration: "line-through",
                                color: "gray",
                                fontSize: "0.9rem",
                              }}
                            >
                              {p.precioNormalTexto}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontWeight: "bold" }}>
                            {p.precioNormalTexto}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* DERECHA: Propietario y ubicación */}
          <Box sx={{ flex: 1, maxWidth: { md: 420 } }}>
            <Stack spacing={3}>
              {/* PROPIETARIO */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#6b7280",
                  }}
                >
                  INFORMACIÓN DEL PROPIETARIO
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 1.5,
                    p: 2,
                    bgcolor: "#f9fafb",
                    borderRadius: 3,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                    >
                      {propietario?.nombreCompleto ||
                        stand.nombrePropietario}
                    </Typography>

                    {propietario && (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Email: {propietario.email}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Teléfono: {propietario.telefono}
                        </Typography>
                        {propietario.ruc && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            RUC: {propietario.ruc}
                          </Typography>
                        )}
                        {propietario.razonSocial && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Razón social: {propietario.razonSocial}
                          </Typography>
                        )}
                      </>
                    )}

                    <Button
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        mt: 1,
                        p: 0,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                      color="success"
                    >
                      Ver perfil de socio
                    </Button>
                  </Stack>
                </Paper>
              </Box>

              {/* UBICACIÓN */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#6b7280",
                  }}
                >
                  UBICACIÓN
                </Typography>

                {stand.latitud != null && stand.longitud != null && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1.5, mt: 1 }}
                  >
                    <RoomIcon color="success" />
                    <Typography variant="body2">
                      Coordenadas GPS: {stand.latitud}, {stand.longitud}
                    </Typography>
                  </Stack>
                )}

                <Box
                  sx={{
                    height: 200,
                    width: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <img
                    src="https://predikdata.com/es/wp-content/uploads/sites/2/2021/08/ejemplo-de-GIS.jpg"
                    alt="Mapa ubicación"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* MODAL EDITAR STAND */}
      <StandModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        initialData={mapBackendToModal(stand)}
        onSubmit={handleSaveEdit}
        categorias={[]} // cuando tengas categorías de stand, pásalas aquí
        propietarios={propietarios}
      />

      {/* MODAL CAMBIAR ESTADO (incluye CLAUSURADO) */}
      <CambiarEstadoStandModal
        open={openEstadoModal}
        current={stand.estado as EstadoStand}
        onClose={() => setOpenEstadoModal(false)}
        onSubmit={handleCambiarEstadoModal}
      />
    </Box>
  );
}