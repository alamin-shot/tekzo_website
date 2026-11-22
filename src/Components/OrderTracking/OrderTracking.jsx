"use client";
import Banner from "@/Components/ReuseableComponent/Banner";
import Title2 from "@/Components/ReuseableComponent/Title2";
import { useState } from "react";
import clientFetchAPI from "@/utils/clientFetchAPI";
function str(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object")
    return val.name || val.title || val.label || val.value || fallback;
  return fallback;
}

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Pending",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    message:
      "We wanted to inform you that your recent order is currently pending. Our team is working diligently to confirm your order, and we will notify you as soon as it progresses to the next stage.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="w-5 h-5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    message:
      "We are pleased to confirm that your order has been successfully processed. Thank you for choosing us, and we truly appreciate your support!",
  },
  {
    key: "canceled",
    label: "Canceled",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="w-5 h-5"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    message:
      "We wanted to let you know that your order has been canceled. This may have occurred due to a request or verification issue. If you need further assistance, our team is always here to help.",
  },
  {
    key: "processing",
    label: "Processing",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    message:
      "Your order is currently being processed. Our team is carefully preparing your items for shipment, and we will notify you once it moves to the next stage.",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    message:
      "Great news! Your order has been shipped. Your package is now on its way, and you will be updated once it reaches the next step.",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    message:
      "We're happy to inform you that your order has been successfully delivered. We truly appreciate your trust and hope you enjoy your purchase!",
  },
  {
    key: "return",
    label: "Return",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
    message:
      "Your return has been initiated and is being processed. Our team will review the returned items and keep you updated on your refund or replacement status.",
  },
];

// Map API status values to our STATUS_STEPS keys
const STATUS_KEY_MAP = {
  rejected: "canceled",
  cancel: "canceled",
  cancelled: "canceled",
  complete: "delivered",
  completed: "delivered",
  dispatch: "shipped",
  dispatched: "shipped",
  "ready to ship": "shipped",
  ready_to_ship: "shipped",
  onway: "shipped",
  "on way": "shipped",
  on_way: "shipped",
};

function normalizeStatus(raw) {
  const lower = raw?.toLowerCase?.() || "";
  return STATUS_KEY_MAP[lower] || lower;
}

function getStatusIndex(key) {
  return STATUS_STEPS.findIndex((s) => s.key === key);
}

export default function OrderTracking({ seoData }) {
  const [trackingId, setTrackingId] = useState("");
  const [order, setOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [rawStatus, setRawStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setError("");
    setOrder(null);
    setActiveStep(null);
    setRawStatus("");

    if (!trackingId.trim()) {
      setError("Please enter a tracking ID.");
      return;
    }

    setLoading(true);
    try {
      const data = await clientFetchAPI("/order-tracking", "POST", {
        order_number: trackingId.trim(),
      });

      const orderData = data?.data || data;
      const rawSt = str(orderData?.status);
      setOrder(orderData);
      setRawStatus(rawSt);
      setActiveStep(normalizeStatus(rawSt) || null);
    } catch (err) {
      setError(err?.message || "No order found with this tracking ID.");
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = activeStep ? getStatusIndex(activeStep) : -1;
  const canceledIdx = getStatusIndex("canceled");

  // Hide "canceled" step if order has progressed past it (processing or beyond)
  const visibleSteps =
    currentIdx > canceledIdx
      ? STATUS_STEPS.filter((s) => s.key !== "canceled")
      : STATUS_STEPS;

  const getStepState = (step, idx) => {
    if (step.key === activeStep && step.key === "canceled") return "canceled";
    if (step.key === activeStep) return "active";
    if (activeStep !== "canceled" && idx < currentIdx) return "done";
    return "idle";
  };

  const getIconClasses = (state) => {
    const base =
      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm";
    if (state === "active")
      return `${base} bg-secondary border-secondary text-white scale-110 shadow-teal-200 shadow-lg`;
    if (state === "done")
      return `${base} bg-secondary border-secondary text-white`;
    if (state === "canceled")
      return `${base} bg-red-500 border-red-500 text-white scale-110 shadow-red-200 shadow-lg`;
    return `${base} bg-white border-gray-200 text-gray-300`;
  };

  const getLabelClasses = (state) => {
    const base = "text-xs mt-2 text-center tracking-wide";
    if (state === "active" || state === "done")
      return `${base} font-semibold text-secondary`;
    if (state === "canceled") return `${base} font-semibold text-red-500`;
    return `${base} font-medium text-gray-400`;
  };

  const getConnectorClasses = (idx) => {
    const state = getStepState(STATUS_STEPS[idx], idx);
    const base = "flex-1 h-0.5 transition-all duration-500 mx-1";
    return state === "done" ? `${base} bg-secondary` : `${base} bg-gray-200`;
  };

  const getMobileLineClasses = (state) => {
    const base = "w-0.5 flex-1 min-h-8 my-1 transition-all duration-500";
    return state === "done" ? `${base} bg-secondary` : `${base} bg-gray-200`;
  };

  const getBubbleBorderClass = () =>
    activeStep === "canceled" ? "border-l-red-400" : "border-l-secondary";

  const getBubbleLabelClass = () =>
    activeStep === "canceled"
      ? "text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1.5"
      : "text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5";

  const activeStepData = STATUS_STEPS.find((s) => s.key === activeStep);

  return (
    <div className="">
      <Banner h1="Track Your Order"
        image={seoData?.banner || "/order-tracking.png"}
        title={seoData?.title || "Order Tracking"}
      />
      <div className="flex flex-col items-center px-4 py-10 lg:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Title2>Track Your Order</Title2>
          <p className="text-gray-400 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
            Enter your order number below to check the current status of your
            order.
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 w-full max-w-lg mb-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Enter Order Number..."
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className="w-full pl-10 pr-4 py-3.5 rounded-full border border-gray-200 bg-white text-gray-800 text-sm outline-none focus:border-secondary focus:ring-4 focus:ring-teal-50 transition placeholder-gray-300 shadow-sm"
            />
          </div>
          <button
            onClick={handleTrack}
            disabled={loading}
            className="px-6 py-3.5 bg-secondary text-white text-sm font-semibold rounded-full hover:shadow-lg cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Tracking…" : "Track Now"}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-6 text-center">{error}</p>
        )}

        {/* Loading dots */}
        {loading && (
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-secondary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Order Summary Card */}
        {order && !loading && (
          <div className="w-full max-w-5xl mt-8 mb-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Order Number
                </p>
                <p className="font-semibold text-gray-800">
                  {str(order.order_number, trackingId)}
                </p>
              </div>
              {order.created_at && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Order Date
                  </p>
                  <p className="font-semibold text-gray-800">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {order.total_amount !== undefined && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Total
                  </p>
                  <p className="font-semibold text-gray-800">
                    ৳{str(order.total_amount)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${activeStep === "canceled" ? "bg-red-100 text-red-600" : activeStep === "delivered" ? "bg-teal-100 text-teal-600" : "bg-amber-100 text-amber-600"}`}
                >
                  {rawStatus || activeStep}
                </span>
              </div>
            </div>

            {/* Order Items */}
            {order.items?.length > 0 && (
              <div className="mt-6 border-t border-gray-50 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Items
                </p>
                <div className="space-y-3">
                  {order.items.map((item, i) => {
                    const itemName =
                      str(item.name) || str(item.product_name) || "Product";
                    const itemPrice =
                      str(item.price) ||
                      str(item.unit_price) ||
                      str(item.subtotal);
                    const itemImage =
                      typeof item.image === "string" ? item.image : null;
                    const colorName = str(item.color);
                    const sizeName = str(item.size);
                    const variantLabel = [colorName, sizeName]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {itemImage && (
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {itemName}
                            </p>
                            {variantLabel && (
                              <p className="text-xs text-gray-400">
                                {variantLabel}
                              </p>
                            )}
                            {item.quantity && (
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                        {itemPrice && (
                          <p className="font-semibold text-gray-700">
                            ৳{itemPrice}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {order && !loading && (
          <div className="w-full max-w-5xl">
            {/* DESKTOP */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between">
                {visibleSteps.map((step, idx) => {
                  const state = getStepState(step, idx);
                  const historyEntry = order.status_histories?.find(
                    (h) => str(h.status).toLowerCase() === step.key,
                  );
                  const timestamp =
                    historyEntry?.created_at ||
                    historyEntry?.updated_at ||
                    historyEntry?.date;

                  return (
                    <div
                      key={step.key}
                      className="flex items-center flex-1 last:flex-none"
                    >
                      <div className="flex flex-col items-center">
                        <div className={getIconClasses(state)}>{step.icon}</div>
                        <span className={getLabelClasses(state)}>
                          {step.label}
                        </span>
                        {timestamp &&
                          (state === "active" ||
                            state === "done" ||
                            state === "canceled") && (
                            <span className="text-[10px] text-gray-400 mt-1 text-center whitespace-nowrap">
                              {new Date(timestamp).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          )}
                      </div>
                      {idx < visibleSteps.length - 1 && (
                        <div className={getConnectorClasses(idx)} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message bubble — always shown below active step */}
              {activeStepData && (
                <div className="mt-8">
                  <div
                    className={`bg-white rounded-2xl px-6 py-5 shadow-md border-l-4 ${getBubbleBorderClass()}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={getBubbleLabelClass()}>
                        {activeStepData.label}
                      </p>
                      {(() => {
                        const h = order.status_histories?.find(
                          (h) => str(h.status).toLowerCase() === activeStep,
                        );
                        const ts = h?.created_at || h?.updated_at || h?.date;
                        return ts ? (
                          <span className="text-[10px] text-gray-400">
                            {new Date(ts).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {activeStepData.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE */}
            <div className="flex md:hidden flex-col">
              {visibleSteps.map((step, idx) => {
                const state = getStepState(step, idx);
                const isActive = step.key === activeStep;
                const historyEntry = order.status_histories?.find(
                  (h) => str(h.status).toLowerCase() === step.key,
                );
                const timestamp =
                  historyEntry?.created_at ||
                  historyEntry?.updated_at ||
                  historyEntry?.date;

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`${getIconClasses(state).replace("w-12 h-12", "w-10 h-10")}`}
                      >
                        {step.icon}
                      </div>
                      {idx < visibleSteps.length - 1 && (
                        <div className={getMobileLineClasses(state)} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-semibold ${state === "active" || state === "done" ? "text-secondary" : state === "canceled" ? "text-red-500" : "text-gray-400"}`}
                        >
                          {step.label}
                        </p>
                        {timestamp &&
                          (state === "active" ||
                            state === "done" ||
                            state === "canceled") && (
                            <span className="text-[10px] text-gray-400">
                              {new Date(timestamp).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                      </div>
                      {isActive && (
                        <div
                          className={`mt-2 bg-white rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed shadow border-l-4 ${getBubbleBorderClass()}`}
                        >
                          <p className={getBubbleLabelClass()}>{step.label}</p>
                          {step.message}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
