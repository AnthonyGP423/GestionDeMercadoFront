import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

import FiltersBar from "../../components/shared/FiltersBar";
import DataTable from "../../components/shared/DataTable";
import { useToast } from "../../components/ui/Toast";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import productosAdminApi, {
  ProductoRow,
} from "../../api/productosAdminApi";
import ProductModal, {
  ProductData,
} from "./components/modals/ProductModal";

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
      Array.from(new Set(productos.map((p) => p.categoria))).filter(
        Boolean
      ),
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
    // 👇 ahora es un STATUS STRING, igual que "En venta"
    title: "Oferta",
    field: "ofertaStatus",
    type: "status" as const,
  },
  {
    title: "Estado",
    field: "estado",
    type: "status" as const,
  },
];

  // ========= FILTRADO =========
  const datosFiltrados = useMemo(
    () =>
      productos.filter((row) => {
        const c1 =
          filtroCategoria === "Todos" ||
          row.categoria === filtroCategoria;
        const c2 =
          filtroStand === "Todos" || row.stand === filtroStand;
        const c3 =
          filtroEstado === "Todos" || row.estado === filtroEstado;
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
  descripcion: "", // si luego agregas descripción en el DTO admin, aquí la mapearías
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

      // 🔹 Recargamos el listado desde backend para ver el cambio
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
      {/* Título + descripción amigable */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
        Gestión de Productos (Administración)
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 3, color: "text.secondary", maxWidth: 900 }}
      >
        Vista de auditoría para <strong>ADMIN / SUPERVISOR</strong>. Aquí
        puedes revisar la información de los productos, comparar precios
        normales y de oferta, y controlar su{" "}
        <strong>visibilidad en el directorio público</strong>. La creación
        y edición de productos se realiza desde el portal de SOCIOS.
      </Typography>

      {/* Filtros dentro de una tarjeta limpia */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          bgcolor: "#f9fafb",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <FiltersBar
          filters={filtros}
          searchValue={search}
          onSearchChange={setSearch}
          onFilterChange={(field, value) => {
            if (field === "categoria") setFiltroCategoria(value);
            if (field === "stand") setFiltroStand(value);
            if (field === "estado") setFiltroEstado(value);
          }}
          // NOTA: no hay botón "Nuevo producto" para admin
          onAdd={undefined}
        />
      </Paper>

      {/* Tabla */}
      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{ mb: 1, color: "text.secondary", display: "block" }}
          >
            La columna <strong>Oferta</strong> indica si el producto tiene un precio
            promocional activo en el directorio. 
          </Typography>
        </Box>
      ) : (
        <DataTable
          columns={columnas}
          data={datosFiltrados}
          actions={acciones}
        />
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
          mode={modalMode} // "view" → solo lectura / "visibilidad" → solo switch
          onSubmit={modalMode === "visibilidad" ? handleModalSubmit : undefined}
        />
      )}
    </>
  );
}