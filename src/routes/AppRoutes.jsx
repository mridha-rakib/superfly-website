import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/main/MainLayout";
import Home from "../pages/home/Home";
import ResidentialCleaning from "../pages/services/ResidentialCleaning";
import CompleteBooking from "../pages/services/CompleteBooking";
import BookSiteVisitCommercial from "../pages/services/BookSiteVisitCommercial";
import BookSiteVisitPostConstraction from "../pages/services/BookSiteVisitPostConstraction";
import Review from "../pages/review/Review";
import Profile from "../pages/profile/Profile";
import MyBookings from "../pages/my-bookings/MyBookings";
import ViewBookingDetails from "../pages/my-bookings/ViewBookingDetails";
import Contact from "../pages/contact/Contact";
import Earning from "../pages/earning/Earning";
import MyJobs from "../pages/my-jobs/MyJobs";
import ViewJob from "../pages/my-jobs/ViewJob";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import SetNewPassword from "../pages/auth/SetNewPassword";
import Successful from "../pages/auth/Successful";
import VerifyCode from "../pages/auth/VerifyCode";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import CheckoutSuccess from "../pages/checkout/CheckoutSuccess";
import CheckoutCancel from "../pages/checkout/CheckoutCancel";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/services/residential", element: <ResidentialCleaning /> },
      {
        path: "/services/residential/complete-booking",
        element: <CompleteBooking />,
      },
      { path: "/checkout/success", element: <CheckoutSuccess /> },
      { path: "/checkout/cancel", element: <CheckoutCancel /> },
      {
        path: "/services/book-site-visit-commercial",
        element: <BookSiteVisitCommercial />,
      },
      {
        path: "/services/book-site-visit-post-construction",
        element: <BookSiteVisitPostConstraction />,
      },
      { path: "/reviews", element: <Review /> },
      {
        path: "/profile",
        element: (
          <ProtectedRoute allowedRoles={["client", "cleaner"]}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-booking",
        element: (
          <ProtectedRoute allowedRoles={["client"]}>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-booking/:id",
        element: (
          <ProtectedRoute allowedRoles={["client"]}>
            <ViewBookingDetails />
          </ProtectedRoute>
        ),
      },
      { path: "/contact", element: <Contact /> },
      {
        path: "/my-jobs",
        element: (
          <ProtectedRoute allowedRoles={["cleaner"]}>
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-jobs/:id",
        element: (
          <ProtectedRoute allowedRoles={["cleaner"]}>
            <ViewJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/earnings",
        element: (
          <ProtectedRoute allowedRoles={["cleaner"]}>
            <Earning />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/set-new-password", element: <SetNewPassword /> },
  { path: "/successful", element: <Successful /> },
  { path: "/verify-code", element: <VerifyCode /> },
]);

export default router;
