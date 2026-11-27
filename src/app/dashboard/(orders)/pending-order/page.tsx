import OrderStatusList from "@/Components/Dashboard/OrderStatusList";

export default function PendingOrdersPage() {
  return <OrderStatusList statusCode={2} title="Pending Orders" />;
}
