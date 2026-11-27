import OrderStatusList from "@/Components/Dashboard/OrderStatusList";

export default function DeliveredOrdersPage() {
  return <OrderStatusList statusCode={7} title="Delivered Orders" />;
}
