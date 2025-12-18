import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

type Props = {
  children: React.ReactNode;
};

const isClienteRole = (rol?: string) => {
  const r = String(rol ?? "").toUpperCase();
  return r === "CLIENTE" || r === "ROLE_CLIENTE" || r.includes("CLIENTE");
};

export default function ClienteRoute({ children }: Props) {
  const { isAuthenticated, user } = useAuth() as any;
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/cliente/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const rol = user?.rol;
  if (!isClienteRole(rol)) {
    return (
      <Navigate
        to="/cliente/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}