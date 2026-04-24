// src/components/ui/toastBus.ts
import type { AlertColor } from "@mui/material/Alert";

export type ToastType = AlertColor;

type ToastFn = (message: string, type?: ToastType) => void;

let toastFn: ToastFn | null = null;

export function setGlobalToast(fn: ToastFn) {
  toastFn = fn;
}

export function globalToast(message: string, type: ToastType = "info") {
  if (toastFn) toastFn(message, type);
}