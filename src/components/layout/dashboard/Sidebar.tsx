import {
  Avatar,
  Box,
  Drawer,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PaymentsIcon from "@mui/icons-material/Payments";
import LogoutIcon from "@mui/icons-material/Logout";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { Link } from "react-router-dom";
import { useState } from "react";

const drawerWidth = 240;

export default function Sidebar() {
  const [openStands, setOpenStands] = useState(false);
  const [openProductos, setOpenProductos] = useState(false);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
        },
      }}
    >
      {/* PARTE SUPERIOR */}
      <Box>
        {/* Perfil */}
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Avatar sx={{ width: 70, height: 70, margin: "0 auto" }} />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Anthony
          </Typography>
        </Box>

        <Divider />

        {/* Menú */}
        <List>
          {/* DASHBOARD */}
          <ListItemButton component={Link} to="/dashboard/principal">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItemButton>

          {/* USUARIOS */}
          <ListItemButton component={Link} to="/dashboard/usuario">
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Usuarios"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItemButton>

          {/* ROLES */}
          <ListItemButton component={Link} to="/dashboard/rol">
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary="Roles"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItemButton>

          {/* PRODUCTOS (submenú) */}
          <ListItemButton onClick={() => setOpenProductos(!openProductos)}>
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText
              primary="Productos"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
            {openProductos ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openProductos} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 6 }}
                component={Link}
                to="/dashboard/producto"
              >
                <ListItemText primary="Lista de productos" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 6 }}
                component={Link}
                to="/dashboard/categoria-producto"
              >
                <ListItemText primary="Categorías de producto" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* STANDS (submenú) */}
          <ListItemButton onClick={() => setOpenStands(!openStands)}>
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText
              primary="Stands"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
            {openStands ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openStands} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 6 }}
                component={Link}
                to="/dashboard/stand"
              >
                <ListItemText primary="Lista de stands" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 6 }}
                component={Link}
                to="/dashboard/categoria-stand"
              >
                <ListItemText primary="Categorías de stands" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* PAGOS */}
          <ListItemButton component={Link} to="/dashboard/pagos">
            <ListItemIcon>
              <PaymentsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Pagos"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItemButton>

          {/* REPORTES */}
          <ListItemButton component={Link} to="/dashboard/reporte">
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText
              primary="Reportes"
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* PARTE INFERIOR: Cerrar sesión */}
      <Box>
        <Divider />
        <List>
          <ListItemButton component={Link} to="/login">
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
