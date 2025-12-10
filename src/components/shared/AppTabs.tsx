// src/components/shared/AppTabs.tsx
import { SyntheticEvent, ReactNode } from "react";
import { Tabs, Tab, Box } from "@mui/material";

export interface TabItem {
  value: string;
  label: string;
}

interface AppTabsProps {
  value: string;
  onChange: (newValue: string) => void;
  items: TabItem[];
  "aria-label"?: string;
}

export function AppTabs({
  value,
  onChange,
  items,
  "aria-label": ariaLabel,
}: AppTabsProps) {
  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      aria-label={ariaLabel ?? "secciones"}
      variant="scrollable"
      scrollButtons="auto"
    >
      {items.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} wrapped />
      ))}
    </Tabs>
  );
}

// TabPanel reutilizable
interface TabPanelProps {
  current: string; // valor actual seleccionado
  value: string; // valor que activa este panel
  children: ReactNode;
}

export function TabPanel({ current, value, children }: TabPanelProps) {
  if (current !== value) return null;

  return <Box sx={{ mt: 4 }}>{children}</Box>;
}
