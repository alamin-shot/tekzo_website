"use client";

import { useState } from "react";
import type { DashboardOrderRowProps, DashboardSampleOrder, DashboardStatusBadgeProps, DashboardTableProps } from "@/types/props/dashboard";

// --- Sample orders data (empty to match the screenshot state) ---
const sampleOrders: DashboardSampleOrder[] = [];

// --- Table Header Columns ---
const columns = ["Order#", "Place On", "Qty", "Total", "Status"];

// --- Empty State ---
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {/* Camera Icon Box */}
      <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-2 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">
          Product Photo
        </p>
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
          Coming Soon
        </p>
      </div>

      <p className="text-sm text-gray-400 mt-1">Nothing to show here</p>
    </div>
  );
}

// --- Status Badge ---
function StatusBadge({ status }: DashboardStatusBadgeProps) {
  const styles: Record<string, string> = {
    Delivered: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Cancelled: "bg-red-100 text-red-600",
    Processing: "bg-blue-100 text-blue-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}

// --- Single Order Row ---
function OrderRow({ order }: DashboardOrderRowProps) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 text-sm font-semibold text-primary">
        #{order.id}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{order.placedOn}</td>
      <td className="px-6 py-4 text-sm text-gray-700 text-center">
        {order.qty}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
        ৳ {order.total.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}

// --- Main Page ---
export default function DashboardTable({ title }: DashboardTableProps) {
  const [search, setSearch] = useState("");

  const filteredOrders = sampleOrders.filter(
    (order) =>
      order.id.toString().includes(search) ||
      order.status.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Page Title */}
        <h1 className="text-xl lg:text-2xl font-extrabold text-gray-700 mb-6 lg:mb-8 tracking-tight capitalize">
          {title}
        </h1>

        {/* Table Container */}
        <div className="lg:bg-gray-100 rounded-3xl lg:p-6 lg:shadow-sm">
          {/* Search Bar */}
          <div className="relative mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-white">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
                <tr>
                  <td colSpan={5}>
                    <div className="h-px bg-gray-100 mx-6" />
                  </td>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
