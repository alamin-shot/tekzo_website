import { buildMetadata } from "@/utils/buildMetadata";
import OrderTracking from "@/Components/OrderTracking/OrderTracking";
import { getSeoPage } from "@/lib/api";

export async function generateMetadata() {
  const seo = await getSeoPage("order-tracking");
  return buildMetadata(seo, "order-tracking", "/order-tracking.png");
}

export default async function Page() {
  const seoData = await getSeoPage("order-tracking");
  return <OrderTracking seoData={seoData}/>;
}
