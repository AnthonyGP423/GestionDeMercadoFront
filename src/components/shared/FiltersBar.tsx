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

import SearchIcon from "@mui/icons-material/Search";

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
  onAdd?: () => void; // 👈 ahora es opcional
  addLabel?: string;
}

export default function FiltersBar({
  filters,
  searchValue,
  onSearchChange,
  onFilterChange,
  onAdd,
  addLabel = "Agregar",
}: FiltersBarProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      {filters.map((filter) => (
        <FormControl key={filter.field} sx={{ width: 180 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select
            label={filter.label}
            defaultValue="Todos"
            onChange={(e) => onFilterChange(filter.field, e.target.value)}
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

      {/* BUSCADOR */}
      <FormControl sx={{ flex: 1 }}>
        <OutlinedInput
          placeholder="Buscar..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </FormControl>

      {/* BOTÓN AGREGAR (solo si mandas onAdd) */}
      {onAdd && (
        <Button variant="contained" color="success" onClick={onAdd}>
          + {addLabel}
        </Button>
      )}
    </Box>
  );
}
