import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface ProductFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;

  category: string;
  onCategoryChange: (value: string) => void;

  priceRange: string;
  onPriceRangeChange: (value: string) => void;

  sortBy: string;
  onSortByChange: (value: string) => void;
}

export default function ProductFiltersBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
}: ProductFiltersBarProps) {
  const handleCategory = (e: SelectChangeEvent) =>
    onCategoryChange(e.target.value);
  const handlePrice = (e: SelectChangeEvent) =>
    onPriceRangeChange(e.target.value);
  const handleSort = (e: SelectChangeEvent) => onSortByChange(e.target.value);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mb: 4,
        mt: 2,
      }}
    >
      {/* Buscador */}
      <FormControl sx={{ flex: 2, minWidth: 240 }}>
        <OutlinedInput
          placeholder="Buscar por nombre, categoría o stand..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary" }} />
            </InputAdornment>
          }
        />
      </FormControl>

      {/* Categoría */}
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Categoría</InputLabel>
        <Select
          label="Categoría"
          value={category}
          onChange={handleCategory}
          size="small"
        >
          <MenuItem value="todos">Todas</MenuItem>
          <MenuItem value="frutas">Frutas</MenuItem>
          <MenuItem value="verduras">Verduras</MenuItem>
          <MenuItem value="carnes">Carnes</MenuItem>
          <MenuItem value="aves">Aves</MenuItem>
          <MenuItem value="pescados">Pescados</MenuItem>
          <MenuItem value="abarrotes">Abarrotes</MenuItem>
          <MenuItem value="lacteos">Lácteos</MenuItem>
          <MenuItem value="bebidas">Bebidas</MenuItem>
          <MenuItem value="otros">Otros</MenuItem>
        </Select>
      </FormControl>

      {/* Rango de precio */}
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Rango de precio</InputLabel>
        <Select
          label="Rango de precio"
          value={priceRange}
          onChange={handlePrice}
          size="small"
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="0-10">S/ 0 – 10</MenuItem>
          <MenuItem value="10-50">S/ 10 – 50</MenuItem>
          <MenuItem value="50-100">S/ 50 – 100</MenuItem>
          <MenuItem value="100+">Más de S/ 100</MenuItem>
        </Select>
      </FormControl>

      {/* Ordenar por */}
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Ordenar por</InputLabel>
        <Select
          label="Ordenar por"
          value={sortBy}
          onChange={handleSort}
          size="small"
        >
          <MenuItem value="relevancia">Relevancia</MenuItem>
          <MenuItem value="precio-asc">Precio: menor a mayor</MenuItem>
          <MenuItem value="precio-desc">Precio: mayor a menor</MenuItem>
          <MenuItem value="ofertas">Sólo ofertas</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
