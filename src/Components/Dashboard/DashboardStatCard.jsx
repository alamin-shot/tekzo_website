import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  gradient = "from-[#007AFF] to-[#0A84FF]",
  shadow = "shadow-[0_4px_14px_rgba(0,122,255,0.25)]",
  subText,
  href,
  linkText = "View details",
}) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#0f182c] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 group shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5">
      {/* Subtle background glow effect on hover */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-gradient-to-br from-sky-500/5 to-emerald-500/5 dark:from-sky-500/10 dark:to-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
          {Icon && (
            <div
              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center ${shadow} ring-4 ring-white dark:ring-[#0f182c] transition-transform duration-300 group-hover:scale-105`}
            >
              {React.isValidElement(Icon) ? (
                Icon
              ) : (
                <Icon className="w-5 h-5 text-white" />
              )}
            </div>
          )}
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>

      {(subText || href) && (
        <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {subText}
          </span>
          {href && (
            <Link
              href={href}
              className="font-bold inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 group/link transition-colors cursor-pointer"
            >
              <span>{linkText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
