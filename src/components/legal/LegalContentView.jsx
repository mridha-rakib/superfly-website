import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { legalContentApi } from "../../services/legalContentApi";

function formatUpdatedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function LegalContentView({ slug, eyebrow, fallbackTitle, intro }) {
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await legalContentApi.getBySlug(slug);
        if (!active) return;
        setPage(response);
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this page right now."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const updatedAt = formatUpdatedAt(page?.updatedAt);

  return (
    <main className="min-h-[calc(100vh-160px)] bg-[radial-gradient(circle_at_top,_rgba(200,83,68,0.12),_transparent_32%),linear-gradient(180deg,_#fffaf8_0%,_#ffffff_48%,_#fff5f2_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[32px] border border-[#efdad4] bg-white/95 p-8 shadow-[0_25px_80px_rgba(122,48,37,0.08)] backdrop-blur sm:p-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b44b3d]">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#1d2433] sm:text-5xl">
              {page?.title || fallbackTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#586174] sm:text-lg">
              {intro}
            </p>
            {updatedAt && (
              <p className="mt-5 inline-flex rounded-full border border-[#f1ddd8] bg-[#fff7f4] px-4 py-2 text-sm font-medium text-[#8b3f33]">
                Last updated {updatedAt}
              </p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#f0e1dc] bg-white p-8 shadow-[0_16px_50px_rgba(16,24,40,0.06)] sm:p-10">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 w-32 rounded-full bg-[#f3ddd8]" />
              <div className="h-4 w-full rounded-full bg-gray-100" />
              <div className="h-4 w-[92%] rounded-full bg-gray-100" />
              <div className="h-4 w-[80%] rounded-full bg-gray-100" />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="text-lg font-semibold">We could not load this page.</p>
              <p className="mt-2 text-sm leading-6">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none whitespace-pre-line text-[#384152]">
                {page?.content}
              </div>
              <div className="flex flex-wrap gap-3 border-t border-[#f2e7e3] pt-6">
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-full bg-[#C85344] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Contact Us
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-full border border-[#d8c5bf] px-5 py-3 text-sm font-semibold text-[#374151] transition hover:border-[#C85344] hover:text-[#C85344]"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default LegalContentView;
