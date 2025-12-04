import {
  AppBar,
  Toolbar,
  Box,
  Breadcrumbs,
  Typography,
  IconButton,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useLocation } from "react-router-dom";

const drawerWidth = 240;

function getCurrentLabel(pathname: string): string {
  // /dashboard, /dashboard/usuarios, etc.
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] !== "dashboard") return "a";

  // solo /dashboard
  if (parts.length === 1) return "Panel De control";

  //dashboard/nombre dela pagina donde
  const map: Record<string, string> = {
    usuarios: "Usuarios",
    roles: "Roles",
    categorias: "Categorías",
    stands: "Stands",
    reportes: "Reportes",
    principal: "Panel De control",
    producto: "Productos",
  };

  return map[parts[1]] ?? parts[1];
}

export default function HeaderBar() {
  const location = useLocation();
  const currentLabel = getCurrentLabel(location.pathname);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Breadcrumb */}
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography sx={{ fontSize: 14 }} color="#618971">
              Inicio
            </Typography>

            {currentLabel && (
              <Typography
                sx={{ fontSize: 14, fontWeight: 600 }}
                color="text.primary"
              >
                {currentLabel}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>

        {/* Iconos derecha */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small">
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <AccountCircleOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
