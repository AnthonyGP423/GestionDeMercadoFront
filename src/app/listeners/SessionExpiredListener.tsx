import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";

export default function SessionExpiredListener() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const handler = (e: any) => {
      const message =
        e?.detail?.message || "Tu sesión ha expirado. Vuelve a iniciar sesión.";

      showToast(message, "warning");
      navigate("/tienda", { replace: true });
    };

    window.addEventListener("auth:session-expired", handler);
    return () => window.removeEventListener("auth:session-expired", handler);
  }, [navigate, showToast]);

  return null;
}