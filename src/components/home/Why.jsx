import React from "react";
import what1 from "../../assets/what1.svg";
import what2 from "../../assets/what2.svg";
import what3 from "../../assets/what3.svg";

function Why() {
  return (
    <div className="px-5 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">Why Choose Us</h1>

      <p className="text-xl text-center mb-10">
        Experience the difference with our professional cleaning services. We
        offer a wide range of cleaning solutions to keep your home and office
        looking its best.
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-start gap-6">
        {/* Card 1 */}
        <div className="flex flex-col justify-center items-center space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[280px] md:w-[350px] lg:w-[450px]">
          <img
            className="shadow-lg rounded-full w-20 h-20"
            src={what1}
            alt="Our Team"
          />
          <h2 className="text-2xl font-bold text-center">Our Team</h2>
          <p className="text-lg text-center">
            Our mission is to provide the highest quality cleaning services to
            our clients, ensuring their homes and offices are spotless and
            germ-free.
          </p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-center items-center space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[280px] md:w-[350px] lg:w-[450px]">
          <img
            className="shadow-lg rounded-full w-20 h-20"
            src={what2}
            alt="Our Goal"
          />
          <h2 className="text-2xl font-bold text-center">Our Goal</h2>
          <p className="text-lg text-center">
            Our vision is to be the leading provider of cleaning services in the
            industry, delivering exceptional results to our clients and setting
            new standards for excellence.
          </p>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-center items-center space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[280px] md:w-[350px] lg:w-[450px]">
          <img
            className="shadow-lg rounded-full w-20 h-20"
            src={what3}
            alt="Our Commitment"
          />
          <h2 className="text-2xl font-bold text-center">Our Commitment</h2>
          <p className="text-lg text-center">
            Our values are integrity, quality, and customer satisfaction. We
            believe in providing the best possible service to our clients and
            delivering exceptional results.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Why;
