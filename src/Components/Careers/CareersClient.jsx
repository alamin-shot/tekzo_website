"use client";

import { useState } from "react";
import JobCircular from "@/Components/Careers/JobCircular";
import TeamMembers from "@/Components/Careers/TeamMembers";
import Title2 from "@/Components/ReuseableComponent/Title2";

export default function CareersClient({ jobs, teams }) {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="relative flex bg-dark p-0.5 rounded-full mb-6 my-4 lg:my-8 max-w-md mx-auto">
        <div
          className={`absolute top-0 bottom-0 left-0 w-[50%] bg-primary rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
            activeTab === 1 ? "translate-x-0" : "translate-x-full"
          }`}
        />
        <button
          onClick={() => setActiveTab(1)}
          className={`relative z-10 flex-1 py-2 text-sm transition-colors duration-200 cursor-pointer ${
            activeTab === 1 ? "text-white" : "text-gray-500"
          }`}
        >
          Job Circular
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`relative z-10 flex-1 py-2 text-sm transition-colors duration-200 cursor-pointer ${
            activeTab === 2 ? "text-white" : "text-gray-500"
          }`}
        >
          Our Team
        </button>
      </div>

      <div className="lg:pb-4">
        {activeTab === 1 ? (
          <Title2>Diversified Job Openings To Apply</Title2>
        ) : (
          <Title2>Meet the people behind our excellence</Title2>
        )}
      </div>

      {/* Content Area */}
      <div className="relative">
        <div
          className={`transition-all duration-500 ease-in-out ${
            activeTab === 1
              ? "relative opacity-100 translate-x-0"
              : "absolute inset-0 opacity-0 -translate-x-12 pointer-events-none"
          }`}
        >
          <JobCircular jobs={jobs} />
        </div>

        <div
          className={`transition-all duration-500 ease-in-out ${
            activeTab === 2
              ? "relative opacity-100 translate-x-0"
              : "absolute inset-0 opacity-0 translate-x-12 pointer-events-none"
          }`}
        >
          <TeamMembers teams={teams} />
        </div>
      </div>
    </div>
  );
}
