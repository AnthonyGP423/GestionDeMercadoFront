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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/registrate" element={<Registrate />} />

      <Route path="/dashboard" element={<PanelDeControl />}>
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
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
