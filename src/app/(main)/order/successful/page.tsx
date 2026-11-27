import Banner from "@/Components/ReuseableComponent/Banner";
import OrderSuccessClient from "@/Components/OrderSuccess/OrderSuccessClient";
import type { SearchPageProps } from "@/types/route";
const OrderSuccess = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams;
  const invoiceNumber = params?.invoice_number || null;
  return (
    <main className="min-h-screen bg-gray-50/50">
      <Banner
        image="/all-product-banner.webp"
        title="Order Placed Successfully"
      />
    <OrderSuccessClient invoiceNumber={invoiceNumber} />
    </main>
  );
};

export default OrderSuccess;
