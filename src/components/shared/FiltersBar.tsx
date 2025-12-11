import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  InputAdornment,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { ReactNode } from "react";

interface FilterOption {
  label: string;
  field: string;
  options: string[];
}

interface FiltersBarProps {
  filters: FilterOption[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (field: string, value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  /** 🔥 Estilo opcional extra para el botón (+ Nuevo ...) */
  addButtonSx?: SxProps<Theme>;
  /** Icono opcional al inicio del botón (+ Nuevo ...) */
  addStartIcon?: ReactNode;
  /** Contenido extra a la derecha (por ej. otro botón) */
  extraRightContent?: ReactNode;
}

export default function FiltersBar({
  filters,
  searchValue,
  onSearchChange,
  onFilterChange,
  onAdd,
  addLabel = "Agregar",
  addButtonSx,
  addStartIcon,
  extraRightContent,
}: FiltersBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
        alignItems: "center",
      }}
    >
      {/* FILTROS EN LÍNEA */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {filters.map((filter) => (
          <FormControl key={filter.field} sx={{ width: 180 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              label={filter.label}
              defaultValue="Todos"
              onChange={(e) => onFilterChange(filter.field, e.target.value)}
              size="small"
            >
              <MenuItem value="Todos">Todos</MenuItem>
              {filter.options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      {/* BUSCADOR */}
      <FormControl sx={{ flex: 1, minWidth: 220 }}>
        <OutlinedInput
          placeholder="Buscar..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          }
          sx={{
            borderRadius: 999,
            bgcolor: "background.paper",
          }}
          size="small"
        />
      </FormControl>

      {/* BOTÓN AGREGAR */}
      {onAdd && (
        <Button
          variant="contained"
          color="success"
          onClick={onAdd}
          startIcon={addStartIcon}
          sx={{
            borderRadius: "999px",
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "0 6px 14px rgba(34, 197, 94, 0.25)",
            ...addButtonSx,
          }}
        >
          + {addLabel}
        </Button>
      )}

      {/* CONTENIDO EXTRA (por ej. botón Cuota individual) */}
      {extraRightContent}
    </Box>
  );
}