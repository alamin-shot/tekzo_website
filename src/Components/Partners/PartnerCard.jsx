import React from "react";
import Title2 from "../ReuseableComponent/Title2";
import Link from "next/link";

const PartnerCard = () => {
  const partnerData = [
    {
      title: "B2B",
      desc: "Driving growth through business-to-business solutions.",
      icon: "👥", // Replace with your SVG icons
      color: "from-[#07de5d] to-[#00642F]",
      hasPolicy: true,
      link: "/partners/b2b-register",
    },
    {
      title: "Dealership",
      desc: "Your trusted partner for premium products and seamless services.",
      icon: "🤝",
      color: "from-[#8E8FF5] to-[#292A78]",
      hasPolicy: true,
      link: "/partners/become-a-dealer",
    },
    {
      title: "Retailer",
      desc: "Elevating shopping experiences, one product at a time.",
      icon: "🏪",
      color: "from-[#CF8A05] to-[#893603]",
      hasPolicy: true,
      link: "/partners/retailer",
    },
    {
      title: "Franchise",
      desc: "Elevating shopping experiences, one product at a time.",
      icon: "🏢",
      color: "from-[#F10402] to-[#4B341D]",
      hasPolicy: false,
      link: "/partners/franchise",
    },
    {
      title: "Corporate Order",
      desc: "Tailored solutions for your business needs.",
      icon: "🏢",
      color: "from-[#7A7A7A] to-[#202020]",
      hasPolicy: false,
      link: "/partners/corporate",
    },
  ];

  return (
    <section className=" bg-white min-h-screen text-[#07de5d]">
      <div className="">
        {/* Header Section */}
        <div className="text-center mb-24">
          <Title2>Become a Valued Partner</Title2>
          <p className="text-base text-gray-500">
            Grow Your Business with TEKZO.
          </p>
          <p className="text-base text-gray-500">
            Your Next Big Business Move.
          </p>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-14  lg:gap-x-10  lg:gap-y-24 justify-center">
          {partnerData.map((item, index) => (
            <div
              key={index}
              className={`relative bg-dark rounded-3xl lg:rounded-[40px] p-2 lg:p-12 pt-12 pb-6 lg:pt-16 flex flex-col items-center justify-between transition-all duration-300 hover:shadow-xl ${
                index >= 3
                  ? "lg:translate-x-1/2"
                  : "" /* Centers the bottom two on desktop */
              }`}
            >
              {/* Floating Icon Circle */}
              <div
                className={`absolute -top-8 lg:-top-10 w-14 h-14  lg:w-20 lg:h-20  rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl lg:text-4xl shadow-xl`}
              >
                {item.icon}
              </div>

              <h3 className="text-xl lg:text-3xl xl:text-4xl font-medium text-[#6c757d] mb-4 xl:mb-8 whitespace-nowrap">
                {item.title}
              </h3>

              <p className="text-center text-gray-500 text-[8px] lg:text-base xl:text-lg leading-relaxed mb-6 lg:mb-12">
                {item.desc}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-1 lg:gap-4 mt-auto w-full">
                <Link
                  href={item.link}
                  className="bg-[#00b551] hover:bg-[#00a249] text-center  text-white text-xs lg:text-sm py-1 lg:py-2 rounded-lg  font-normal  lg:font-semibold transition-colors min-w-[100px] lg:min-w-[120px] cursor-pointer"
                >
                  Apply
                </Link>
                {item.hasPolicy && (
                  <button className="bg-[#ffae2c] hover:bg-[#f9a51d] text-white text-xs lg:text-sm  py-1 lg:py-2 rounded-lg  font-normal  lg:font-semibold transition-colors min-w-[100px] lg:min-w-[120px] cursor-pointer">
                    See Policy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerCard;
