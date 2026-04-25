import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/main/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const Home = lazy(() => import("../pages/home/Home"));
const ResidentialCleaning = lazy(() => import("../pages/services/ResidentialCleaning"));
const CompleteBooking = lazy(() => import("../pages/services/CompleteBooking"));
const BookSiteVisitCommercial = lazy(() =>
  import("../pages/services/BookSiteVisitCommercial")
);
const BookSiteVisitPostConstraction = lazy(() =>
  import("../pages/services/BookSiteVisitPostConstraction")
);
const Review = lazy(() => import("../pages/review/Review"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const MyBookings = lazy(() => import("../pages/my-bookings/MyBookings"));
const ViewBookingDetails = lazy(() =>
  import("../pages/my-bookings/ViewBookingDetails")
);
const Contact = lazy(() => import("../pages/contact/Contact"));
const Earning = lazy(() => import("../pages/earning/Earning"));
const MyJobs = lazy(() => import("../pages/my-jobs/MyJobs"));
const ViewJob = lazy(() => import("../pages/my-jobs/ViewJob"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const SetNewPassword = lazy(() => import("../pages/auth/SetNewPassword"));
const Successful = lazy(() => import("../pages/auth/Successful"));
const VerifyCode = lazy(() => import("../pages/auth/VerifyCode"));
const CheckoutSuccess = lazy(() => import("../pages/checkout/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("../pages/checkout/CheckoutCancel"));

const routeFallback = (
  <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm font-medium text-gray-500">
    Loading...
  </div>
);

const renderLazyRoute = (LazyComponent) => (
  <Suspense fallback={routeFallback}>
    <LazyComponent />
  </Suspense>
);

const inferBase = () => {
  const envBase = (import.meta.env.VITE_APP_BASENAME || "").trim();
  if (envBase) return envBase;
  if (typeof window !== "undefined") {
    return window.location.pathname.startsWith("/Superfly") ? "/Superfly" : "";
  }
  return "";
};

const BASENAME = inferBase() || undefined;

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: "/", element: renderLazyRoute(Home) },
        {
          path: "/services/residential",
          element: renderLazyRoute(ResidentialCleaning),
        },
        {
          path: "/services/residential/complete-booking",
          element: renderLazyRoute(CompleteBooking),
        },
        {
          path: "/checkout/success",
          element: renderLazyRoute(CheckoutSuccess),
        },
        {
          path: "/checkout/cancel",
          element: renderLazyRoute(CheckoutCancel),
        },
        {
          path: "/services/book-site-visit-commercial",
          element: renderLazyRoute(BookSiteVisitCommercial),
        },
        {
          path: "/services/book-site-visit-post-construction",
          element: renderLazyRoute(BookSiteVisitPostConstraction),
        },
        { path: "/reviews", element: renderLazyRoute(Review) },
        {
          path: "/profile",
          element: (
            <ProtectedRoute allowedRoles={["client", "cleaner"]}>
              {renderLazyRoute(Profile)}
            </ProtectedRoute>
          ),
        },
        {
          path: "/my-booking",
          element: (
            <ProtectedRoute allowedRoles={["client"]}>
              {renderLazyRoute(MyBookings)}
            </ProtectedRoute>
          ),
        },
        {
          path: "/my-booking/:id",
          element: (
            <ProtectedRoute allowedRoles={["client"]}>
              {renderLazyRoute(ViewBookingDetails)}
            </ProtectedRoute>
          ),
        },
        { path: "/contact", element: renderLazyRoute(Contact) },
        {
          path: "/my-jobs",
          element: (
            <ProtectedRoute allowedRoles={["cleaner"]}>
              {renderLazyRoute(MyJobs)}
            </ProtectedRoute>
          ),
        },
        {
          path: "/my-jobs/:id",
          element: (
            <ProtectedRoute allowedRoles={["cleaner"]}>
              {renderLazyRoute(ViewJob)}
            </ProtectedRoute>
          ),
        },
        {
          path: "/earnings",
          element: (
            <ProtectedRoute allowedRoles={["cleaner"]}>
              {renderLazyRoute(Earning)}
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          {renderLazyRoute(Login)}
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          {renderLazyRoute(Register)}
        </PublicRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: renderLazyRoute(ForgotPassword),
    },
    {
      path: "/set-new-password",
      element: renderLazyRoute(SetNewPassword),
    },
    { path: "/successful", element: renderLazyRoute(Successful) },
    { path: "/verify-code", element: renderLazyRoute(VerifyCode) },
  ],
  { basename: BASENAME }
);

export default router;
