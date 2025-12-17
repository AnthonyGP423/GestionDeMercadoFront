import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

type Role = "ADMIN" | "SUPERVISOR" | "SOCIO" | "CLIENTE";

type Props = {
  allow: Role[];
  children: React.ReactNode;
};

export default function RequireRole({ allow, children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  const role = (user?.rol ?? "") as Role;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allow.includes(role)) {
    return <Navigate to="/tienda" replace />;
  }

  return <>{children}</>;
}