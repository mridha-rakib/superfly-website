import React from "react";
import { FiBriefcase, FiHome, FiTool } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import serviceImage1 from "../../assets/images/serviceImage1.webp";
import serviceImage2 from "../../assets/images/serviceImage2.webp";
import serviceImage3 from "../../assets/images/serviceImage3.webp";

function Services() {
  const navigate = useNavigate();
  const services = [
    {
      image: serviceImage1,
      width: 1200,
      height: 798,
      eyebrow: "Home care",
      icon: FiHome,
      title: "Residential Cleaning",
      body:
        "Reliable home cleaning services designed to keep your space fresh, organized, and spotless. Superfly Services provides professional residential cleaning for homeowners throughout Columbus with attention to detail and consistent results.",
      cta: "Book Residential",
      onClick: () => navigate("/services/residential"),
    },
    {
      image: serviceImage2,
      width: 1200,
      height: 800,
      eyebrow: "Business spaces",
      icon: FiBriefcase,
      title: "Commercial Cleaning",
      body:
        "Superfly Services handles all cleaning tasks so managers and staff can focus on their work. From maintaining a clean facility to managing cleaning supplies, we provide dependable commercial cleaning services for businesses throughout Columbus.",
      cta: "Book Commercial",
      onClick: () => navigate("/services/book-site-visit-commercial"),
    },
    {
      image: serviceImage3,
      width: 900,
      height: 1353,
      eyebrow: "Project turnover",
      icon: FiTool,
      title: "Post-Construction Cleaning",
      body:
        "We remove dust, debris, and construction residue to prepare newly built or renovated spaces for use. Superfly Services provides detailed post-construction cleaning services for contractors, property managers, and homeowners in Columbus.",
      cta: "Book Post-Construction",
      onClick: () =>
        navigate("/services/book-site-visit-post-construction"),
    },
  ];

  return (
    <section id="services-overview" className="px-5 py-12">
      <h1 className="mb-10 text-center text-4xl font-bold">
        Cleaning Services
      </h1>

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className="group overflow-hidden rounded-[30px] border border-[#E8D8D3] bg-gradient-to-b from-white via-white to-[#FFF8F6] shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#DABAB3] hover:shadow-[0_28px_70px_-34px_rgba(200,83,68,0.32)]"
          >
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-[#C85344] via-[#E5A298] to-[#F7E5E3]" />
              <img
                src={service.image}
                alt={service.title}
                width={service.width}
                height={service.height}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1280px) 384px, (min-width: 768px) 50vw, 100vw"
                className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C85344] shadow-lg backdrop-blur">
                <service.icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{service.eyebrow}</span>
              </div>
            </div>

            <div className="flex h-full flex-col p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {service.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                {service.body}
              </p>
              <button
                onClick={service.onClick}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#C85344] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(200,83,68,0.95)] transition-all duration-300 hover:bg-[#b54538] hover:shadow-[0_24px_34px_-20px_rgba(181,69,56,1)]"
              >
                {service.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;
