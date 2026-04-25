import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/images/heroImage.webp";

function Hero() {
  const navigate = useNavigate();

  const handleGetQuote = () => {
    navigate("/services/residential");
  };

  const handleViewServices = () => {
    document
      .getElementById("services-overview")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="bg-[#F7E5E3] w-full">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center py-12 lg:py-24">
        <div className="lg:w-1/2 px-6 lg:px-12 space-y-6 lg:text-left z-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#C85344]">
              Superfly Services
            </p>
            <p className="text-lg font-medium text-[#8f3529]">
              Where Clean Takes Flight
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Professional Cleaning Services in Columbus, Ohio
          </h1>
          <p className="text-lg sm:text-xl text-gray-700">
            Superfly Services provides reliable residential, commercial, and
            post-construction cleaning services in Columbus and surrounding
            areas. Our experienced team delivers spotless results so you can
            enjoy a cleaner, healthier space.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleGetQuote}
              className="px-8 py-3 bg-[#C85344] text-white font-semibold rounded-lg hover:bg-[#b54538] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get a Free Quote
            </button>
            <button
              onClick={handleViewServices}
              className="px-8 py-3 bg-white text-[#C85344] font-semibold rounded-lg border-2 border-[#C85344] hover:bg-[#C85344] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View Our Services
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 relative mb-8 lg:mb-0">
          <img
            src={heroImage}
            alt="Professional cleaning service team"
            width="1600"
            height="1067"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full lg:ml-[-5%] rounded-lg object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
