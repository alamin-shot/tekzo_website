"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import {
  LayoutDashboard,
  User,
  MapPin,
  Crown,
  Tag,
  ShoppingBag,
  Package,
  Heart,
  Clock,
  CheckCircle2,
  RotateCcw,
  Truck,
  XCircle,
  Star,
  History,
  Smartphone,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { DashboardMenuGroup, SidebarProps, SidebarTooltip } from "@/types/props/dashboard";
import { rec } from "@/lib/json";
import { initialsOf, nodeOf, str } from "@/lib/render";

// ============================================================================
// DASHBOARD MENU GROUPS
// Preserving all existing items, routes, icons, gradients, and shadows
// ============================================================================
export const DASHBOARD_MENU_GROUPS: DashboardMenuGroup[] = [
  {
    title: "Account",
    items: [
      {
        id: "manage-account",
        name: "Manage My Account",
        href: "/dashboard/manage-account",
        icon: LayoutDashboard,
        gradient: "from-[#007AFF] to-[#0A84FF]",
      },
      {
        id: "profile",
        name: "My Profile",
        href: "/dashboard/profile",
        icon: User,
        gradient: "from-[#32ADE6] to-[#007AFF]",
      },
      {
        id: "address-book",
        name: "Address Account Book",
        href: "/dashboard/address-book",
        icon: MapPin,
        gradient: "from-[#009688] to-[#34C759]",
      },
      {
        id: "elite-status",
        name: "Elite Status",
        href: "/dashboard/elite-status",
        icon: Crown,
        gradient: "from-[#F59E0B] to-[#D97706]",
      },
      {
        id: "coupons",
        name: "Coupons",
        href: "/dashboard/coupons",
        icon: Tag,
        gradient: "from-[#FF2D55] to-[#FF375F]",
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        id: "my-bag",
        name: "My Bag",
        href: "/dashboard/my-bag",
        icon: ShoppingBag,
        gradient: "from-[#FF9500] to-[#FF5E3A]",
      },
      {
        id: "all-orders",
        name: "All Orders",
        href: "/dashboard/all-orders",
        icon: Package,
        gradient: "from-[#007AFF] to-[#5856D6]",
      },
      {
        id: "wishlist",
        name: "My Wishlist",
        href: "/dashboard/wishlist",
        icon: Heart,
        gradient: "from-[#FF2D55] to-[#E11D48]",
      },
      {
        id: "pending-order",
        name: "Pending",
        href: "/dashboard/pending-order",
        icon: Clock,
        gradient: "from-[#F59E0B] to-[#EA580C]",
      },
      {
        id: "confirmed-order",
        name: "Confirmed",
        href: "/dashboard/confirmed-order",
        icon: CheckCircle2,
        gradient: "from-[#10B981] to-[#059669]",
      },
      {
        id: "processing-order",
        name: "Processing",
        href: "/dashboard/processing-order",
        icon: RotateCcw,
        gradient: "from-[#3B82F6] to-[#2563EB]",
      },
      {
        id: "ready-to-ship",
        name: "Ready to Ship",
        href: "/dashboard/ready-to-ship",
        icon: Truck,
        gradient: "from-[#8B5CF6] to-[#6D28D9]",
      },
      {
        id: "delivered",
        name: "Delivered",
        href: "/dashboard/delivered",
        icon: CheckCircle2,
        gradient: "from-[#059669] to-[#047857]",
      },
      {
        id: "cancelled",
        name: "Cancelled",
        href: "/dashboard/cancelled",
        icon: XCircle,
        gradient: "from-[#EF4444] to-[#DC2626]",
      },
      {
        id: "return",
        name: "Return",
        href: "/dashboard/return",
        icon: RotateCcw,
        gradient: "from-[#6B7280] to-[#4B5563]",
      },
    ],
  },
  {
    title: "Reviews",
    items: [
      {
        id: "to-reviews",
        name: "To Reviews",
        href: "/dashboard/to-reviews",
        icon: Star,
        gradient: "from-[#F59E0B] to-[#D97706]",
      },
      {
        id: "review-history",
        name: "History",
        href: "/dashboard/review-history",
        icon: History,
        gradient: "from-[#6366F1] to-[#4F46E5]",
      },
    ],
  },
  {
    title: "Selling",
    items: [
      {
        id: "sell-your-device",
        name: "Sell Your Device",
        href: "/dashboard/sell-your-device",
        icon: Smartphone,
        gradient: "from-[#10B981] to-[#0D9488]",
      },
      {
        id: "my-sell-requests",
        name: "My Sell Requests",
        href: "/dashboard/my-sell-requests",
        icon: Send,
        gradient: "from-[#0284C7] to-[#0369A1]",
      },
    ],
  },
];

export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<unknown>(user);
  const pu = rec(profileUser);
  const [loggingOut, setLoggingOut] = useState(false);

  // WhatsApp-style hover popup state for collapsed mode
  const [hoveredTooltip, setHoveredTooltip] = useState<SidebarTooltip | null>(null);

  const { isLight, isSidebarCollapsed, toggleSidebar } = useDashboardTheme();

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

  // Clear tooltip if sidebar expands
  useEffect(() => {
    if (!isSidebarCollapsed) {
      setHoveredTooltip(null);
    }
  }, [isSidebarCollapsed]);

  const cleanPath = pathname?.split("?")[0]?.replace(/\/$/, "") || "/dashboard";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      if (onClose) onClose();
      router.push("/login");
    }
  };

  // WhatsApp-style popup triggers for collapsed sidebar
  const handleTooltipEnter = (name: unknown, e: ReactMouseEvent<HTMLElement>) => {
    if (!isSidebarCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      name,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleTooltipLeave = () => {
    setHoveredTooltip(null);
  };

  return (
    <div
      className={`w-full h-full flex flex-col text-left select-none overflow-hidden transition-colors duration-200 font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Text","SF_Pro_Display",sans-serif] ${
        isLight ? "bg-[#F5F5F7] text-slate-900" : "bg-[#070b14] text-white"
      }`}
    >
      {/* ===================================================================== */}
      {/* 1. TOP HEADER (Exact 60px height matching topbar)                     */}
      {/* ===================================================================== */}
      <div
        className={`h-[60px] shrink-0 flex items-center border-b transition-colors ${
          isLight ? "border-slate-200/80 bg-[#F5F5F7]" : "border-white/10 bg-[#0c1424]"
        } ${isSidebarCollapsed ? "justify-center px-2" : "justify-between px-3.5"}`}
      >
        {isSidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            onMouseEnter={(e) => handleTooltipEnter("Expand sidebar", e)}
            onMouseLeave={handleTooltipLeave}
            className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer ${
              isLight ? "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs" : "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/10"
            }`}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex items-center justify-center text-white shadow-xs shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`font-bold text-[13px] tracking-tight truncate ${isLight ? "text-slate-900" : "text-white"}`}>TEKZO</span>
            </div>

            {/* Collapse Sidebar Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className={`p-1.5 rounded-[8px] transition-all cursor-pointer ${
                isLight ? "text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs" : "text-slate-500 hover:text-white hover:bg-white/[0.08]"
              }`}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. SCROLLABLE NAVIGATION BODY (Profile Section Naturally Scrolls)     */}
      {/* ===================================================================== */}
      <div onScroll={handleTooltipLeave} className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {isSidebarCollapsed ? (
          /* Mini Collapsed View */
          <div className="py-2.5 flex flex-col items-center gap-2 px-2">
            {/* Collapsed Profile Avatar */}
            <Link
              href="/dashboard/profile"
              onClick={() => {
                handleTooltipLeave();
                if (onClose) onClose();
              }}
              onMouseEnter={(e) => handleTooltipEnter(pu?.name || "My Profile", e)}
              onMouseLeave={handleTooltipLeave}
              aria-label={str(pu?.name || "Profile")}
              className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-center bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white cursor-pointer hover:scale-105 transition-transform shrink-0"
            >
              {pu?.profile_picture ? (
                <Image src={str(pu.profile_picture) ?? ""} alt={str(pu?.name || "Avatar") ?? ""} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-xs">
                  {pu?.name ? initialsOf(pu.name)
                    : "U"}
                </span>
              )}
            </Link>

            <div className="w-6 h-[0.5px] bg-slate-200 dark:bg-white/10 my-1" />

            {/* Squircles Rail */}
            <nav className="flex flex-col items-center gap-1.5 w-full">
              {DASHBOARD_MENU_GROUPS.flatMap((group) => group.items).map((item) => {
                const ItemIcon = item.icon;
                const isActive = cleanPath === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      handleTooltipLeave();
                      if (onClose) onClose();
                    }}
                    onMouseEnter={(e) => handleTooltipEnter(item.name, e)}
                    onMouseLeave={handleTooltipLeave}
                    aria-label={item.name}
                    className={`w-9 h-9 rounded-[9px] flex items-center justify-center transition-all duration-150 cursor-pointer group ${
                      isActive ? "ring-2 ring-[#007AFF] shadow-md scale-105" : "hover:scale-105"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-[7px] bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shrink-0 ${item.shadow}`}>
                      <ItemIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="w-6 h-[0.5px] bg-slate-200 dark:bg-white/10 my-1" />

            {/* Collapsed Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              onMouseEnter={(e) => handleTooltipEnter("Sign Out", e)}
              onMouseLeave={handleTooltipLeave}
              aria-label="Sign Out"
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all cursor-pointer ${
                isLight ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
              }`}
            >
              {loggingOut ? <ImSpinner2 className="animate-spin text-xs text-rose-500" /> : <LogOut className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          /* Expanded iPhone Settings Inset Grouped View */
          <div className="px-3 pt-3 pb-8 space-y-3.5">
            {/* =============================================================== */}
            {/* PROFILE CARD AT TOP (Non-sticky, naturally scrolls with content)*/}
            {/* =============================================================== */}
            <div>
              <Link
                href="/dashboard/profile"
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={`block rounded-[14px] p-2.5 transition-all duration-150 cursor-pointer group shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none border ${
                  cleanPath === "/dashboard/profile"
                    ? isLight
                      ? "bg-white border-[#007AFF] ring-2 ring-[#007AFF]/20"
                      : "bg-[#0f182c] border-[#007AFF] ring-2 ring-[#007AFF]/30"
                    : isLight
                      ? "bg-white border-slate-200/80 hover:bg-slate-50/80"
                      : "bg-[#0f182c] border-white/[0.07] hover:bg-white/[0.03]"
                }`}
                title="View Profile"
              >
                <div className="flex items-center gap-3">
                  {/* Circular Avatar */}
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-xs flex items-center justify-center bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white">
                    {pu?.profile_picture ? (
                      <Image
                        src={str(pu.profile_picture) ?? ""}
                        alt={str(pu?.name || "Avatar") ?? ""}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="font-bold text-sm tracking-tight">
                        {pu?.name ? initialsOf(pu.name)
                          : "U"}
                      </span>
                    )}
                  </div>

                  {/* Name & Subtitles */}
                  <div className="min-w-0 flex-1">
                    <h2
                      className={`text-[13px] font-semibold tracking-tight truncate leading-tight transition-colors ${
                        isLight ? "text-slate-900 group-hover:text-[#007AFF]" : "text-white group-hover:text-[#007AFF]"
                      }`}
                    >
                      {nodeOf(pu?.name || "Customer Hub")}
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">{nodeOf(rec(pu?.elite)?.status_name || "TEKZO Account")}</p>
                    <p className="text-[10px] text-[#007AFF] font-medium truncate leading-tight mt-0.5">{nodeOf(pu?.email || pu?.phone || "Account, Security & Orders")}</p>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 stroke-[2] transition-colors shrink-0" />
                </div>
              </Link>
            </div>

            {/* =============================================================== */}
            {/* INSET GROUPED CARDS (Account, Orders, Reviews, Selling)          */}
            {/* =============================================================== */}
            <nav className="space-y-3.5">
              {DASHBOARD_MENU_GROUPS.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* iOS Section Title */}
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.06em] px-2 block mb-1 leading-none ${isLight ? "text-slate-400" : "text-slate-500"}`}>{group.title}</span>

                  {/* iPhone Inset Rounded Group Card */}
                  <div
                    className={`rounded-[14px] overflow-hidden border shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors ${
                      isLight ? "bg-white border-slate-200/80" : "bg-[#0f182c] border-white/[0.07]"
                    }`}
                  >
                    {group.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon;
                      const isActive = cleanPath === item.href;
                      const isLast = itemIdx === group.items.length - 1;

                      return (
                        <div key={item.id} className="relative">
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (onClose) onClose();
                            }}
                            className={`flex items-center justify-between min-h-[40px] px-3 py-2 transition-colors cursor-pointer group ${
                              isActive
                                ? isLight
                                  ? "bg-[#007AFF]/8 text-[#007AFF]"
                                  : "bg-[#007AFF]/18 text-sky-400"
                                : isLight
                                  ? "text-slate-700 hover:bg-slate-50/90"
                                  : "text-slate-300 hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Apple Squircle Icon */}
                              <div
                                className={`w-7 h-7 rounded-[7px] bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shrink-0 transition-transform duration-150 ${
                                  item.shadow
                                } ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                              >
                                <ItemIcon className="w-3.5 h-3.5 text-white" />
                              </div>

                              {/* Item Title */}
                              <span
                                className={`text-[12.5px] truncate transition-colors ${
                                  isActive
                                    ? isLight
                                      ? "font-semibold text-[#007AFF]"
                                      : "font-semibold text-white"
                                    : isLight
                                      ? "font-normal text-slate-700 group-hover:text-slate-950"
                                      : "font-normal text-slate-300 group-hover:text-white"
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>

                            {/* Right iOS Disclosure Indicator */}
                            <ChevronRight
                              className={`w-3.5 h-3.5 stroke-[2] transition-transform duration-150 flex-shrink-0 ${
                                isActive
                                  ? isLight
                                    ? "text-[#007AFF] translate-x-0.5"
                                    : "text-sky-400 translate-x-0.5"
                                  : isLight
                                    ? "text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5"
                                    : "text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5"
                              }`}
                            />
                          </Link>

                          {/* Indented iOS Hairline Divider (starts after squircle icon) */}
                          {!isLast && <div className={`h-[0.5px] ml-[46px] ${isLight ? "bg-slate-100" : "bg-white/[0.05]"}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Bottom Inset Sign Out Action Card (iPhone Settings style) */}
              <div
                className={`rounded-[14px] overflow-hidden border shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors mt-2 ${
                  isLight ? "bg-white border-slate-200/80" : "bg-[#0f182c] border-white/[0.07]"
                }`}
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full py-2.5 px-3 text-[12.5px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isLight ? "text-rose-600 hover:bg-rose-50" : "text-rose-400 hover:bg-rose-500/10"
                  }`}
                >
                  {loggingOut ? (
                    <>
                      <ImSpinner2 className="animate-spin text-xs" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. WHATSAPP-STYLE INSTANT HOVER POPUP (Icon Level Center Aligned)     */}
      {/* ===================================================================== */}
      {isSidebarCollapsed && hoveredTooltip && (
        <div
          className="fixed z-[9999] pointer-events-none -translate-y-1/2 flex items-center select-none"
          style={{
            top: `${hoveredTooltip.top}px`,
            left: `${hoveredTooltip.left}px`,
          }}
        >
          {/* Triangular Left Arrow Pointer */}
          <svg className={`w-2 h-3.5 shrink-0 -mr-[1px] z-10 ${isLight ? "text-[#111b21]" : "text-[#1f2c34]"}`} viewBox="0 0 8 14" fill="currentColor" aria-hidden="true">
            <path d="M8 0L0 7L8 14Z" />
          </svg>

          {/* WhatsApp Style Tooltip Pill */}
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight whitespace-nowrap shadow-xl flex items-center ${
              isLight ? "bg-[#111b21] text-white shadow-[0_4px_16px_rgba(0,0,0,0.28)]" : "bg-[#1f2c34] text-[#e9edef] border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.55)]"
            }`}
          >
            {nodeOf(hoveredTooltip.name)}
          </div>
        </div>
      )}
    </div>
  );
}
