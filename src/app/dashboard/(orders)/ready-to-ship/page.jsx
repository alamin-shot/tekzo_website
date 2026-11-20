import OrderStatusList from "@/Components/Dashboard/OrderStatusList";

export default function ReadyToShipPage() {
  return <OrderStatusList statusCode={6} title="Ready to Ship" />;
}
