"use client";

import Lottie from "lottie-react";
import waveAnimation from "../../assets/lottie/water-wave.json";
import robotAssistant from "../../assets/lottie/robot-assistant.json";

// Split out from Footer so lottie-react (and its ~25MB lottie-web runtime)
// plus the animation JSON only ship as a separate, non-blocking chunk,
// instead of bloating every page's initial JS bundle for a decorative,
// below-the-fold background effect.
export default function FooterAnimations() {
  return (
    <div className="absolute inset-0 pointer-events-none -z-10">
      {/* water wave animation */}
      <div className="absolute -bottom-2 w-full left-0 hidden md:block">
        <Lottie
          animationData={waveAnimation}
          loop={true}
          autoplay={true}
          className="w-full h-full opacity-40"
        />
      </div>
      {/* robot animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
        <Lottie
          animationData={robotAssistant}
          loop={true}
          autoplay={true}
          className="w-[320px] h-auto opacity-70 lg:mr-45"
        />
      </div>
    </div>
  );
}
