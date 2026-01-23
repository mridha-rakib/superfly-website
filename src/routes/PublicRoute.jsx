import { Navigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";

const roleHome = (role) => (role === "cleaner" ? "/my-jobs" : "/my-booking");

export default function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  if (isAuthenticated) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}
