import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";

import FiltersBar from "../../../components/shared/FiltersBar";
import DataTable from "../../../components/shared/DataTable";
import { useToast } from "../../../components/ui/Toast";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import productosAdminApi, {
  ProductoRow,
} from "../../../api/admin/productosAdminApi";
import ProductModal, {
  ProductData,
} from "../components/modals/ProductModal";

export default function ProductoAdmin() {
  const { showToast } = useToast();

  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroStand, setFiltroStand] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedProducto, setSelectedProducto] =
    useState<ProductoRow | null>(null);
  const [modalMode, setModalMode] =
    useState<"view" | "visibilidad" | null>(null);

  // ========= CARGA INICIAL =========
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await productosAdminApi.listar();
      setProductos(data);
    } catch (error: any) {
      console.error(error);
      showToast("No se pudieron cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // ========= OPCIONES PARA FILTROS =========
  const categoriasOptions = useMemo(
    () =>
      Array.from(new Set(productos.map((p) => p.categoria))).filter(Boolean),
    [productos]
  );
  const standsOptions = useMemo(
    () =>
      Array.from(new Set(productos.map((p) => p.stand))).filter(Boolean),
    [productos]
  );
  const estadosOptions = useMemo(
    () =>
      Array.from(new Set(productos.map((p) => p.estado))).filter(Boolean),
    [productos]
  );

  const filtros = [
    { label: "Categoría", field: "categoria", options: categoriasOptions },
    { label: "Stand", field: "stand", options: standsOptions },
    { label: "Estado", field: "estado", options: estadosOptions },
  ];

  // ========= COLUMNAS =========
  const columnas = [
    { title: "Nombre", field: "nombre", type: "text" as const },
    { title: "Categoría", field: "categoria", type: "text" as const },
    { title: "Stand", field: "stand", type: "text" as const },
    { title: "Unidad", field: "unidad", type: "text" as const },
    {
      title: "Precio normal",
      field: "precioNormalTexto",
      type: "text" as const,
    },
    {
      title: "Precio oferta",
      field: "precioOfertaTexto",
      type: "text" as const,
    },
    {
      title: "Oferta",
      field: "ofertaStatus",
      type: "status" as const,
      render: (row: ProductoRow) =>
        row.tieneOferta ? (
          <Chip
            label="Con oferta"
            size="small"
            sx={{
              bgcolor: "#bbf7d0",
              color: "#166534",
              fontWeight: 600,
              borderRadius: "999px",
              fontSize: "0.75rem",
              px: 1.5,
            }}
          />
        ) : (
          <Chip
            label="Sin oferta"
            size="small"
            sx={{
              bgcolor: "#e5e7eb",
              color: "#374151",
              fontWeight: 500,
              borderRadius: "999px",
              fontSize: "0.75rem",
              px: 1.5,
            }}
          />
        ),
    },
    {
      title: "Estado",
      field: "estado",
      type: "status" as const,
      render: (row: ProductoRow) => {
        const value = row.estado;

        if (value === "En venta") {
          return (
            <Chip
              label="En venta"
              size="small"
              sx={{
                bgcolor: "#22c55e20",
                color: "#15803d",
                fontWeight: 600,
                borderRadius: "999px",
                fontSize: "0.75rem",
                px: 1.5,
              }}
            />
          );
        }

        if (value === "Eliminado") {
          return (
            <Chip
              label="Eliminado"
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 600,
                borderRadius: "999px",
                fontSize: "0.75rem",
                px: 1.5,
              }}
            />
          );
        }

        return (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: "#e5e7eb",
              color: "#6b7280",
              fontWeight: 500,
              borderRadius: "999px",
              fontSize: "0.75rem",
              px: 1.5,
            }}
          />
        );
      },
    },
  ];

  // ========= FILTRADO =========
  const datosFiltrados = useMemo(
    () =>
      productos.filter((row) => {
        const c1 =
          filtroCategoria === "Todos" || row.categoria === filtroCategoria;
        const c2 = filtroStand === "Todos" || row.stand === filtroStand;
        const c3 = filtroEstado === "Todos" || row.estado === filtroEstado;
        const s = search.trim().toLowerCase();
        const c4 =
          !s ||
          row.nombre.toLowerCase().includes(s) ||
          row.categoria.toLowerCase().includes(s) ||
          row.stand.toLowerCase().includes(s);

        return c1 && c2 && c3 && c4;
      }),
    [productos, filtroCategoria, filtroStand, filtroEstado, search]
  );

  // ========= ACCIONES =========
  const handleView = (row: ProductoRow) => {
    setSelectedProducto(row);
    setModalMode("view");
    setOpenModal(true);
  };

  const handleChangeVisibility = (row: ProductoRow) => {
    setSelectedProducto(row);
    setModalMode("visibilidad");
    setOpenModal(true);
  };

  const acciones = [
    {
      icon: <VisibilityIcon color="primary" />,
      onClick: (row: ProductoRow) => handleView(row),
    },
    {
      icon: <EditIcon color="warning" />,
      onClick: (row: ProductoRow) => handleChangeVisibility(row),
    },
  ];

  // ========= ADAPTAR ProductoRow -> ProductData PARA EL MODAL =========
  const buildModalDataFromRow = (row: ProductoRow): ProductData => ({
    nombre: row.nombre,
    descripcion: "",
    unidad_medida: row.unidad,
    precio_actual: row.precioNormal.toString(),
    en_oferta: row.tieneOferta,
    precio_oferta:
      row.precioOferta !== null ? row.precioOferta.toString() : "",
    visible_directorio: row.visible,
    estado: row.estado === "En venta" ? "Activo" : "Inactivo",
    id_stand: "",
    id_categoria_producto: "",
  });

  // ========= SUBMIT DEL MODAL (VISIBILIDAD) =========
  const handleModalSubmit = async (data: ProductData) => {
    if (!selectedProducto) return;
    const nuevoVisible = !!data.visible_directorio;

    try {
      await productosAdminApi.cambiarVisibilidad(
        selectedProducto.idProducto,
        nuevoVisible
      );

      await fetchProductos();

      showToast(
        nuevoVisible
          ? "Producto marcado como visible en el directorio"
          : "Producto ocultado del directorio",
        "success"
      );
    } catch (error: any) {
      console.error(error);
      showToast(
        "No se pudo actualizar la visibilidad del producto",
        "error"
      );
    } finally {
      setOpenModal(false);
      setSelectedProducto(null);
      setModalMode(null);
    }
  };

  return (
    <>
      {/* CABECERA AL ESTILO ROL */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily:
              `"Poppins","Inter",system-ui,-apple-system,BlinkMacSystemFont`,
          }}
        >
          Productos (Administración)
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5, maxWidth: 720 }}
        >
          Vista de auditoría para{" "}
          <strong>ADMIN / SUPERVISOR</strong>. Revisa el catálogo de
          productos, compara precios normales y de oferta, y controla su{" "}
          <strong>visibilidad en el directorio público</strong>.
        </Typography>
      </Box>

      {/* BARRA DE FILTROS, SIN BOTÓN NUEVO, ESTILO LIMPIO */}
      <FiltersBar
        filters={filtros}
        searchValue={search}
        onSearchChange={setSearch}
        onFilterChange={(field, value) => {
          if (field === "categoria") setFiltroCategoria(value);
          if (field === "stand") setFiltroStand(value);
          if (field === "estado") setFiltroEstado(value);
        }}
        onAdd={undefined}
      />

      {/* TABLA AL ESTILO "ROLES" */}
      {loading ? (
        <Box
          sx={{
            mt: 6,
            display: "flex",
            justifyContent: "center",
          }}
        >
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
          <Box sx={{ p: 1.5 }}>
            <DataTable columns={columnas} data={datosFiltrados} actions={acciones} />
          </Box>
        </Paper>
      )}

      {!loading && (
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            * La columna <strong>Oferta</strong> indica si el producto tiene un
            precio promocional activo, y <strong>Estado</strong> refleja su
            situación actual en el módulo administrativo.
          </Typography>
        </Box>
      )}

      {/* Modal de detalle / visibilidad */}
      {selectedProducto && modalMode && (
        <ProductModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedProducto(null);
            setModalMode(null);
          }}
          initialData={buildModalDataFromRow(selectedProducto)}
          mode={modalMode}
          onSubmit={modalMode === "visibilidad" ? handleModalSubmit : undefined}
        />
      )}
    </>
  );
}