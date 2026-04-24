import { createContext, useContext, useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import { setGlobalToast } from "./toastBus"; // ✅ NUEVO

type ToastType = AlertColor;

interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<any>(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: any) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ open: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // ✅ Registramos el toast para que pueda ser llamado desde Axios interceptor (sin hooks)
  useEffect(() => {
    setGlobalToast(showToast);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={closeToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert variant="filled" severity={toast.type} onClose={closeToast}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}