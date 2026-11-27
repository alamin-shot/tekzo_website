"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// lottie-react (and its lottie-web runtime) only ships when this page is
// actually visited, instead of getting hoisted into the shared/common
// chunk that loads on every route.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function ClientNotFoundContent() {
  const [animationData, setAnimationData] = useState<unknown>(null);

  // The animation JSON (~627KB raw) must be loaded client-side via a
  // dynamic import, not passed in as a server-component prop — passing it
  // as a prop forces Next.js to serialize the entire object into the RSC
  // flight payload of every page that keeps this boundary "warm".
  useEffect(() => {
    import("../assets/lottie/not-found.json").then((mod) => setAnimationData(mod.default));
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Lottie Animation Container */}
      <div className="w-full max-w-125">{animationData ? <Lottie animationData={animationData} loop={true} autoplay={true} /> : null}</div>
    </div>
  );
}
