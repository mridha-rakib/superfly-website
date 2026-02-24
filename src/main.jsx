import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import router from "./routes/AppRoutes";
import QuoteAssignmentNotifications from "./realtime/QuoteAssignmentNotifications";
import { useAuthStore } from "./state/useAuthStore";

export const AuthBootstrap = ({ children }) => {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return children;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthBootstrap>
      <QuoteAssignmentNotifications />
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </AuthBootstrap>
  </React.StrictMode>
);
