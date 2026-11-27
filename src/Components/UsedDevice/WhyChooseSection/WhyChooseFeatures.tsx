import React from "react";
import {
  FaShieldAlt,
  FaSyncAlt,
  FaCertificate,
  FaTruck,
  FaMobileAlt,
  FaLeaf,
} from "react-icons/fa";

const features = [
  {
    icon: FaShieldAlt,
    title: "WARRANTY",
    description: "12-months warranty",
    color: "#18ac8f",
  },
  {
    icon: FaSyncAlt,
    title: "REPLACEMENT",
    description: "15-Days Replacement",
    color: "#18ac8f",
  },
  {
    icon: FaCertificate,
    title: "CERTIFIED",
    description: "Verified product listing",
    color: "#18ac8f",
  },
  {
    icon: FaTruck,
    title: "TRACK",
    description: "Track your order",
    color: "#18ac8f",
  },
  {
    icon: FaMobileAlt,
    title: "RANGE",
    description: "Vast Range of Device",
    color: "#18ac8f",
  },
  {
    icon: FaLeaf,
    title: "GREENER",
    description: "For a Greener Future",
    color: "#18ac8f",
  },
];

export default function WhyChooseFeatures() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-secondary/30 group"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors duration-300"
              style={{
                background: `${feature.color}15`,
              }}
            >
              <feature.icon
                className="text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ color: feature.color }}
              />
            </div>
            <div>
              <h3
                className="font-bold text-sm md:text-base mb-1 uppercase tracking-wide"
                style={{ color: feature.color }}
              >
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
