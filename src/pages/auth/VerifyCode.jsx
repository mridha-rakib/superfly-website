import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../services/authApi";
// import crisisLogo from "../../assets/logos/crisis-logo.svg";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";

const VerifyCode = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const mode = location.state?.mode || "verify-email"; // "password-reset" | "verify-email"
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim().slice(0, 4);
    if (!/^\d+$/.test(text)) return;
    const padded = text.padEnd(4, "");
    setOtp(padded.split(""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 4) {
      setError("Please enter the 4-digit code.");
      return;
    }
    setIsVerifying(true);
    try {
      if (mode === "password-reset") {
        await authApi.verifyPasswordOtp({ email, otp: code });
        navigate("/set-new-password", { replace: true, state: { email, otp: code } });
      } else {
        await authApi.verifyEmail({ email, code });
        navigate("/login", {
          replace: true,
          state: { emailVerified: true, email },
        });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Verification failed. Check the code and try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setIsResending(true);
    try {
      if (mode === "password-reset") {
        await authApi.resendPasswordOtp({ email });
        setInfo("A new password reset code has been sent to your email.");
      } else {
        await authApi.resendVerification({ email });
        setInfo("A new code has been sent to your email.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to resend code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="Superfly Logo" className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
              {mode === "password-reset" ? "Reset Password" : "Verify Code"}
            </h2>
            <p className="text-center text-gray-600">
              Enter the {mode === "password-reset" ? "password reset" : "verification"} code sent to{" "}
              {email || "your email"}.
            </p>
          </div>

          {/* OTP Inputs */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {info}
              </div>
            )}
            <div
              className="flex flex-row gap-2 items-center justify-center"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e)}
                  className="w-12 h-12 text-center text-lg px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#FFD1E8] focus:border-[#FFD1E8]"
                  required
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full h-12 bg-[#C85344] hover:bg-[#C85344] text-white px-4 rounded-lg cursor-pointer font-medium transition-colors disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 flex items-center justify-center gap-2 cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 flex items-center justify-center gap-2 cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} />
              <span className="font-medium">Back to Login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
