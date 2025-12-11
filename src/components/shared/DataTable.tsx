import { useState, useMemo, useEffect, type ReactNode } from "react";
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

type Column = {
  title: string;
  field: string;
  type?: "text" | "status";
  render?: (row: any) => ReactNode;
};

interface Action {
  icon: ReactNode;
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
  // 🔹 Paginación interna
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  // Resetear página cuando cambian los datos (filtros, búsqueda, etc.)
  useEffect(() => {
    setPage(0);
  }, [data]);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // Datos paginados
  const paginatedData = useMemo(
    () =>
      data.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [data, page, rowsPerPage]
  );

  const start = total === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min(total, (page + 1) * rowsPerPage);

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
            {paginatedData.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.field}>
                    {col.render
                      ? col.render(row)
                      : col.type === "status"
                      ? <StatusChip value={row[col.field]} />
                      : row[col.field]}
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

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length ? 1 : 0)}>
                  <Box
                    sx={{
                      py: 4,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      No hay datos para mostrar.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      {/* Footer estilo "Roles" */}
      <Box
        sx={{
          py: 1.5,
          px: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#6b7280" }}
        >
          {total === 0
            ? "Mostrando 0 resultados"
            : `Mostrando ${start}–${end} de ${total} resultados`}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", fontWeight: 500 }}
          >
            Página {page + 1} de {totalPages}
          </Typography>

          <Pagination
            size="small"
            variant="outlined"
            shape="rounded"
            color="primary"
            page={page + 1}
            count={totalPages}
            onChange={(_, value) => setPage(value - 1)}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "999px",
                fontSize: 12,
              },
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}