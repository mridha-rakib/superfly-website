import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../state/useAuthStore";
import { useQuoteStore } from "../../state/useQuoteStore";

function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));
  const {
    confirmCheckout,
    fetchPaymentStatus,
    isConfirming,
    isFetchingStatus,
    lastQuote,
    lastStatus,
    error,
  } = useQuoteStore((state) => ({
    confirmCheckout: state.confirmCheckout,
    fetchPaymentStatus: state.fetchPaymentStatus,
    isConfirming: state.isConfirming,
    isFetchingStatus: state.isFetchingStatus,
    lastQuote: state.lastQuote,
    lastStatus: state.lastStatus,
    error: state.error,
  }));

  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setInfoMessage("Missing checkout session id. Please contact support.");
      return;
    }

    let isMounted = true;
    const confirmAndFetch = async () => {
      try {
        await confirmCheckout(sessionId);
        if (isMounted) {
          setInfoMessage("Payment confirmed! Successfully Booked.");
        }
      } catch (err) {
        try {
          const status = await fetchPaymentStatus(sessionId);
          if (!isMounted) return;
          if (status?.status === "paid") {
            setInfoMessage("Payment marked as paid. Finalizing your booking...");
          } else if (status?.status === "pending") {
            setInfoMessage("Payment is pending. Refresh in a moment.");
          } else if (status?.status === "failed") {
            setInfoMessage("Payment failed or expired. Please try again.");
          }
        } catch {
          if (isMounted) {
            setInfoMessage(
              "We could not confirm the payment right now. Please retry or contact support."
            );
          }
        }
      }
    };

    confirmAndFetch();
    return () => {
      isMounted = false;
    };
  }, [sessionId, confirmCheckout, fetchPaymentStatus]);

  const amountLabel = useMemo(() => {
    if (lastQuote?.totalPrice) {
      return `$${lastQuote.totalPrice.toFixed(2)}`;
    }
    if (lastStatus?.paymentAmount) {
      return `$${(lastStatus.paymentAmount / 100).toFixed(2)}`;
    }
    return null;
  }, [lastQuote, lastStatus]);

  const preferredTimeLabel =
    lastQuote?.preferredTime || lastStatus?.preferredTime || "--";
  const serviceDateLabel = lastQuote?.serviceDate || lastStatus?.serviceDate || "--";

  const bookingCta = isAuthenticated && role === "client" ? "/my-booking" : "/";

  const handleRefreshStatus = async () => {
    if (!sessionId) return;
    try {
      await fetchPaymentStatus(sessionId);
    } catch {
      setInfoMessage("Could not refresh payment status. Please try again shortly.");
    }
  };

  const glowCard = "bg-white shadow-2xl rounded-3xl border border-gray-100";

  return (
    <div className="max-w-4xl mx-auto py-14 px-4 md:px-10">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C85344]/80">Payment</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Checkout Successful</h1>
        <p className="text-gray-700 mt-3">
          {infoMessage || "Confirming your payment and generating your booking..."}
        </p>
      </div>

      {(error || lastStatus?.status === "failed") && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          {error ||
            "We could not verify this payment. If you were charged, please contact support with your receipt."}
        </div>
      )}

      {isConfirming || isFetchingStatus ? (
        <div className="text-center text-gray-600 mb-8">Hang tight... finishing up.</div>
      ) : null}

      {lastQuote ? (
        <div className={`${glowCard} p-10 space-y-5`}>
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoRow label="Booking ID" value={lastQuote._id} />
            <InfoRow label="Service Date" value={serviceDateLabel} />
            <InfoRow label="Preferred Time" value={preferredTimeLabel} />
            <InfoRow label="Amount" value={amountLabel || lastQuote.paymentAmount || "--"} />
            <InfoRow label="Payment Status" value="Paid" valueClass="text-green-700 font-semibold" />
          </div>

          {lastQuote.services?.length ? (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-sm font-semibold text-gray-900 mb-3 tracking-wide">
                Selected Services
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {lastQuote.services.map((item) => (
                  <li
                    key={item.code || item.label}
                    className="flex justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="font-medium text-gray-800">
                      {(item.label || item.code || "Service").trim()}
                    </span>
                    <span className="text-gray-600">x {item.quantity ?? "--"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={`${glowCard} p-6 text-gray-700`}>We have received your payment. If this page does not update within a few seconds, use the button below to refresh the payment status.</div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate("/services/residential")}
          className="px-6 py-3 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 transition shadow-sm"
        >
          Book Another Cleaning
        </button>
        <button
          onClick={() => navigate(bookingCta)}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#C85344] to-[#e47060] text-white hover:opacity-95 transition shadow-sm"
        >
          {isAuthenticated && role === "client" ? "Go to My Bookings" : "Back to Home"}
        </button>
        <button
          onClick={handleRefreshStatus}
          className="px-6 py-3 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 transition shadow-sm"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between rounded-lg bg-gray-50/80 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 ${valueClass}`}>{value}</span>
    </div>
  );
}

export default CheckoutSuccess;
