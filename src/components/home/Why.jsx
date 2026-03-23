import React from "react";
import { FiCheckCircle, FiLayers, FiMapPin, FiShield } from "react-icons/fi";

function Why() {
  const reasons = [
    {
      eyebrow: "Trusted team",
      icon: FiShield,
      title: "Reliable Cleaning Professionals",
      body:
        "Our experienced team takes pride in delivering thorough, detail-focused cleaning services you can rely on. We show up on time and ensure every space is cleaned to a high standard.",
    },
    {
      eyebrow: "Full coverage",
      icon: FiLayers,
      title: "Complete Cleaning Solutions",
      body:
        "From residential cleaning to commercial facility cleaning and post-construction cleanup, we provide full cleaning support tailored to your needs. Businesses trust us to handle the entire cleaning process so managers and staff can focus on their work.",
    },
    {
      eyebrow: "Local service",
      icon: FiMapPin,
      title: "Serving Central Ohio",
      body:
        "Superfly Services proudly provides professional cleaning services throughout Columbus and Central Ohio, helping homeowners, businesses, and contractors maintain clean and healthy environments.",
    },
    {
      eyebrow: "High standards",
      icon: FiCheckCircle,
      title: "Attention to Detail",
      body:
        "We believe great cleaning is about consistency and care. Our team focuses on the small details that make a big difference in the appearance and cleanliness of your space.",
    },
  ];

  return (
    <section className="px-5 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold text-center">Why Choose Us</h1>

        <p className="text-lg leading-8 text-gray-700 md:text-xl">
          At Superfly Services, we provide dependable and professional cleaning
          services for homes, businesses, and construction projects throughout
          Central Ohio. Our goal is simple - deliver consistent, high-quality
          cleaning so our clients can focus on what matters most.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {reasons.map((reason) => (
          <article
            key={reason.title}
            className="group relative overflow-hidden rounded-[28px] border border-[#E9D6D2] bg-gradient-to-b from-white via-white to-[#FFF7F5] p-7 text-center shadow-[0_18px_45px_-32px_rgba(15,23,42,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D8B5AF] hover:shadow-[0_28px_60px_-34px_rgba(200,83,68,0.28)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#C85344] via-[#E5A298] to-[#F7E5E3]" />
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FDF1EE] blur-2xl transition-transform duration-300 group-hover:scale-110" />

            <div className="relative flex h-full flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-[#C85344] shadow-[0_16px_30px_-22px_rgba(15,23,42,0.4)] ring-1 ring-[#F0DBD6] transition-transform duration-300 group-hover:scale-105">
                <reason.icon className="h-9 w-9" aria-hidden="true" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#C85344]">
                {reason.eyebrow}
              </p>
              <h2 className="mt-3 text-[2rem] font-bold leading-tight text-gray-900">
                {reason.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-700">
                {reason.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Why;
