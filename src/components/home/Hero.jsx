import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/images/heroImage.jpg";

function Hero() {
  const navigate = useNavigate();

  const handleGetQuote = () => {
    navigate("/services/residential");
  };

  const handleViewServices = () => {
    navigate("/services");
  };

  return (
    <section className="bg-[#F7E5E3] w-full">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center py-12 lg:py-24">
        {/* Text & Buttons */}
        <div className="lg:w-1/2 px-6 lg:px-12 space-y-6 lg:text-left z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Professional Cleaning Services for Every Space
          </h1>
          <p className="text-lg sm:text-xl text-gray-700">
            Experience the difference with our professional cleaning services.
            We offer a wide range of cleaning solutions to keep your home and
            office looking its best.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleGetQuote}
              className="px-8 py-3 bg-[#C85344] text-white font-semibold rounded-lg hover:bg-[#b54538] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get a Quote
            </button>
            <button
              onClick={handleViewServices}
              className="px-8 py-3 bg-white text-[#C85344] font-semibold rounded-lg border-2 border-[#C85344] hover:bg-[#C85344] hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View Services
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="lg:w-1/2 relative mb-8 lg:mb-0">
          <img
            src={heroImage}
            alt="Professional cleaning service team"
            className="w-full lg:ml-[-5%] rounded-lg object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;