import React from "react";
import avatar1 from "../../assets/images/avatar1.jpg";

function What() {
  return (
    <div className="px-5 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">What our customers say</h1>
      <p className="text-xl text-center mb-10">
        Experience the difference with our professional cleaning services. We
        offer a wide range of cleaning solutions to keep your home and office
        looking its best.
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-start gap-6">
        {/* Review Card 1 */}
        <div className="flex flex-col space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[280px] md:w-[350px] lg:w-[450px]">
          <div className="flex items-start gap-3">
            <img src={avatar1} className="w-[50px] h-[50px] rounded-full" alt="avatar" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-2xl font-bold">John Doe</h2>
              <div className="flex text-yellow-500 text-xl">★★★★★</div>
            </div>
          </div>
          <p className="text-lg">
            Our mission is to provide the highest quality cleaning services to
            our clients, ensuring their homes and offices are spotless and
            germ-free.
          </p>
        </div>

        {/* Review Card 2 */}
        <div className="flex flex-col space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[280px] md:w-[350px] lg:w-[450px]">
          <div className="flex items-start gap-3">
            <img src={avatar1} className="w-[50px] h-[50px] rounded-full" alt="avatar" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-2xl font-bold">Jane Smith</h2>
              <div className="flex text-yellow-500 text-xl">★★★★★</div>
            </div>
          </div>
          <p className="text-lg">
            Our mission is to provide the highest quality cleaning services to
            our clients, ensuring their homes and offices are spotless and
            germ-free.
          </p>
        </div>

        {/* Review Card 3 */}
        <div className="flex flex-col space-y-5 border border-gray-200 rounded-lg p-6 w-full sm:w-[280px] md:w-[350px] lg:w-[450px]">
          <div className="flex items-start gap-3">
            <img src={avatar1} className="w-[50px] h-[50px] rounded-full" alt="avatar" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-2xl font-bold">Mark Wilson</h2>
              <div className="flex text-yellow-500 text-xl">★★★★★</div>
            </div>
          </div>
          <p className="text-lg">
            Our mission is to provide the highest quality cleaning services to
            our clients, ensuring their homes and offices are spotless and
            germ-free.
          </p>
        </div>
      </div>
    </div>
  );
}

export default What;
