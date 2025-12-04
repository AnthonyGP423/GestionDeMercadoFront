import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Box,
  Typography,
  Pagination,
} from "@mui/material";

import StatusChip from "../ui/StatusChip";

interface Column {
  title: string; // Título de la columna
  field: string; // Propiedad del objeto
  type?: "text" | "status"; // Para chips o texto normal
}

interface Action {
  icon: React.ReactNode;
  onClick: (row: any) => void;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
}

export default function DataTable({
  columns,
  data,
  actions = [],
}: DataTableProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f7f9fb" }}>
              {columns.map((col) => (
                <TableCell key={col.field}>
                  <strong>{col.title}</strong>
                </TableCell>
              ))}

              {actions.length > 0 && (
                <TableCell align="right">
                  <strong>Acciones</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.field}>
                    {col.type === "status" ? (
                      <StatusChip value={row[col.field]} />
                    ) : (
                      row[col.field]
                    )}
                  </TableCell>
                ))}

                {actions.length > 0 && (
                  <TableCell align="right">
                    {actions.map((action, i) => (
                      <IconButton key={i} onClick={() => action.onClick(row)}>
                        {action.icon}
                      </IconButton>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography>Mostrando {data.length} resultados</Typography>
        <Pagination count={5} color="primary" />
      </Box>
    </Paper>
  );
}
