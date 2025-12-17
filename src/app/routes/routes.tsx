import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../../features/auth/Login";
import Registrate from "../../features/auth/Register";
import User from "../../features/admin/pages/User";
import PanelDeControl from "../../layouts/dashboard/PanelDeControl";
import Rol from "../../features/admin/pages/Rol";
import Stand from "../../features/admin/pages/Stand";
import Reporte from "../../features/admin/pages/Reporte";
import CategoriaStand from "../../features/admin/pages/CategoriaStand";
import Principal from "../../features/admin/pages/MenuPrincipal";
import Producto from "../../features/admin/pages/Producto";
import StandDetalle from "../../features/admin/pages/StandDetalle";
import CategoriaProducto from "../../features/admin/pages/CategoriaProducto";
import Pagos from "../../features/admin/pages/Pagos";
import TiendaHome from "../../features/store/pages/TiendaHome";
import PreciosProductos from "../../features/store/pages/ProductosPrecios";
import Contacto from "../../features/store/pages/Contacto";
import PrivateRoute from "../../app/guards/PrivateRoute";
import VistaProducto from "../../features/store/pages/VistaProducto";
import PerfilUsuario from "../../features/store/pages/PerfilUsuario";
import PerfilStand from "../../features/store/pages/PerfilStand";
import MapaStand from "../../features/store/pages/MapaStand";
import IncidenciasAdmin from "../../features/admin/pages/Incidencias";
import CredencialesQrAdmin from "../../features/admin/pages/CredencialesQrAdmin";

import PanelSocio from "../../layouts/dashboard/PanelSocioLayout";

// Socio
import DashboardSocioHome from "../../features/socio/pages/DashboardSocioHome";
import MisStands from "../../features/socio/pages/MisStands";
import MisCuotas from "../../features/socio/pages/MisCuotas";
import ProductosSocio from "../../features/socio/pages/ProductosSocio";
import IncidenciasSocio from "../../features/socio/pages/IncidenciasSocio";
import CredencialQrSocio from "../../features/socio/pages/CredencialQrSocio";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirige raíz a /tienda */}
      <Route path="/" element={<Navigate to="/tienda" />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/registrate" element={<Registrate />} />

      {/* Dashboard protegido */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <PanelDeControl />
          </PrivateRoute>
        }
      >
        <Route path="usuario" element={<User />} />
        <Route path="stand" element={<Stand />} />
        <Route path="stands/:id" element={<StandDetalle />} />
        <Route path="reporte" element={<Reporte />} />
        <Route path="categoria-stand" element={<CategoriaStand />} />
        <Route path="rol" element={<Rol />} />
        <Route path="principal" element={<Principal />} />
        <Route path="producto" element={<Producto />} />
        <Route path="categoria-producto" element={<CategoriaProducto />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="incidencias" element={<IncidenciasAdmin />} />
        <Route path="credenciales-qr" element={<CredencialesQrAdmin />} />
      </Route>

      {/* SOCIO protegido */}
      <Route
        path="/socio"
        element={
          <PrivateRoute>
            <PanelSocio />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/socio/principal" replace />} />
        <Route path="principal" element={<DashboardSocioHome />} />
        <Route path="mis-stands" element={<MisStands />} />
        <Route path="mis-cuotas" element={<MisCuotas />} />
        <Route path="productos" element={<ProductosSocio />} />
        <Route path="incidencias" element={<IncidenciasSocio />} />
        <Route path="credencial-qr" element={<CredencialQrSocio />} />
      </Route>

      {/* TIENDA PÚBLICA */}
      <Route path="/tienda" element={<TiendaHome />} />
      <Route path="/tienda/precios-productos" element={<PreciosProductos />} />
      <Route path="/tienda/contacto" element={<Contacto />} />

      <Route path="/tienda/producto/:id" element={<VistaProducto />} />

      <Route path="/tienda/perfil-usuario" element={<PerfilUsuario />} />
      <Route path="/tienda/stand/:id" element={<PerfilStand />} />
      <Route path="/tienda/mapa-stand" element={<MapaStand />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/tienda" replace />} />
    </Routes>
  );
};

export default AppRoutes;