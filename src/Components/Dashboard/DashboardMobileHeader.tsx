"use client";

import React from "react";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import {
  Sun,
  Moon,
  Eye,
  EyeOff,
  Coins,
  Sparkles,
  Menu,
} from "lucide-react";
import type { DashboardMobileHeaderProps } from "@/types/props/dashboard";
import { localeOpt, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

export default function DashboardMobileHeader({ user, onOpenMenu }: DashboardMobileHeaderProps) {
  const { isLight, toggleTheme, showPoints, toggleShowPoints } =
    useDashboardTheme();

  const totalPoints = rec(user)?.total_points ?? null;
  const statusName = rec(rec(user)?.elite)?.status_name || "Member";

  return (
    <header
      className={`lg:hidden fixed top-0 left-0 right-0 h-14 z-40 border-b px-4 sm:px-6 flex items-center justify-between transition-colors duration-200 ${
        isLight
          ? "bg-[#F5F5F7] border-slate-200/80 text-slate-900"
          : "bg-[#0c1424] border-white/10 text-white"
      }`}
    >
      {/* Brand Icon + Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex items-center justify-center text-white shadow-xs shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span
            className={`font-extrabold text-xs block leading-tight truncate ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            TEKZO Dashboard
          </span>
          <span
            className={`text-[10px] font-semibold truncate block ${
              isLight ? "text-sky-600" : "text-sky-400"
            }`}
          >
            {nodeOf(statusName)}
          </span>
        </div>
      </div>

      {/* Right Actions: Points Pill, Theme Toggle, and Menu Trigger */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Points Pill */}
        <button
          type="button"
          onClick={toggleShowPoints}
          className={`flex items-center gap-1.5 h-8 px-2 rounded-lg border text-xs font-bold cursor-pointer active:scale-95 transition-all shrink-0 shadow-2xs ${
            isLight
              ? "bg-slate-50 hover:bg-white border-slate-200 text-slate-900"
              : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white"
          }`}
          title={showPoints ? "Hide points" : "Show points"}
          aria-label={showPoints ? "Hide points" : "Show points"}
        >
          <div
            className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 ${
              isLight
                ? "bg-amber-100 text-amber-600"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            <Coins className="w-2.5 h-2.5" />
          </div>
          <span className="font-mono text-[10px] truncate tracking-tight">
            {totalPoints !== null
              ? showPoints
                ? localeOpt(totalPoints)
                : "••••"
              : nodeOf(statusName)}
          </span>
          <div
            className={`shrink-0 ${
              isLight ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {showPoints ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </div>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer shadow-2xs shrink-0 ${
            isLight
              ? "bg-slate-50 hover:bg-white border-slate-200 text-amber-500"
              : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-sky-400"
          }`}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer shadow-2xs shrink-0 ${
            isLight
              ? "bg-slate-50 hover:bg-white border-slate-200 text-slate-700"
              : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300"
          }`}
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
