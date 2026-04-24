import { Box, Paper, Typography, Button } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

interface PriceComparatorBannerProps {
  onClick?: () => void;
}

export default function PriceComparatorBanner({
  onClick,
}: PriceComparatorBannerProps) {
  return (
    <Paper
      sx={{
        mt: 3,
        mb: 4,
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "#f9fafb",
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.03), 0 2px 4px -2px rgb(0 0 0 / 0.03)",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: "#ecfdf3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "success.main",
        }}
      >
        <CompareArrowsIcon />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Comparador de precios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Añade productos para comparar precios entre stands y encontrar la
          mejor oferta.
        </Typography>
      </Box>

      <Button
        variant="outlined"
        color="success"
        sx={{ textTransform: "none", fontWeight: 600 }}
        onClick={onClick}
      >
        Comparar
      </Button>
    </Paper>
  );
}
