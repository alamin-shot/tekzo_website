import React from "react";
import OurJourney from "./OurJourney";
import SocialMediaPresence from "./SocialMediaPresence";
import { CertificationSection } from "./Certifications";
import OurPartners from "./OurPartners";

const AboutUs = () => {
  return (
    <div className="">
      <OurJourney></OurJourney>
      <SocialMediaPresence></SocialMediaPresence>
      <CertificationSection></CertificationSection>
      <OurPartners></OurPartners>
    </div>
  );
};

export default AboutUs;
