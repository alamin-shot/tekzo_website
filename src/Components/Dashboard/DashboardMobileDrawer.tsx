"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import {
  X,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import type { DashboardMobileDrawerProps } from "@/types/props/dashboard";
import { rec } from "@/lib/json";
import { initialsOf, nodeOf, str } from "@/lib/render";

export default function DashboardMobileDrawer({
  isOpen,
  onClose,
  user,
  menuGroups,
}: DashboardMobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLight } = useDashboardTheme();
  const [profileUser, setProfileUser] = useState<unknown>(user);
  const pu = rec(profileUser);
  const [loggingOut, setLoggingOut] = useState(false);

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

  // Bulletproof mobile background scroll lock
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("touch-action", "none", "important");

      return () => {
        document.documentElement.style.removeProperty("overflow");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("touch-action");
      };
    }
  }, [isOpen]);

  const cleanPath = pathname?.split("?")[0]?.replace(/\/$/, "") || "/dashboard";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      if (onClose) onClose();
      router.push("/login");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* 1. Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
        }}
      />

      {/* 2. Slide-out Drawer Panel (Full width on mobile, matching desktop design) */}
      <div
        className={`relative w-full h-full flex flex-col z-10 shadow-2xl transition-transform duration-300 ease-out transform-gpu will-change-transform font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Text","SF_Pro_Display",sans-serif] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isLight ? "bg-[#F5F5F7] text-slate-900" : "bg-[#070b14] text-white"
        }`}
      >
        {/* Header: Exact 60px height matching topbar */}
        <div
          className={`h-[60px] shrink-0 px-4 flex items-center justify-between border-b transition-colors ${
            isLight
              ? "border-slate-200/80 bg-[#F5F5F7]"
              : "border-white/10 bg-[#0c1424]"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className={`font-bold text-[13px] tracking-tight truncate ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              TEKZO Dashboard
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-[8px] transition-all cursor-pointer ${
              isLight
                ? "text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs"
                : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
            }`}
            title="Close menu"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Body (with overscroll-contain & touch-pan-y to lock background scroll) */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="px-4 sm:px-6 pt-3 pb-8 space-y-3.5">
            {/* Top Apple ID-Style Profile Card (Non-sticky, naturally scrolls) */}
            <div>
              <Link
                href="/dashboard/profile"
                onClick={onClose}
                className={`block rounded-[14px] p-3 transition-all duration-150 cursor-pointer group shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none border ${
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
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-xs flex items-center justify-center bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white">
                    {pu?.profile_picture ? (
                      <Image
                        src={str(pu.profile_picture) ?? ""}
                        alt={str(pu?.name || "Avatar") ?? ""}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
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
                      className={`text-[14px] font-semibold tracking-tight truncate leading-tight ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {nodeOf(pu?.name || "Customer Hub")}
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                      {nodeOf(rec(pu?.elite)?.status_name || "TEKZO Account")}
                    </p>
                    <p className="text-[10px] text-[#007AFF] font-medium truncate leading-tight mt-0.5">
                      {nodeOf(pu?.email || pu?.phone || "Account, Security & Orders")}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 stroke-[2] shrink-0" />
                </div>
              </Link>
            </div>

            {/* Inset Grouped Navigation Cards */}
            <nav className="space-y-3.5">
              {menuGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* Section Title */}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.06em] px-2 block mb-1 leading-none ${
                      isLight ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {group.title}
                  </span>

                  {/* Inset Rounded Card */}
                  <div
                    className={`rounded-[14px] overflow-hidden border shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors ${
                      isLight
                        ? "bg-white border-slate-200/80"
                        : "bg-[#0f182c] border-white/[0.07]"
                    }`}
                  >
                    {group.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon;
                      const isActive = cleanPath === item.href;
                      const isLast = itemIdx === group.items.length - 1;

                      return (
                        <div key={item.id || item.href} className="relative">
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center justify-between min-h-[44px] px-3.5 py-2.5 transition-colors cursor-pointer group ${
                              isActive
                                ? isLight
                                  ? "bg-[#007AFF]/8 text-[#007AFF]"
                                  : "bg-[#007AFF]/18 text-sky-400"
                                : isLight
                                  ? "text-slate-700 hover:bg-slate-50/90"
                                  : "text-slate-300 hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Apple Squircle Icon */}
                              <div
                                className={`w-7 h-7 rounded-[7px] bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shrink-0 ${item.shadow}`}
                              >
                                <ItemIcon className="w-3.5 h-3.5 text-white" />
                              </div>

                              {/* Title */}
                              <span
                                className={`text-[13px] truncate ${
                                  isActive
                                    ? isLight
                                      ? "font-semibold text-[#007AFF]"
                                      : "font-semibold text-white"
                                    : isLight
                                      ? "font-normal text-slate-700"
                                      : "font-normal text-slate-300"
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>

                            <ChevronRight
                              className={`w-4 h-4 stroke-[2] shrink-0 ${
                                isActive
                                  ? isLight
                                    ? "text-[#007AFF]"
                                    : "text-sky-400"
                                  : isLight
                                    ? "text-slate-300"
                                    : "text-slate-600"
                              }`}
                            />
                          </Link>

                          {/* Indented Hairline Divider */}
                          {!isLast && (
                            <div
                              className={`h-[0.5px] ml-[50px] ${
                                isLight ? "bg-slate-100" : "bg-white/[0.05]"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Bottom Inset Sign Out Card */}
              <div
                className={`rounded-[14px] overflow-hidden border shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors mt-2 ${
                  isLight
                    ? "bg-white border-slate-200/80"
                    : "bg-[#0f182c] border-white/[0.07]"
                }`}
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full py-3 px-4 text-[13px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isLight
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-rose-400 hover:bg-rose-500/10"
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
        </div>
      </div>
    </div>
  );
}
