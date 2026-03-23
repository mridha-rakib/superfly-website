import React from "react";
import { FiAward, FiTarget, FiUsers } from "react-icons/fi";

function AboutUs() {
  const values = [
    {
      title: "Our team",
      eyebrow: "Dedicated people",
      icon: FiUsers,
      iconLabel: "Team icon",
      body:
        "Our team is made up of reliable, hardworking professionals who take pride in what they do. With attention to detail and a strong work ethic, we work together to deliver the high standards our clients expect.",
    },
    {
      title: "Our goal",
      eyebrow: "Clear direction",
      icon: FiTarget,
      iconLabel: "Goal icon",
      body:
        "Our goal is to become the trusted cleaning company people recommend first when quality and reliability matter, built on a reputation of professionalism, consistency, and results.",
    },
    {
      title: "Our commitment",
      eyebrow: "Quality promise",
      icon: FiAward,
      iconLabel: "Commitment icon",
      body:
        "We're committed to delivering reliable, high-quality cleaning you can count on. Every job is completed with attention to detail, professionalism, and pride in our work.",
    },
  ];

  return (
    <section className="px-5 py-10">
      <h1 className="mb-6 text-center text-4xl font-bold">About Us</h1>

      <div className="mx-auto max-w-5xl space-y-4 text-center">
        <p className="text-lg leading-8 text-gray-700 md:text-xl">
          Superfly Services proudly provides professional cleaning services
          throughout Columbus, Ohio and surrounding communities including
          Westerville, Dublin, Worthington, and Hilliard.
        </p>
        <p className="text-lg leading-8 text-gray-700 md:text-xl">
          Whether you need residential cleaning, office cleaning, or
          post-construction cleanup, our team is committed to delivering
          reliable service and exceptional results.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {values.map((item) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-[28px] border border-[#E9D6D2] bg-gradient-to-b from-white via-white to-[#FFF7F5] p-8 text-center shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D8B5AF] hover:shadow-[0_28px_60px_-32px_rgba(200,83,68,0.35)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#C85344] via-[#E5A298] to-[#F7E5E3]" />

            <div className="relative flex h-full flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F7E5E3] text-[#C85344] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_30px_-24px_rgba(200,83,68,0.7)] ring-1 ring-[#F1D7D2] transition-transform duration-300 group-hover:scale-105">
                <item.icon
                  className="h-9 w-9"
                  aria-hidden="true"
                  title={item.iconLabel}
                />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#C85344]">
                {item.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">
                {item.title}
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                {item.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AboutUs;
