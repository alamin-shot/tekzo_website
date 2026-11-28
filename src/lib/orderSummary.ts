// Safe read of a GET /customer/recent-order payload for the order result pages
// (F1). Only invoice, totals, payment method/status and item name / variant /
// quantity / price are read; customer PII is never touched.
import type { OrderSummaryLine, OrderSummaryView } from "@/types/props/checkout";
import { mapOpt, rec } from "@/lib/json";

// `payment_status` arrives either as a string or as `{ status, method }`.
const paymentStatusOf = (order: unknown): unknown => {
  const ps = rec(order)?.payment_status;
  return rec(ps)?.status ?? (typeof ps === "string" ? ps : undefined);
};

const paymentMethodOf = (order: unknown): unknown => rec(order)?.payment_method || rec(rec(order)?.payment_status)?.method;

export function readOrderSummary(order: unknown): OrderSummaryView {
  const o = rec(order);
  const status = paymentStatusOf(order);
  const lines =
    mapOpt(o?.order_lists, (entry): OrderSummaryLine => {
      const item = rec(entry);
      const variant = rec(item?.variant);
      return {
        name: rec(item?.product)?.product_name || "",
        variant: mapOpt(variant?.attribute_values, (v) => rec(v)?.value)?.filter(Boolean).join(", ") || "",
        quantity: item?.quantity || 1,
        price: item?.product_price,
      };
    }) || [];
  return {
    invoiceNumber: o?.invoice_number,
    subTotal: o?.sub_total ?? o?.subTotal,
    shippingCharge: o?.shipping_charge,
    discountAmount: o?.discount_amount,
    grandTotal: o?.grand_total,
    paymentMethod: paymentMethodOf(order),
    paymentStatus: status,
    paymentPending: typeof status === "string" && status.toLowerCase() === "initiated",
    lines,
  };
}
