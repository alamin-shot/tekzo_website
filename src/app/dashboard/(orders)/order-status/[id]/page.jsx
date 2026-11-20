"use client";

import clientFetchAPI from "@/utils/clientFetchAPI";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiChevronLeft,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiRotateCcw,
} from "react-icons/fi";

// --- Status Steps (stepper bar) ---
const STATUS_STEPS = ["Pending", "Approved", "Processing", "OnWay", "Complete", "Return"];

// --- All steps with code + message ---
const STEPS = [
  {
    code: 2,
    label: "Pending",
    message:
      "We wanted to inform you that your recent order with TEKZO is currently Pending. Our team is reviewing the details and working diligently to confirm your order. We'll notify you as soon as it progresses to the next stage.",
  },
  {
    code: 3,
    label: "Rejected",
    message:
      "We're sorry to inform you that your order with TEKZO has been Rejected. This may be due to incomplete information, stock issues, or other verification problems. Please contact support if you believe this is a mistake.",
  },
  {
    code: 4,
    label: "Approved",
    message:
      "Congratulations! Your order with TEKZO has been Confirmed. Our fulfillment team is now preparing your items for the next step. You'll receive an update once your order moves into processing.",
  },
  {
    code: 5,
    label: "Processing",
    message:
      "Your order with TEKZO is now Processing. Our team is carefully packing and preparing your items to ensure everything meets our quality standards. We'll let you know as soon as it ships.",
  },
  {
    code: 6,
    label: "OnWay",
    message: "Exciting update! Your order with TEKZO has been Shipped. It's on its way to your delivery address, and you can expect it soon.",
  },
  {
    code: 7,
    label: "Complete",
    message: "Your order with TEKZO has been successfully Delivered. We hope you enjoy your purchase!",
  },
  {
    code: 9,
    label: "Return",
    message: "Your order has been returned successfully. If you have any questions, please contact our support team.",
  },
];

// Helper: get message by status name
function getStatusMessage(statusName) {
  const found = STEPS.find((s) => s.label === statusName);
  return found?.message ?? "";
}

// --- Order Status Stepper ---
function OrderStepper({ currentStatus }) {
  const isRejected = currentStatus === "Rejected";
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  const getStepLabel = (step) => {
    switch (step) {
      case "Approved":
        return "Confirmed";
      case "OnWay":
        return "Shipped";
      case "Complete":
        return "Delivered";
      default:
        return step;
    }
  };

  return (
    <div className="py-2">
      {/* Mobile: vertical stepper */}
      <div className="flex flex-col px-2 py-4 md:hidden">
        {STATUS_STEPS.map((step, index) => {
          const isFirstStep = index === 0;
          const isCompleted = !isRejected && index < currentIndex;
          const isActive = !isRejected && index === currentIndex;
          const isDisabled = isRejected && !isFirstStep;
          const isRejectedStep = isRejected && isFirstStep;
          const isLast = index === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex items-start gap-3.5">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isRejectedStep
                      ? "bg-rose-500 text-white shadow-xs"
                      : isActive
                        ? "bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-xs"
                        : isCompleted
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/10"
                  } ${isDisabled ? "opacity-30" : ""}`}
                >
                  {isRejectedStep ? (
                    <FiX size={15} />
                  ) : isActive || isCompleted ? (
                    <FiCheck size={15} />
                  ) : (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-7 my-1 ${
                      !isRejected && index < currentIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                )}
              </div>
              <div className="pt-1 pb-5">
                <span
                  className={`text-xs font-bold rounded-lg px-2.5 py-1 shadow-2xs border ${
                    isRejectedStep
                      ? "text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20"
                      : isActive
                        ? "text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10"
                        : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
                          : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10"
                  } ${isDisabled ? "opacity-30" : ""}`}
                >
                  {isRejectedStep ? "Rejected" : getStepLabel(step)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* md+: horizontal stepper */}
      <div className="hidden md:flex items-center w-full px-2 py-4">
        {STATUS_STEPS.map((step, index) => {
          const isFirstStep = index === 0;
          const isCompleted = !isRejected && index < currentIndex;
          const isActive = !isRejected && index === currentIndex;
          const isDisabled = isRejected && !isFirstStep;
          const isRejectedStep = isRejected && isFirstStep;
          const isLast = index === STATUS_STEPS.length - 1;

          return (
            <div
              key={step}
              className={`flex items-center flex-1 last:flex-none ${isDisabled ? "opacity-35" : ""}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isRejectedStep
                      ? "bg-rose-500 text-white shadow-xs"
                      : isActive
                        ? "bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-xs scale-105"
                        : isCompleted
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/10"
                  }`}
                >
                  {isRejectedStep ? (
                    <FiX size={15} />
                  ) : isActive || isCompleted ? (
                    <FiCheck size={15} />
                  ) : (
                    <span className="text-[11px] font-bold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold rounded-lg px-2.5 py-1 shadow-2xs border whitespace-nowrap ${
                    isRejectedStep
                      ? "text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20"
                      : isActive
                        ? "text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10"
                        : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
                          : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10"
                  }`}
                >
                  {isRejectedStep ? "Rejected" : getStepLabel(step)}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 mb-7">
                  <div
                    className={`h-full transition-all duration-500 ${
                      !isRejected && index < currentIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Order Timeline ---
function OrderTimeline({ timeline }) {
  return (
    <div className="mt-4">
      <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
        Fulfillment Timeline
      </h2>
      <div className="flex flex-col gap-3">
        {timeline.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-col lg:flex-row items-start gap-2.5 lg:gap-5 p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] transition-colors"
          >
            <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-0 lg:min-w-[110px] lg:text-right">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {item.date}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                {item.time}
              </p>
            </div>
            <div className="hidden lg:flex mt-1.5 flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full ring-4 ${
                  item.status === "Rejected"
                    ? "bg-rose-500 ring-rose-500/20"
                    : "bg-emerald-500 ring-emerald-500/20"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 lg:block">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 lg:hidden ${
                    item.status === "Rejected" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    item.status === "Rejected"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {item.status}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Your Order Summary ---
function OrderSummary({ subtotal, shipping }) {
  const total = subtotal + shipping;
  return (
    <div className="mt-6 p-6 bg-slate-50/70 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.04]">
      <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
        Price Breakdown
      </h2>
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <span>Items Subtotal</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            ৳{Number(subtotal || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <span>Standard Delivery Fee</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            ৳{Number(shipping || 0).toLocaleString()}
          </span>
        </div>
        <div className="h-px bg-slate-200/80 dark:border-white/10 my-1" />
        <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
          <span>Grand Total</span>
          <span className="font-black text-sky-600 dark:text-sky-400">
            ৳{Number(total || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function OrderStatus() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await clientFetchAPI(`/customer/orders/${id}/detail`, "GET");
        const raw = data?.data;

        const currentStatus = raw?.status?.name ?? "Pending";
        const isRejected = currentStatus === "Rejected";

        let timeline;

        if (isRejected) {
          timeline = [
            {
              date: raw?.date,
              time: raw?.time,
              status: "Rejected",
              message: getStatusMessage("Rejected"),
            },
          ];
        } else {
          const normalSteps = STEPS.filter((s) => s.label !== "Rejected");
          const normalIndex = normalSteps.findIndex((s) => s.label === currentStatus);

          timeline = normalSteps
            .slice(0, normalIndex + 1)
            .reverse()
            .map((step) => ({
              date: raw?.date,
              time: raw?.time,
              status: step.label,
              message: step.message,
            }));
        }

        setOrder({
          id: raw?.id,
          invoiceNumber: raw?.invoiceNumber,
          date: raw?.date,
          time: raw?.time,
          currentStatus,
          subtotal: raw?.subTotal ?? 0,
          shipping: raw?.shippingCharge ?? 0,
          timeline,
        });
      } catch (err) {
        setError(err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading order timeline...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full p-12 text-center bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08]">
        <p className="text-rose-500 text-sm font-semibold">{error ?? "Order not found."}</p>
        <Link
          href="/dashboard/all-orders"
          className="inline-block mt-4 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/all-orders"
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <FiChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Order Details
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking and status updates for this package
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{order.date}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{order.time}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20">
              #{order.invoiceNumber}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {order.currentStatus}
            </span>
          </div>

          <Link
            href="/contact-us"
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer text-xs font-bold"
          >
            <FiMessageSquare size={15} />
            <span>Need Help?</span>
          </Link>
        </div>

        <OrderStepper currentStatus={order.currentStatus} />
        <div className="h-px bg-slate-100 dark:bg-white/[0.06] my-4" />
        <OrderTimeline timeline={order.timeline} />
        <OrderSummary subtotal={order.subtotal} shipping={order.shipping} />
      </div>
    </div>
  );
}
