import OrderStatusList from "@/Components/Dashboard/OrderStatusList";

export default function CancelledOrdersPage() {
  return <OrderStatusList statusCode={3} title="Cancelled Orders" />;
}
