import React from "react";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";
import Image from "next/image";
import MarketPresenceContent from "./MarketPresenceContent";

const MarketPresence = () => {
  return (
    <div className="">
      {/* <div className="">
        <AboutSectionHeading>Our Offline Market Presence</AboutSectionHeading>
        <p className="text-gray-500 text-sm lg:text-lg">
          Bringing Innovation to Your Hands, Everywhere You Go
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 my-gap mt-6 lg:mt-12">
          <Image
            src="/offline-market/distribution-1.webp"
            alt="offline market"
            width={400}
            height={300}
            className="w-full h-auto"
          />
          <Image
            src="/offline-market/retail-1.webp"
            alt="offline market"
            width={400}
            height={300}
            className="w-full h-auto"
          />
          <Image
            src="/offline-market/service-1.webp"
            alt="offline market"
            width={400}
            height={300}
            className="w-full h-auto"
          />
        </div>
        <div className="mt-12 lg:mt-16">
          <p className="text-gray-500 text-sm lg:text-lg">
            TEKZO is a dynamic company specializing in mobile accessories and
            charging solutions. The company operates both online and offline,
            with a strong presence in the digital marketplace. Online sales are
            facilitated through partnerships with leading e-commerce platforms
            in Bangladesh, including Daraz, Pickaboo, Rokomari, Evaly, Swap,
            Othoba and Gprojukti. Customers can conveniently browse and purchase
            TEKZO high-quality mobile accessories through these trusted online
            channels. The extensive online presence ensures accessibility for
            customers across Bangladesh, allowing them to explore and purchase
            products with ease. The company holds essential certifications,
            including a Trade License, DCCI membership certificate, Tax
            Identification Number (TIN), Business Identification Number (BIN),
            and registration with the Registrar of Joint Stock Companies (RJSC).
            These certifications underline Salamat Innovation's commitment to
            operating as a legitimate and reputable business entity.
          </p>
        </div>
      </div> */}
      <MarketPresenceContent></MarketPresenceContent>
    </div>
  );
};

export default MarketPresence;
