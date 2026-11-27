"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import { Sun, Moon, Eye, EyeOff, Globe, Coins, Sparkles, ChevronDown, User, Package, ShoppingBag, Heart, LogOut } from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import type { DashboardUserProps } from "@/types/props/dashboard";
import { fieldsOf, localeOpt, rec } from "@/lib/json";
import { initialsOf, nodeOf, str } from "@/lib/render";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Manage My Account",
  "/dashboard/manage-account": "Manage My Account",
  "/dashboard/profile": "My Profile",
  "/dashboard/edit-profile": "Edit Profile",
  "/dashboard/address-book": "Address Account Book",
  "/dashboard/elite-status": "Elite Status & Points",
  "/dashboard/coupons": "My Coupons",
  "/dashboard/my-bag": "My Bag",
  "/dashboard/all-orders": "All Orders",
  "/dashboard/wishlist": "My Wishlist",
  "/dashboard/pending-order": "Pending Orders",
  "/dashboard/confirmed-order": "Confirmed Orders",
  "/dashboard/processing-order": "Processing Orders",
  "/dashboard/ready-to-ship": "Ready to Ship",
  "/dashboard/delivered": "Delivered Orders",
  "/dashboard/cancelled": "Cancelled Orders",
  "/dashboard/return": "Return Orders",
  "/dashboard/to-reviews": "To Reviews",
  "/dashboard/review-history": "Review History",
  "/dashboard/sell-your-device": "Sell Your Device",
  "/dashboard/my-sell-requests": "My Sell Requests",
};

export default function DashboardTopNavbar({ user }: DashboardUserProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLight, toggleTheme, showPoints, toggleShowPoints } = useDashboardTheme();

  const [profileUser, setProfileUser] = useState<unknown>(user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  useEffect(() => {
    // `{ ...prev, ...event.detail }` — Object.assign({}, x) copies what spread copies.
    const handleProfileUpdate = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : rec(event)?.detail;
      if (detail) {
        setProfileUser((prev: unknown) => ({ ...Object.assign({}, prev), ...Object.assign({}, detail) }));
      }
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Mouse targets are DOM nodes; `contains(null)` is false.
      const target = event.target instanceof Node ? event.target : null;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cleanPath = useMemo(() => {
    const raw = pathname?.split("?")[0]?.replace(/\/$/, "");
    return raw || "/dashboard";
  }, [pathname]);

  const currentTitle = ROUTE_TITLES[cleanPath] || "Dashboard";

  const totalPoints = rec(profileUser)?.total_points ?? null;
  const statusName = rec(rec(profileUser)?.elite)?.status_name || "Member";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setDropdownOpen(false);
      router.push("/login");
    }
  };

  return (
    <header
      className={`w-full h-[60px] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200 select-none ${
        isLight ? "bg-[#F5F5F7] border-b border-slate-200/80 text-slate-900" : "bg-[#0c1424] border-b border-white/10 text-white"
      }`}
    >
      {/* 1. LEFT: Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${isLight ? "text-slate-400" : "text-slate-500"}`}>Dashboard</span>
          <span className={`text-xs ${isLight ? "text-slate-300" : "text-slate-600"}`}>/</span>
        </div>
        <h1 className={`text-sm sm:text-base font-bold truncate tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{currentTitle}</h1>
      </div>

      {/* 2. RIGHT: Points Pill, Theme Switcher, Website Link & Profile Dropdown */}
      <div className="flex items-center gap-2  flex-shrink-0">
        {/* Points or Elite Status Pill */}
        <button
          type="button"
          onClick={toggleShowPoints}
          className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-2xs ${
            isLight ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-800" : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200"
          }`}
          title={showPoints ? "Hide points" : "Show points"}
          aria-label={showPoints ? "Hide points" : "Show points"}
        >
          <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0 ${isLight ? "bg-amber-100 text-amber-600" : "bg-amber-500/20 text-amber-400"}`}>
            {totalPoints !== null ? <Coins className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          </div>
          <span className="font-mono text-[11px] font-bold tracking-tight">{totalPoints !== null ? (showPoints ? `${localeOpt(totalPoints)} Pts` : "••••") : nodeOf(statusName)}</span>
          <div className={`shrink-0 ml-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>{showPoints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</div>
        </button>

        {/* Theme Toggle Button (Circular Ripple Animation) */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer shadow-2xs transition-all ${
            isLight ? "bg-white hover:bg-slate-50 border-slate-200 text-amber-500 hover:text-amber-600" : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-sky-400 hover:text-sky-300"
          }`}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" /> : <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />}
        </button>

        {/* Back to Website Link */}
        <Link
          href="/"
          className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs transition-all ${
            isLight ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900" : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white"
          }`}
          title="Back to Website"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Back to Website</span>
        </Link>

        {/* 3. PROFILE PHOTO LAST RIGHT WITH BOTTOM ARROW & DROPDOWN */}
        <div className="relative ml-0.5" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 p-1 pr-2 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${
              dropdownOpen
                ? isLight
                  ? "bg-white border-[#007AFF]/60 ring-2 ring-[#007AFF]/20"
                  : "bg-white/[0.08] border-[#007AFF]/60 ring-2 ring-[#007AFF]/30"
                : isLight
                  ? "bg-white hover:bg-slate-50 border-slate-200"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10"
            }`}
            aria-expanded={dropdownOpen}
            aria-label="User Account Menu"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {rec(profileUser)?.profile_picture ? (
                <Image src={str(fieldsOf(profileUser).profile_picture) ?? ""} alt={str(rec(profileUser)?.name || "Avatar") ?? ""} width={28} height={28} className="w-full h-full object-cover" />
              ) : (
                <span>
                  {rec(profileUser)?.name
                    ? initialsOf(fieldsOf(profileUser).name)
                    : "U"}
                </span>
              )}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-sky-500" : ""}`} />
          </button>

          {/* Dropdown Menu Container */}
          {dropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                isLight
                  ? "bg-white/95 backdrop-blur-md border-slate-200 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                  : "bg-[#0f182c]/95 backdrop-blur-md border-white/10 text-white shadow-2xl"
              }`}
            >
              {/* User Overview Header */}
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/[0.07]">
                <p className="text-xs font-bold truncate leading-tight">{nodeOf(rec(profileUser)?.name || "My Account")}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{nodeOf(rec(profileUser)?.email || rec(rec(profileUser)?.elite)?.status_name || "TEKZO Customer")}</p>
              </div>

              {/* Menu Links: Profile, Your Orders, Cart, Wishlist */}
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                    isLight ? "hover:bg-slate-100/80 text-slate-700 hover:text-slate-950" : "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4 text-sky-500" />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/dashboard/all-orders"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                    isLight ? "hover:bg-slate-100/80 text-slate-700 hover:text-slate-950" : "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                  }`}
                >
                  <Package className="w-4 h-4 text-indigo-500" />
                  <span>Your Orders</span>
                </Link>

                <Link
                  href="/dashboard/my-bag"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                    isLight ? "hover:bg-slate-100/80 text-slate-700 hover:text-slate-950" : "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>Cart</span>
                </Link>

                <Link
                  href="/dashboard/wishlist"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                    isLight ? "hover:bg-slate-100/80 text-slate-700 hover:text-slate-950" : "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Wishlist</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="border-t border-slate-100 dark:border-white/[0.07] pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 transition-colors cursor-pointer ${
                    isLight ? "hover:bg-rose-50" : "hover:bg-rose-500/10"
                  }`}
                >
                  {loggingOut ? (
                    <>
                      <ImSpinner2 className="animate-spin w-4 h-4" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
