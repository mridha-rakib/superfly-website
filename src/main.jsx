import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
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
      <Toaster position="top-right" expand={false} closeButton />
    </AuthBootstrap>
  </React.StrictMode>
);
