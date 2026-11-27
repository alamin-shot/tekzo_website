"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import clientFetchAPI from "@/utils/clientFetchAPI";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Loader2,
  Search,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  XCircle,
  Truck,
  CreditCard,
  FileText,
} from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { OrderHistoryRowProps, OrderPaginationProps, PayNowModalProps } from "@/types/props/dashboard";
import { errMessage, fieldsOf, filterList, lowerOpt, rec, toDateInput } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

const columns = [
  "Order#",
  "Placed On",
  "Qty",
  "Total",
  "Paid",
  "Due Amount",
  "Status",
  "Actions",
];

// ─── Pay Now Modal ────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "online", label: "SSL COMMERZ", image: "/ssl-commarz-icon.png" },
  { id: "bkash", label: "bKash", image: "/ecommerce-brand-logo/bkash.svg" },
];

function PayNowModal({ order, onClose }: PayNowModalProps) {
  const o = fieldsOf(order);
  const maxAmount = Number(o.due_amount) || 0;

  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState(String(maxAmount));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const parsedAmount = Number(amount);
  const amountError =
    amount !== "" && (isNaN(parsedAmount) || parsedAmount <= 0)
      ? "Enter a valid amount."
      : parsedAmount > maxAmount
        ? `Amount cannot exceed ৳${maxAmount.toLocaleString()}.`
        : null;

  const handlePay = async () => {
    if (!selected || amountError || !amount) return;
    setLoading(true);
    setError(null);
    try {
      const res = await clientFetchAPI(
        `/customer/orders/${String(o.id)}/repay`,
        "POST",
        { payment_method: selected, amount: parsedAmount },
      );
      if (rec(res)?.url) {
        window.location.href = String(fieldsOf(res).url);
      } else {
        setError("Payment URL not received. Please try again.");
      }
    } catch (err) {
      setError(errMessage(err) || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in-50 duration-200">
      <div className="bg-white dark:bg-[#0f182c] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-7 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Complete Payment
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Invoice{" "}
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {nodeOf(o.invoice_number)}
          </span>
        </p>

        {/* Due Amount display */}
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 mb-5">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Outstanding Due
          </span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400">
            ৳{maxAmount.toLocaleString()}
          </span>
        </div>

        {/* Amount Input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Amount to Pay
            </label>
            <button
              type="button"
              onClick={() => setAmount(String(maxAmount))}
              className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Pay Full
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              ৳
            </span>
            <input
              type="number"
              min={1}
              max={maxAmount}
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) <= maxAmount) setAmount(val);
              }}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition ${
                amountError
                  ? "border-rose-400 bg-rose-50/20 text-rose-600"
                  : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              }`}
              placeholder={`Max ৳${maxAmount.toLocaleString()}`}
            />
          </div>
          {amountError ? (
            <p className="text-xs text-rose-500 mt-1 font-medium">{amountError}</p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Max payable: ৳{maxAmount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Select Gateway
        </p>

        <div className="flex flex-col gap-2.5 mb-6">
          {PAYMENT_METHODS.map((m) => {
            const isSelected = selected === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                className={`flex items-center gap-3.5 border rounded-2xl px-4 py-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-sky-500 bg-sky-500/10 shadow-xs"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]"
                }`}
              >
                <Image
                  src={m.image}
                  alt={m.label}
                  width={60}
                  height={28}
                  className="h-6 w-auto object-contain"
                  unoptimized
                />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {m.label}
                </span>
                <span
                  className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-slate-300 dark:border-white/20"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {nodeOf(error && (
          <p className="text-xs text-rose-500 mb-4 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20">
            {nodeOf(error)}
          </p>
        ))}

        <button
          onClick={handlePay}
          disabled={!selected || !!amountError || !amount || loading}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading
            ? "Redirecting..."
            : `Pay ৳${parsedAmount > 0 ? Number(parsedAmount).toLocaleString() : "—"}`}
        </button>
      </div>
    </div>
  );
}

// ─── Invoice Download ─────────────────────────────────────────────────────────
async function downloadInvoice(invoiceNumber: unknown) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const url = `${apiBase}/customer/invoice-download?invoice_number=${encodeURIComponent(String(invoiceNumber))}`;
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `Invoice-${String(invoiceNumber)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function paymentStatusClass(status: unknown) {
  switch (lowerOpt(status)) {
    case "successful":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "partially paid":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    case "initiated":
    case "processing":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
    case "failed":
    case "cancelled":
    case "unsuccessful":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
    default:
      return "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10";
  }
}

function orderStatusBadge(status: unknown) {
  const name = lowerOpt(rec(status)?.name);
  switch (name) {
    case "delivered":
    case "approved":
      return {
        style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: Clock,
      };
    case "processing":
      return {
        style: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        icon: Sparkles,
      };
    case "shipped":
      return {
        style: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        icon: Truck,
      };
    case "cancelled":
    case "rejected":
      return {
        style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        icon: XCircle,
      };
    default:
      return {
        style: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10",
        icon: Clock,
      };
  }
}

function canPayNow(order: unknown) {
  return Number(rec(order)?.due_amount) > 0;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-white/[0.04]">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200/80 dark:bg-white/10 rounded-lg animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-1">
        <ShoppingBag className="w-7 h-7" />
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">
        No Orders Found
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
        Your order history is currently empty or no results match your query.
      </p>
      <Link
        href="/"
        className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
      >
        Start Shopping
      </Link>
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({ order, onPayNow }: OrderHistoryRowProps) {
  const o = fieldsOf(order);
  const [dlLoading, setDlLoading] = useState(false);
  const badge = orderStatusBadge(o.status);
  const StatusIcon = badge.icon;

  const handleDownload = async (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDlLoading(true);
    try {
      await downloadInvoice(o.invoice_number);
    } catch {
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <tr className="border-b border-slate-100 dark:border-white/[0.04] last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-6 py-4 text-xs font-bold">
        <Link
          href={`/dashboard/order-status/${String(o.id)}`}
          className="text-sky-600 dark:text-sky-400 font-mono hover:underline font-bold"
        >
          {nodeOf(o.invoice_number)}
        </Link>
      </td>

      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
        <Link href={`/dashboard/order-status/${String(o.id)}`} className="block">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {o.created_at
              ? new Date(toDateInput(o.created_at)).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "N/A"}
          </span>
        </Link>
      </td>

      <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        <Link href={`/dashboard/order-status/${String(o.id)}`} className="block">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-[11px] font-bold">
            {nodeOf(o.total_quantity ?? "-")}
          </span>
        </Link>
      </td>

      <td className="px-6 py-4 text-xs font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
        <Link href={`/dashboard/order-status/${String(o.id)}`} className="block">
          ৳{Number(o.grand_total || 0).toLocaleString()}
        </Link>
      </td>

      <td className="px-6 py-4 text-xs font-semibold whitespace-nowrap">
        <Link href={`/dashboard/order-status/${String(o.id)}`} className="block">
          {o.payable_amount != null ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ৳{Number(o.payable_amount).toLocaleString()}
            </span>
          ) : (
            <span className="text-slate-300 dark:text-slate-600">—</span>
          )}
        </Link>
      </td>

      <td className="px-6 py-4 text-xs font-semibold whitespace-nowrap">
        <Link href={`/dashboard/order-status/${String(o.id)}`} className="block">
          {o.due_amount != null ? (
            <span
              className={
                Number(o.due_amount) > 0
                  ? "text-rose-600 dark:text-rose-400 font-extrabold"
                  : "text-emerald-600 dark:text-emerald-400 font-bold"
              }
            >
              ৳{Number(o.due_amount).toLocaleString()}
            </span>
          ) : (
            <span className="text-slate-300 dark:text-slate-600">—</span>
          )}
        </Link>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={`/dashboard/order-status/${String(o.id)}`}
          className="flex items-center gap-2 flex-wrap"
        >
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.8 rounded-full border font-bold capitalize ${badge.style}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{nodeOf(rec(o.status)?.name || "N/A")}</span>
          </span>
          {nodeOf(rec(o.payment_status)?.status && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${paymentStatusClass(fieldsOf(o.payment_status).status)}`}
            >
              {nodeOf(fieldsOf(o.payment_status).status)}
            </span>
          ))}
        </Link>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {/* Invoice Download */}
          <button
            onClick={handleDownload}
            disabled={dlLoading}
            title="Download Invoice"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            {dlLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Download size={12} />
            )}
            <span>Invoice</span>
          </button>

          {/* Pay Now */}
          {canPayNow(order) && (
            <button
              onClick={() => onPayNow(order)}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition cursor-pointer"
            >
              <CreditCard size={12} />
              <span>Pay Now</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, lastPage, total, onPageChange }: OrderPaginationProps) {
  if (Number(lastPage) <= 1) return null;
  const pages = Array.from({ length: Number(lastPage) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing page <span className="font-bold text-slate-800 dark:text-slate-200">{page}</span> of{" "}
        <span className="font-bold text-slate-800 dark:text-slate-200">{nodeOf(lastPage)}</span>
        &nbsp;·&nbsp; Total{" "}
        <span className="font-bold text-slate-800 dark:text-slate-200">{nodeOf(total)}</span> orders
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <ChevronLeft size={15} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition border cursor-pointer ${
              p === page
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === lastPage}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderHistory() {
  const [orders, setOrders] = useState<unknown>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<unknown>(1);
  const [total, setTotal] = useState<unknown>(0);
  const [payingOrder, setPayingOrder] = useState<unknown>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clientFetchAPI(
          `/customer/orders?page=${page}`,
          "GET",
        );
        setOrders(rec(data)?.data ?? []);
        setLastPage(rec(data)?.last_page ?? 1);
        setTotal(rec(data)?.total ?? 0);
      } catch (err) {
        setError(errMessage(err) || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const filteredOrders = filterList(orders, (order) => {
    const q = search.toLowerCase();
    const o = fieldsOf(order);
    return (
      lowerOpt(o.invoice_number)?.includes(q) ||
      lowerOpt(rec(o.status)?.name)?.includes(q) ||
      lowerOpt(rec(o.payment_status)?.method)?.includes(q)
    );
  });

  const handlePageChange = (p: number) => {
    if (p < 1 || p > Number(lastPage)) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {nodeOf(payingOrder && (
        <PayNowModal order={payingOrder} onClose={() => setPayingOrder(null)} />
      ))}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Order History
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review past purchases, download official invoices, and complete pending payments
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-600 dark:text-slate-300 w-fit">
          <span>{nodeOf(total)} Total Orders</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-5 sm:p-6 lg:p-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, order status, or payment method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/80 dark:bg-white/[0.03] rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/80 dark:border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {nodeOf(error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl px-4 py-3">
            {nodeOf(error)}
          </div>
        ))}

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/[0.06]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col}
                    className={`px-6 py-3.5 whitespace-nowrap ${col === "Qty" ? "text-center" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={idKey(order)}
                    order={order}
                    onPayNow={setPayingOrder}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          lastPage={lastPage}
          total={total}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
