import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Registrate from "../pages/Auth/Register";
import User from "../pages/Dashboard/User";
import PanelDeControl from "../pages/Dashboard/PanelDeControl";
import Rol from "../pages/Dashboard/Rol";
import Stand from "../pages/Dashboard/Stand";
import Reporte from "../pages/Dashboard/Reporte";
import CategoriaStand from "../pages/Dashboard/CategoriaStand";
import Principal from "../pages/Dashboard/MenuPrincipal";
import Producto from "../pages/Dashboard/Producto";
import StandDetalle from "../pages/Dashboard/StandDetalle";
import CategoriaProducto from "../pages/Dashboard/CategoriaProducto";
import Pagos from "../pages/Dashboard/Pagos";
import TiendaHome from "../pages/Tienda/TiendaHome";
import PreciosProductos from "../pages/Tienda/ProductosPrecios";
import Contacto from "../pages/Tienda/Contacto";
import PingTest from "../pages/Dashboard/PingTest";
import PrivateRoute from "../auth/PrivateRoute";
import VistaProducto from "../pages/Tienda/VistaProducto";
import PerfilUsuario from "../pages/Tienda/PerfilUsuario";
import PerfilStand from "../pages/Tienda/PerfilStand";
import MapaStand from "../pages/Tienda/MapaStand";
import IncidenciasAdmin from "../pages/Dashboard/Incidencias";
//import CredencialesQrAdmin from "../pages/Dashboard/CredencialesQrAdmin";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tienda" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/registrate" element={<Registrate />} />

      {/* /dashboard protegido */}
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
        <Route path="ping-test" element={<PingTest />} />
        <Route path="incidencias" element={<IncidenciasAdmin />} />
      </Route>
      <Route path="/tienda" element={<TiendaHome />} />
      <Route path="/tienda/precios-productos" element={<PreciosProductos />} />
      <Route path="/tienda/contacto" element={<Contacto />} />
      <Route path="/tienda/producto" element={<VistaProducto />} />
      <Route path="/tienda/perfil-usuario" element={<PerfilUsuario />} />
      <Route path="/tienda/perfil-stand" element={<PerfilStand />} />
      <Route path="/tienda/mapa-stand" element={<MapaStand />} />

      <Route path="*" element={<Navigate to="/tienda" replace />} />
    </Routes>
  );
};

export default AppRoutes;
