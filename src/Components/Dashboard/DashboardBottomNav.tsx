"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  Home,
} from "lucide-react";
import type { DashboardBottomNavProps } from "@/types/props/dashboard";

export default function DashboardBottomNav({ onOpenMenu }: DashboardBottomNavProps) {
  const pathname = usePathname();
  const { isLight } = useDashboardTheme();

  const cleanPath = pathname?.split("?")[0]?.replace(/\/$/, "") || "/dashboard";

  const isOrders =
    cleanPath.includes("/order") ||
    cleanPath === "/dashboard/all-orders" ||
    cleanPath === "/dashboard/my-bag";
  const isWishlist = cleanPath === "/dashboard/wishlist";
  const isProfile =
    cleanPath === "/dashboard/profile" ||
    cleanPath === "/dashboard/edit-profile";

  return (
    <nav
      aria-label="Mobile Dashboard Navigation"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors duration-200 ${
        isLight
          ? "bg-white/95 backdrop-blur-md border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          : "bg-[#0c1424]/95 backdrop-blur-md border-white/10 shadow-2xl"
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        {/* ITEM 1: Menu Trigger (Opens Sidebar Drawer) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
            isLight
              ? "text-slate-500 hover:text-slate-900"
              : "text-slate-400 hover:text-white"
          }`}
          aria-label="Open Menu"
        >
          <div
            className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
              isLight
                ? "hover:bg-slate-100 text-slate-700"
                : "hover:bg-white/[0.08] text-slate-300"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Menu</span>
        </button>

        {/* ITEM 2: Orders */}
        <Link
          href="/dashboard/all-orders"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            isOrders
              ? isLight
                ? "text-sky-600 font-bold"
                : "text-sky-400 font-bold"
              : isLight
                ? "text-slate-500 hover:text-slate-900"
                : "text-slate-400 hover:text-white"
          }`}
        >
          <div
            className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
              isOrders
                ? isLight
                  ? "bg-sky-50 text-sky-600 shadow-xs scale-105 border border-sky-200/60"
                  : "bg-sky-500/15 text-sky-400 shadow-xs scale-105"
                : ""
            }`}
          >
            <Package className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Orders</span>
          {isOrders && (
            <span
              className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${
                isLight
                  ? "bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)]"
                  : "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
              }`}
            />
          )}
        </Link>

        {/* ITEM 3: Center Home Button */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center py-0.5 px-1 cursor-pointer group relative -mt-3.5"
          aria-label="Home"
        >
          <div
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 shadow-md active:scale-90 group-hover:scale-105 border-2 ${
              isLight
                ? "bg-gradient-to-tr from-[#007AFF] to-[#0A84FF] text-white shadow-blue-500/30 border-white"
                : "bg-gradient-to-tr from-[#007AFF] to-[#0A84FF] text-white shadow-blue-500/40 border-[#0c1424]"
            }`}
          >
            <Home className="w-5 h-5 text-white" />
          </div>
          <span
            className={`text-[10px] tracking-tight font-semibold mt-0.5 ${
              isLight ? "text-slate-700" : "text-slate-300"
            }`}
          >
            Home
          </span>
        </Link>

        {/* ITEM 4: Wishlist */}
        <Link
          href="/dashboard/wishlist"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            isWishlist
              ? isLight
                ? "text-sky-600 font-bold"
                : "text-sky-400 font-bold"
              : isLight
                ? "text-slate-500 hover:text-slate-900"
                : "text-slate-400 hover:text-white"
          }`}
        >
          <div
            className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
              isWishlist
                ? isLight
                  ? "bg-sky-50 text-sky-600 shadow-xs scale-105 border border-sky-200/60"
                  : "bg-sky-500/15 text-sky-400 shadow-xs scale-105"
                : ""
            }`}
          >
            <Heart className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Wishlist</span>
          {isWishlist && (
            <span
              className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${
                isLight
                  ? "bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)]"
                  : "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
              }`}
            />
          )}
        </Link>

        {/* ITEM 5: Profile */}
        <Link
          href="/dashboard/profile"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            isProfile
              ? isLight
                ? "text-sky-600 font-bold"
                : "text-sky-400 font-bold"
              : isLight
                ? "text-slate-500 hover:text-slate-900"
                : "text-slate-400 hover:text-white"
          }`}
        >
          <div
            className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
              isProfile
                ? isLight
                  ? "bg-sky-50 text-sky-600 shadow-xs scale-105 border border-sky-200/60"
                  : "bg-sky-500/15 text-sky-400 shadow-xs scale-105"
                : ""
            }`}
          >
            <User className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Profile</span>
          {isProfile && (
            <span
              className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${
                isLight
                  ? "bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)]"
                  : "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
              }`}
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
