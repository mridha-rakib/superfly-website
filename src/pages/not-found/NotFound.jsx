import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,_#fff7f4_0%,_#ffffff_45%,_#fff1ec_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[36px] border border-[#f0ddd7] bg-white/95 p-8 shadow-[0_28px_90px_rgba(122,48,37,0.08)] sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b44b3d]">
            Error 404
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-[#1d2433] sm:text-6xl">
            This page did not make the schedule.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5b6578]">
            The page you requested does not exist, may have moved, or the link
            was entered incorrectly. Use one of the routes below to get back to
            an active page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-full bg-[#C85344] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Go Home
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-[#d8c5bf] px-6 py-3 text-sm font-semibold text-[#374151] transition hover:border-[#C85344] hover:text-[#C85344]"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#fff6f3] p-6">
          <div className="rounded-[24px] border border-[#f1dbd5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between rounded-2xl bg-[#1d2433] px-5 py-4 text-white">
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">
                Superfly
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                Active Routes
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Home", to: "/" },
                { label: "Residential Cleaning", to: "/services/residential" },
                { label: "Commercial Booking", to: "/services/book-site-visit-commercial" },
                { label: "Reviews", to: "/reviews" },
                { label: "Privacy Policy", to: "/privacy-policy" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between rounded-2xl border border-[#f2e5e1] px-4 py-3 text-sm font-medium text-[#374151] transition hover:border-[#C85344] hover:text-[#C85344]"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">+</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
