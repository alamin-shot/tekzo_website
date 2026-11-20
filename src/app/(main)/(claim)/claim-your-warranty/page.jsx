import { buildMetadata } from "@/utils/buildMetadata";
import { getSeoPage } from "@/lib/api";
import ClaimWarranty from "@/Components/Claim/ClaimWarranty";

export async function generateMetadata() {
  const seo = await getSeoPage("claim-your-warranty");
  return buildMetadata(seo, 'claim-your-warranty', "/loginPage/contact-about-bg.webp");
}

export default async function Page() {
  const seoData = await getSeoPage("claim-your-warranty");
  return <ClaimWarranty seoData={seoData}/>;
}
