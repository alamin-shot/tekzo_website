import OrderStatusList from "@/Components/Dashboard/OrderStatusList";

export default function ConfirmedOrdersPage() {
  return <OrderStatusList statusCode={4} title="Confirmed Orders" />;
}
