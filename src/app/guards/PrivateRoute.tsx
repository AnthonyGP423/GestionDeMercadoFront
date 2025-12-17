import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

interface PrivateRouteProps {
  children: ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/tienda" replace />;
  }

  return children;
};

export default PrivateRoute; 