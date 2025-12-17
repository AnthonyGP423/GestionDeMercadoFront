import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";

import HeaderBar from "./HeaderBar";
import SidebarSocio from "../dashboard/SiderbarSocio";

const drawerWidth = 260;

export default function PanelSocio() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <SidebarSocio />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <HeaderBar />

        {/* spacer para el AppBar fixed */}
        <Toolbar sx={{ minHeight: 64 }} />

        <Box
          component="main"
          sx={{
            px: { xs: 2, md: 3 },
            pt: 1.25,
            pb: 3,
            ml: 0,            // ✅ CLAVE: no empujar otra vez
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}