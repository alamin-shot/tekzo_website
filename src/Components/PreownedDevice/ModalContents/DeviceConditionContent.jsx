"use client";

import { useState } from "react";

export default function DeviceConditionContent() {
  const [activeTab, setActiveTab] = useState("fair");

  const conditionData = {
    fair: {
      color: "teal",
      howItLooks: {
        screen:
          "Scratches can be appeared which is slightly visible within 8-10 inches of eyesight.",
        body: "The device has visible scratches or dents.",
      },
      technicalCondition:
        "All our devices are 100% functional which is guaranteed. Any kind of issue in technical condition will fall under our 12-months limited warranty.",
      features: [
        { icon: "📱", text: "Fully functional device" },
        { icon: "✓", text: "Minor cosmetic wear" },
        { icon: "🔋", text: "80%+ battery health" },
        { icon: "📦", text: "Original accessories included (Limited Device)" },
      ],
    },
    good: {
      color: "blue",
      howItLooks: {
        screen:
          "Minor scratches that are barely visible from normal viewing distance.",
        body: "Light signs of use with minimal scratches or marks.",
      },
      technicalCondition:
        "All our devices are 100% functional which is guaranteed. Any kind of issue in technical condition will fall under our 12-months limited warranty.",
      features: [
        { icon: "📱", text: "Excellent functionality" },
        { icon: "✓", text: "Light cosmetic wear" },
        { icon: "🔋", text: "85%+ battery health" },
        { icon: "📦", text: "Original accessories included (Limited Device)" },
      ],
    },
    excellent: {
      color: "purple",
      howItLooks: {
        screen: "Near perfect condition with no visible scratches or marks.",
        body: "Minimal to no signs of use, looks almost brand new.",
      },
      technicalCondition:
        "All our devices are 100% functional which is guaranteed. Any kind of issue in technical condition will fall under our 12-months limited warranty.",
      features: [
        { icon: "📱", text: "Like-new performance" },
        { icon: "✓", text: "Minimal to no wear" },
        { icon: "🔋", text: "90%+ battery health" },
        { icon: "📦", text: "Original accessories included (Limited Device)" },
      ],
    },
  };

  const tabs = [
    { id: "fair", label: "FAIR", color: "teal" },
    { id: "good", label: "GOOD", color: "blue" },
    { id: "excellent", label: "EXCELLENT", color: "purple" },
  ];

  const currentCondition = conditionData[activeTab];
  const currentColor = currentCondition.color;

  const colorClasses = {
    teal: {
      activeBg: "bg-gradient-to-r from-teal-500 to-teal-500",
      activeBorder: "border-teal-400",
      activeText: "text-white",
      inactiveBorder: "border-gray-200",
      inactiveText: "text-gray-600",
      inactiveBg: "bg-white",
      badgeBg: "bg-teal-100",
      badgeText: "text-teal-700",
      iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
    },
    blue: {
      activeBg: "bg-gradient-to-r from-blue-500 to-blue-600",
      activeBorder: "border-blue-400",
      activeText: "text-white",
      inactiveBorder: "border-gray-200",
      inactiveText: "text-gray-600",
      inactiveBg: "bg-white",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-700",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    purple: {
      activeBg: "bg-gradient-to-r from-purple-500 to-purple-600",
      activeBorder: "border-purple-400",
      activeText: "text-white",
      inactiveBorder: "border-gray-200",
      inactiveText: "text-gray-600",
      inactiveBg: "bg-white",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-700",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const colors = colorClasses[tab.color];

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-[140px] px-6 py-3.5 rounded-xl text-sm font-bold 
                transition-all duration-300 border-2
                hover:scale-105 active:scale-95 shadow-md
                ${isActive ? `${colors.activeBg} ${colors.activeBorder} ${colors.activeText}` : `${colors.inactiveBg} ${colors.inactiveBorder} ${colors.inactiveText} hover:${colors.activeBorder}`}
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area with Animation */}
      <div key={activeTab} className="space-y-5 animate-[fadeIn_0.3s_ease]">
        {/* How it'll look Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">👁️</span>
            How it&apos;ll look:{" "}
            <span
              className={`px-3 py-1 rounded-lg text-sm ${colorClasses[currentColor].badgeBg} ${colorClasses[currentColor].badgeText}`}
            >
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </h3>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Screen
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentCondition.howItLooks.screen}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Body
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentCondition.howItLooks.body}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Condition Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-5 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            Technical condition:{" "}
            <span
              className={`px-3 py-1 rounded-lg text-sm ${colorClasses[currentColor].badgeBg} ${colorClasses[currentColor].badgeText}`}
            >
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </h3>

          <p className="text-sm text-gray-700 leading-relaxed">
            {currentCondition.technicalCondition}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentCondition.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div
                className={`w-10 h-10 ${colorClasses[currentColor].iconBg} rounded-lg flex items-center justify-center text-lg shrink-0 shadow-md`}
              >
                {feature.icon}
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Tekzo Care Badge */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-700 rounded-lg flex items-center justify-center shrink-0 shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                Tekzo Care Protection
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every pre-owned device includes Tekzo Care - comprehensive
                protection with hassle-free claims, quick replacements, and
                dedicated support for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
