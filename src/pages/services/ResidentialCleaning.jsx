import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../state/useAuthStore";
import { useQuoteStore } from "../../state/useQuoteStore";
import { cleaningServiceApi } from "../../services/cleaningServiceApi";
import { formatTimeTo12Hour, parseTimeTo24Hour } from "../../lib/time-utils";

function ResidentialCleaning() {
  const homeownerBenefits = [
    "Reliable and professional cleaning team",
    "Easy online booking and transparent pricing",
    "Detailed, high-quality residential cleaning",
    "Serving Columbus and Central Ohio",
  ];

  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));
  const {
    createCheckoutIntent,
    isCreating,
    error: quoteError,
    resetQuote,
  } = useQuoteStore((state) => ({
    createCheckoutIntent: state.createCheckoutIntent,
    isCreating: state.isCreating,
    error: state.error,
    resetQuote: state.resetQuote,
  }));

  const [services, setServices] = useState([]);
  const [details, setDetails] = useState({});
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [serviceDate, setServiceDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [serviceTime, setServiceTime] = useState("09:00");
  const [serviceTimeInput, setServiceTimeInput] = useState(() =>
    formatTimeTo12Hour("09:00")
  );
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

  const toggleService = (service) => {
    const code = service.code || service.value || service.name;
    setDetails((prev) => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
        return next;
      }
      next[code] = service.inputType === "QUANTITY" ? 1 : 1;
      return next;
    });
  };

  const handleQuantityChange = (service, value) => {
    const code = service.code || service.value || service.name;
    const qty = Math.max(1, Number(value) || 1);
    setDetails((prev) => ({ ...prev, [code]: qty }));
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
        inputType: s.inputType || "BOOLEAN",
        quantityLabel: s.quantityLabel,
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
      if (qty > 0) {
        payload[code] = qty;
      }
    });
    return payload;
  }, [details]);

  const handleServiceTimeBlur = () => {
    const normalized = parseTimeTo24Hour(serviceTimeInput);
    if (normalized) {
      setServiceTime(normalized);
      setServiceTimeInput(formatTimeTo12Hour(normalized));
      return;
    }
    setServiceTimeInput(formatTimeTo12Hour(serviceTime));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    resetQuote();
    if (!Object.keys(serviceSelections).length) {
      setError("Select at least one cleaning item.");
      return;
    }
    if (!serviceDate) {
      setError("Please choose a service date.");
      return;
    }
    const normalizedServiceTime = parseTimeTo24Hour(serviceTimeInput);
    if (!normalizedServiceTime) {
      setError("Please enter a valid service time.");
      return;
    }
    setServiceTime(normalizedServiceTime);
    setServiceTimeInput(formatTimeTo12Hour(normalizedServiceTime));
    setIsSubmitting(true);
    try {
      const fullName =
        user?.fullName?.trim() ||
        user?.name?.trim() ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
      const parsedFirst = fullName?.split(" ")[0] || "Customer";
      const parsedLast =
        fullName?.split(" ").slice(1).join(" ").trim() ||
        user?.lastName ||
        parsedFirst;

      const payload = {
        services: serviceSelections,
        serviceDate,
        preferredTime: normalizedServiceTime,
        paymentFlow: "checkout",
        businessAddress: isAuthenticated ? user?.address : contact.address,
        ...(isAuthenticated
          ? {
              firstName: parsedFirst,
              lastName: parsedLast,
              email: user?.email,
              phoneNumber: user?.phoneNumber || user?.phone,
            }
          : {
              firstName: contact.name?.split(" ")[0] || contact.name,
              lastName: contact.name?.split(" ").slice(1).join(" ") || "",
              email: contact.email,
              phoneNumber: contact.phone,
            }),
        notes: specialRequest,
      };

      const res = await createCheckoutIntent(payload);

      if (res?.flow === "checkout" && res?.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
        return;
      }

      setError("Unexpected payment flow. Please try again.");
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
          What to Expect After Your Quote
        </h1>
        <p className="text-lg md:text-xl mb-8 text-center text-gray-700 max-w-3xl">
          Once you submit your information, you'll receive an instant estimated
          price for your cleaning service. Our team will review your details
          and follow up to confirm your appointment and ensure everything is
          tailored to your needs.
        </p>

        <form
          className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg space-y-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
              {quoteError ? ` (${quoteError})` : ""}
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
                    placeholder="(555) 123-4567"
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

          {/* Service Date */}
          <div className="flex flex-col">
            <label htmlFor="service-date" className="mb-1 font-medium text-gray-700">
              Preferred Service Date
            </label>
            <input
              type="date"
              id="service-date"
              value={serviceDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setServiceDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="service-time" className="mb-1 font-medium text-gray-700">
              Preferred Service Time
            </label>
            <input
              type="text"
              id="service-time"
              value={serviceTimeInput}
              onChange={(e) => setServiceTimeInput(e.target.value)}
              onBlur={handleServiceTimeBlur}
              placeholder="09:00 AM"
              inputMode="numeric"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>

          {/* Cleaning Options */}
          <div className="flex flex-col gap-3">
            <label className="mb-1 font-medium text-gray-700">
              Cleaning Options
            </label>
            {isLoadingServices ? (
              <p className="text-gray-600">Loading services...</p>
            ) : optionList.length === 0 ? (
              <p className="text-sm text-red-600">
                No cleaning services available. Please try again later.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optionList.map((item) => {
                  const selected = details[item.value] !== undefined;
                  return (
                    <div
                      key={item.value}
                      className={`rounded-lg border p-4 flex flex-col gap-2 ${
                        selected ? "border-[#C85344] bg-[#fff6f4]" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleService(item)}
                          className="mt-1 h-5 w-5 accent-[#C85344]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              {item.label}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              ${item.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {item.inputType === "QUANTITY"
                              ? item.quantityLabel || "Enter quantity"
                              : "Check to add"}
                          </p>
                        </div>
                      </div>
                      {selected && item.inputType === "QUANTITY" && (
                        <div className="flex items-center gap-2 pl-8">
                          <label className="text-sm text-gray-700">
                            {item.quantityLabel || "Quantity"}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={details[item.value] ?? 1}
                            onChange={(e) => handleQuantityChange(item, e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-sm focus:border-[#C85344] focus:outline-none focus:ring-1 focus:ring-[#C85344]/40"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">
                        {item?.label || key}
                      </span>
                      <span className="text-xs text-gray-500">
                        ${priceMap[key] || 0}
                        {item?.inputType === "QUANTITY" ? " each" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item?.inputType === "QUANTITY" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item, (value || 1) - 1)
                            }
                            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{value}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item, (value || 1) + 1)
                            }
                            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">Selected</span>
                      )}
                      <span className="w-20 text-right font-semibold text-gray-900">
                        ${((priceMap[key] || 0) * (value || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center font-bold text-lg mt-4 text-gray-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isCreating || isLoadingServices}
            className="w-full bg-[#C85344] text-white p-4 rounded-lg hover:bg-[#b84335] transition font-medium text-lg mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting || isCreating
              ? "Redirecting to checkout..."
              : "Get Your Instant Quote"}
          </button>
        </form>

        <div className="mt-12 w-full max-w-4xl space-y-8">
          <section className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">
              Why Homeowners in Columbus Choose Superfly Services
            </h2>
            <ul className="mt-4 space-y-3 text-lg text-gray-700">
              {homeownerBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-1 text-[#C85344]">+</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">
              What's Included in Our Residential Cleaning
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              Our residential cleaning services cover kitchens, bathrooms,
              bedrooms, living areas, and common spaces. We focus on dusting,
              sanitizing, vacuuming, and detailed cleaning to keep your home
              fresh and spotless.
            </p>
          </section>

          <section className="rounded-lg border border-[#f0c7c1] bg-[#fff6f4] p-6 text-base text-gray-700">
            Prices are estimates based on the information provided. Final
            pricing may vary depending on the condition of the home and
            specific cleaning requirements.
          </section>

          <section className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">
              Ready for a Cleaner Home?
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              Get your instant quote today and let Superfly Services handle the
              cleaning so you can enjoy a fresh, stress-free home.
            </p>
          </section>

          <p className="text-center text-base leading-7 text-gray-600">
            Superfly Services provides professional residential cleaning
            services throughout Columbus, Ohio and surrounding areas, helping
            homeowners maintain clean and comfortable living spaces.
          </p>
        </div>
      </div>
    </>
  );
}

export default ResidentialCleaning;
