import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import superflyLogo from "../../assets/superfly-logo-transparent.png";
import { useAuthStore } from "../../state/useAuthStore";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, authError, clearError } = useAuthStore(
    (state) => ({
      login: state.login,
      isLoading: state.isLoading,
      authError: state.error,
      clearError: state.clearError,
    })
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    clearError();
    setError("");

    const emailFromState = location.state?.email;
    const emailVerified = location.state?.emailVerified;

    if (emailFromState) {
      setFormData((prev) => ({ ...prev, email: emailFromState }));
    }
    if (emailVerified) {
      setSuccess("Email verified successfully. Please login.");
    }
  }, [clearError, location.state]);

  useEffect(() => {
    setError(authError || "");
  }, [authError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(formData);
      const role = user?.role || "client";
      navigate(role === "cleaner" ? "/my-jobs" : "/my-booking", {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#f8f7f7] py-12 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#f8dfda] opacity-80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#f5e7e4] opacity-90 blur-3xl"
      />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Section */}
        <div className="mb-8 flex justify-center">
          <img
            src={superflyLogo}
            alt="Superfly Logo"
            className="h-40 w-40 object-contain drop-shadow-[0_14px_30px_rgba(200,83,68,0.18)]"
          />
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Superfly
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl bg-white/92 px-4 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-[#e5d8d5] bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#C85344] focus:ring-4 focus:ring-[#C85344]/10"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-[#e5d8d5] bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#C85344] focus:ring-4 focus:ring-[#C85344]/10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm ml-auto">
                <a
                  href="/forgot-password"
                  className="font-medium text-[#C85344] transition-colors hover:text-[#b54538]"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#C85344] px-4 text-white transition-all hover:-translate-y-0.5 hover:bg-[#b54538] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-medium">Login</span>
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              onClick={() => navigate("/register")}
              className="cursor-pointer font-medium text-[#C85344] transition-colors hover:text-[#b54538]"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
