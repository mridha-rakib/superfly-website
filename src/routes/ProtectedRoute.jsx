import { Navigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";

const roleHome = (role) => (role === "cleaner" ? "/my-jobs" : "/my-booking");

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, isHydrating } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
    isHydrating: state.isHydrating,
  }));

  if (isHydrating) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}
