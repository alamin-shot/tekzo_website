"use client";
import React from "react";

const AboutSectionHeading = ({ children }) => {
  return (
    <div className="mb-4 lg:mb-8">
      <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-3 lg:mb-4 capitalize tracking-tight">{children}</h2>
      <div className="w-16 lg:w-20 h-1.5 bg-secondary rounded-full"></div>
    </div>
  );
};

export default AboutSectionHeading;
