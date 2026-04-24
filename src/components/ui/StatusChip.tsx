import { Chip } from "@mui/material";

const colorMap: any = {
  ACTIVO: "success",
  DISPONIBLE: "success",
  OCUPADO: "warning",
  SUSPENDIDO: "warning",
  BAJA: "error",
  AGOTADO: "error",
  REVISADO: "info",
};

export default function StatusChip({ value }: { value: string }) {
  const color = colorMap[value] || "default";

  return <Chip label={value} color={color} variant="outlined" />;
}
