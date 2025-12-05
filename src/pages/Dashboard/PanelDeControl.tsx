// src/pages/Dashboard/PaneldeControl.tsx
import { Box } from "@mui/material";
import Sidebar from "../../components/layout/dashboard/Sidebar";
import HeaderBar from "../../components/layout/dashboard/HeaderBar";
import { Outlet } from "react-router-dom";

export default function PanelDeControl() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <Box sx={{ flex: 1 }}>
        {/* Barra superior */}
        <HeaderBar />

        {/* Contenido de cada página */}
        <Box sx={{ p: 3, mt: "64px" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
