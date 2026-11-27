"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { Search, ShoppingBag, ExternalLink, Calendar, CheckCircle2, Clock, Sparkles, XCircle, Truck } from "lucide-react";
import type { OrderStatusListProps } from "@/types/props/dashboard";
import { errMessage, fieldsOf, filterList, lowerOpt, rec, toDateInput } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

const columns = ["Order#", "Placed On", "Qty", "Total", "Status", "Details"];

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

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-white/[0.04]">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200/80 dark:bg-white/10 rounded-lg animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-1">
        <ShoppingBag className="w-7 h-7" />
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">
        No Orders Found
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center">
        There are no purchases matching this specific status category.
      </p>
      <Link
        href="/dashboard/all-orders"
        className="mt-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
      >
        View All Orders →
      </Link>
    </div>
  );
}

export default function OrderStatusList({ statusCode, title }: OrderStatusListProps) {
  const [orders, setOrders] = useState<unknown>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await clientFetchAPI(
          `/customer/orders?status=${statusCode}`,
          "GET",
        );
        setOrders(rec(data)?.data ?? []);
      } catch (err) {
        setError(errMessage(err) || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusCode]);

  const filteredOrders = filterList(orders, (order) => {
    const q = search.toLowerCase();
    const o = fieldsOf(order);
    return (
      (o.id === null || o.id === undefined ? undefined : String(o.id))?.includes(q) ||
      lowerOpt(o.invoice_number)?.includes(q) ||
      lowerOpt(rec(o.status)?.name)?.includes(q) ||
      lowerOpt(rec(o.payment_status)?.method)?.includes(q)
    );
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      <title>{title} - Tekzo Dashboard</title>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight capitalize">
            {title}
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Filtered overview of your gadget orders in {title.toLowerCase()} status
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-600 dark:text-slate-300 w-fit">
          <span>{filteredOrders.length} Order{filteredOrders.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-5 sm:p-6 lg:p-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number or payment method..."
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
                  <th key={col} className="px-6 py-3.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const o = fieldsOf(order);
                  const badge = orderStatusBadge(o.status);
                  const StatusIcon = badge.icon;
                  return (
                    <tr
                      key={idKey(order)}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-bold">
                        <Link
                          href={`/dashboard/order-status/${String(o.id)}`}
                          className="text-sky-600 dark:text-sky-400 font-mono hover:underline font-bold"
                        >
                          {nodeOf(o.invoice_number || `#${String(o.id)}`)}
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
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
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-[11px] font-bold">
                          {nodeOf(o.total_quantity ?? "-")}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        ৳{Number(o.grand_total || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.8 rounded-full border font-bold capitalize ${badge.style}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{nodeOf(rec(o.status)?.name || "N/A")}</span>
                          </span>
                          {nodeOf(rec(o.payment_status)?.method && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 font-semibold uppercase">
                              {nodeOf(fieldsOf(o.payment_status).method)}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/order-status/${String(o.id)}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                        >
                          <span>Track</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
