import { buildMetadata } from "@/utils/buildMetadata";
import { getSeoPage } from "@/lib/api";
import HowToClaimClient from "@/Components/Claim/HowToClaimClient";

export async function generateMetadata() {
  const seo = await getSeoPage("how-to-claim");
  return buildMetadata(seo, "how-to-claim", "/loginPage/contact-about-bg.webp");
}

export default async function HowToClaim() {
  const seoData = await getSeoPage("how-to-claim");
  return <HowToClaimClient seoData={seoData} />;
}
