import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../state/useAuthStore";
import { cleaningServiceApi } from "../../services/cleaningServiceApi";
import { quoteApi } from "../../services/quoteApi";
import Hero from "../../components/home/Hero";

function ResidentialCleaning() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  const [services, setServices] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [details, setDetails] = useState({});
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [contact, setContact] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoadingServices(true);
    cleaningServiceApi
      .listActive()
      .then((res) => {
        const items =
          res?.data?.data ||
          res?.data?.items ||
          res?.data ||
          res?.items ||
          res?.services ||
          res ||
          [];
        setServices(items);
      })
      .catch(() => {
        setServices([]);
      })
      .finally(() => setIsLoadingServices(false));
  }, []);

  const handleChange = (field, delta) => {
    setDetails((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field] || 0) + delta),
    }));
  };

  const handleSelect = (e) => {
    const value = e.target.value;
    setSelectedItem(value);
    if (value && !details[value]) {
      setDetails((prev) => ({ ...prev, [value]: 1 }));
    }
  };

  const priceMap = useMemo(() => {
    const map = {};
    services.forEach((s) => {
      map[s.code || s.value || s.name] = s.currentPrice || s.price || 0;
    });
    return map;
  }, [services]);

  const optionList = useMemo(
    () =>
      services.map((s) => ({
        value: s.code || s.value || s.name,
        label: s.name || s.label || s.code,
        price: s.currentPrice || s.price || 0,
      })),
    [services]
  );

  const totalPrice = Object.entries(details).reduce((acc, [key, qty]) => {
    const price = priceMap[key] || 0;
    return acc + price * qty;
  }, 0);

  const serviceSelections = useMemo(() => {
    const payload = {};
    Object.entries(details).forEach(([code, qty]) => {
      payload[code] = qty;
    });
    return payload;
  }, [details]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!Object.keys(details).length) {
      setError("Select at least one cleaning item.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        services: serviceSelections,
        serviceDate: new Date().toISOString().slice(0, 10),
        paymentFlow: "checkout",
        ...(isAuthenticated
          ? {}
          : {
              firstName: contact.name?.split(" ")[0] || contact.name,
              lastName: contact.name?.split(" ").slice(1).join(" ") || "",
              email: contact.email,
              phoneNumber: contact.phone,
            }),
        notes: specialRequest,
      };

      const res = await quoteApi.createIntent(payload);
      navigate("/services/residential/complete-booking", {
        state: {
          details,
          totalPrice,
          intent: res,
          contact: isAuthenticated
            ? {
                name: user?.fullName,
                email: user?.email,
                phone: user?.phoneNumber || user?.phone,
                address: user?.address,
              }
            : contact,
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not create quote. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-12 px-4 md:px-8 lg:px-20 bg-gray-50">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center text-gray-900">
          Request an Instant Quote
        </h1>
        <p className="text-lg md:text-xl mb-8 text-center text-gray-700 max-w-3xl">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <form
          className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg space-y-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Contact info (only for guests) */}
          {!isAuthenticated ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="name" className="mb-1 font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contact.name}
                    onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="address"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={contact.address}
                    onChange={(e) => setContact((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Enter your address"
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="phone"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contact.email}
                    onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700">
              Using your account details:
              <div className="mt-2 flex flex-col sm:flex-row sm:gap-6">
                <div>
                  <span className="font-semibold">Name:</span> {user?.fullName || "-"}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {user?.email || "-"}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span>{" "}
                  {user?.phoneNumber || user?.phone || "-"}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{" "}
                  {user?.address || "-"}
                </div>
              </div>
            </div>
          )}

          {/* Cleaning Options */}
          <div className="flex flex-col">
            <label
              htmlFor="cleaning-options"
              className="mb-1 font-medium text-gray-700"
            >
              Cleaning Options
            </label>
            <select
              id="cleaning-options"
              value={selectedItem}
              onChange={handleSelect}
              disabled={isLoadingServices || optionList.length === 0}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344] disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingServices ? "Loading services..." : "Select Cleaning Option"}
              </option>
              {optionList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} {item.price ? `($${item.price})` : ""}
                </option>
              ))}
            </select>
            {optionList.length === 0 && !isLoadingServices && (
              <p className="text-sm text-red-600 mt-2">
                No cleaning services available. Please try again later.
              </p>
            )}
          </div>

          {/* Special Request */}
          <div className="flex flex-col">
            <label
              htmlFor="special-request"
              className="mb-1 font-medium text-gray-700"
            >
              Special Request
            </label>
            <textarea
              id="special-request"
              cols="30"
              rows="4"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Write your request here..."
              className="p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>

          {/* Cleaning Details */}
          {Object.keys(details).length > 0 && (
            <div className="p-6 border border-gray-200 rounded-lg space-y-4 mt-6 bg-gray-50">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Cleaning Details
              </h2>
              {Object.entries(details).map(([key, value]) => {
                const item = optionList.find((i) => i.value === key);
                return (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-200 py-2"
                  >
                    <span className="font-medium text-gray-800">
                      {item?.label || key}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange(key, -1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{value}</span>
                      <button
                        type="button"
                        onClick={() => handleChange(key, 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center font-bold text-lg mt-4 text-gray-900">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoadingServices}
            className="w-full bg-[#C85344] text-white p-4 rounded-lg hover:bg-[#b84335] transition font-medium text-lg mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Get a Quote"}
          </button>
        </form>
      </div>
    </>
  );
}

export default ResidentialCleaning;
