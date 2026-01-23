import React from 'react';
import serviceImage1 from "../../assets/images/serviceImage1.jpg";
import serviceImage2 from "../../assets/images/serviceImage2.jpg";
import serviceImage3 from "../../assets/images/serviceImage3.jpg";

function Services() {
  return (
    <div className="px-5 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Services</h1>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-start gap-6">
        {/* Card 1 */}
        <div className="flex flex-col space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[300px] md:w-[350px] lg:w-[450px]">
          <img src={serviceImage1} alt="Service" className="h-[280px] w-full object-cover rounded" />
          <h2 className="text-2xl font-bold text-center">Our Team</h2>
          <p className="text-lg text-center">
            Our mission is to provide the highest quality cleaning services to our clients, ensuring their homes and offices are spotless and germ-free.
          </p>
          <button className="bg-[#C85344] text-white px-5 py-2 rounded mx-auto">
            Book Residential
          </button>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[300px] md:w-[350px] lg:w-[450px]">
          <img src={serviceImage2} alt="Service" className="h-[280px] w-full object-cover rounded" />
          <h2 className="text-2xl font-bold text-center">Our Goal</h2>
          <p className="text-lg text-center">
            Our vision is to be the leading provider of cleaning services in the industry, delivering exceptional results to our clients and setting new standards for excellence.
          </p>
          <button className="bg-[#C85344] text-white px-5 py-2 rounded mx-auto">
            Book Commercial
          </button>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[300px] md:w-[350px] lg:w-[450px]">
          <img src={serviceImage3} alt="Service" className="h-[280px] w-full object-cover rounded" />
          <h2 className="text-2xl font-bold text-center">Our Commitment</h2>
          <p className="text-lg text-center">
            Our values are integrity, quality, and customer satisfaction. We believe in providing the best possible service to our clients and delivering exceptional results.
          </p>
          <button className="bg-[#C85344] text-white px-5 py-2 rounded mx-auto">
            Book Commercial
          </button>
        </div>
      </div>
    </div>
  );
}

export default Services;
