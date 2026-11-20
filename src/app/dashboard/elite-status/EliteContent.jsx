"use client";

import Image from "next/image";
import { useState } from "react";
import { FiCheckCircle, FiLock, FiAward, FiTrendingUp } from "react-icons/fi";
import { Sparkles } from "lucide-react";

const TIER_STYLES = [
  {
    color: "#cd7f32",
    gradient: "linear-gradient(135deg, #2a1b0a 0%, #452c16 100%)",
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    color: "#9ca3af",
    gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    accent: "text-slate-500 dark:text-slate-300",
  },
  {
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #451a03 0%, #78350f 100%)",
    accent: "text-amber-500 dark:text-amber-400",
  },
  {
    color: "#38bdf8",
    gradient: "linear-gradient(135deg, #082f49 0%, #0369a1 100%)",
    accent: "text-sky-500 dark:text-sky-400",
  },
  {
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #3b0764 0%, #6b21a8 100%)",
    accent: "text-purple-500 dark:text-purple-400",
  },
];

export default function EliteContent({ user, tiers }) {
  const [activeId, setActiveId] = useState(
    user?.elite?.id ?? tiers?.[0]?.id ?? null,
  );

  const activeIndex = tiers.findIndex((t) => t.id === activeId);
  const activeTier = tiers[activeIndex] ?? tiers[0] ?? null;
  const activeStyle =
    TIER_STYLES[activeIndex % TIER_STYLES.length] ?? TIER_STYLES[0];

  const totalPoints = user?.total_points ?? 0;
  const requiredPoints = user?.elite?.point ?? 0;
  const progress =
    requiredPoints > 0
      ? Math.min(100, (totalPoints / requiredPoints) * 100)
      : 0;
  const pointsLeft = Math.max(0, requiredPoints - totalPoints);

  // History helpers
  const getHistoryEntry = (tierId) =>
    user?.elite_history?.find((h) => h.elite.id === tierId) ?? null;

  const getTierStatus = (tierId) => {
    const inHistory = !!getHistoryEntry(tierId);
    if (!inHistory) return "future";
    if (tierId === user?.elite?.id) return "current";
    return "unlocked";
  };

  const activeStatus = getTierStatus(activeId);
  const activeHistoryEntry = getHistoryEntry(activeId);
  const activeBenefits = activeHistoryEntry?.elite?.benefits ?? [];

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1627] to-[#070c17] border border-white/[0.08] p-7 sm:p-9 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiAward size={14} />
              <span>Membership Privileges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
              {user?.elite?.status_name ?? "Prestigious Member"}
            </h1>
            <p className="text-slate-300 mt-1.5 text-xs sm:text-sm max-w-md leading-relaxed">
              {user?.elite?.tagline ?? "Unlock higher reward tiers and exclusive privileges with every order."}
            </p>

            <div className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Available Balance
              </span>
              <span className="text-amber-400 font-mono font-black text-lg sm:text-xl tracking-tight">
                {totalPoints.toLocaleString()} PTS
              </span>
            </div>
          </div>

          <div className="relative shrink-0 opacity-95 drop-shadow-2xl">
            <Image
              src="/dashboard/points.svg"
              alt="points"
              width={200}
              height={200}
              className="w-28 lg:w-36 drop-shadow-[0_10px_24px_rgba(245,158,11,0.25)]"
            />
          </div>
        </div>
      </div>

      {/* ── Current Tier Progress ── */}
      {user?.elite && (
        <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {totalPoints.toLocaleString()}
              </span>{" "}
              points earned
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Goal:{" "}
              <span className="font-extrabold text-slate-900 dark:text-white">
                {requiredPoints.toLocaleString()}
              </span>{" "}
              points
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-white/[0.08] rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="font-bold text-sky-600 dark:text-sky-400 inline-flex items-center gap-1">
              <FiTrendingUp className="w-3.5 h-3.5" />
              {progress.toFixed(1)}% Completed
            </span>
            {pointsLeft > 0 ? (
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {pointsLeft.toLocaleString()} points needed to level up
              </span>
            ) : (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ Tier Reached!
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Tier Tabs ── */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tiers.map((tier, i) => {
            const isActive = activeId === tier.id;
            const status = getTierStatus(tier.id);
            const style = TIER_STYLES[i % TIER_STYLES.length];

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveId(tier.id)}
                className={`relative flex flex-col justify-center items-center rounded-3xl overflow-hidden px-4 py-6 transition-all duration-300 ease-in-out border cursor-pointer ${
                  isActive
                    ? "shadow-md scale-[1.02] border-sky-500 ring-2 ring-sky-500/20"
                    : "bg-white dark:bg-[#0f182c] border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20"
                }`}
                style={
                  !tier.banner && isActive
                    ? { background: style.gradient }
                    : {}
                }
              >
                {/* Banner background */}
                {tier.banner && (
                  <>
                    <Image
                      src={tier.banner}
                      alt={tier.status_name}
                      fill
                      className="object-cover"
                    />
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        isActive ? "bg-black/75" : "bg-black/35"
                      }`}
                    />
                  </>
                )}

                {/* Status badge */}
                {status === "unlocked" && (
                  <span className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                    ✓ Unlocked
                  </span>
                )}
                {status === "current" && (
                  <span className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                    Current
                  </span>
                )}
                {status === "future" && (
                  <FiLock
                    size={13}
                    className="absolute top-3 right-3 z-10 text-slate-400"
                  />
                )}

                {/* Logo */}
                {tier.logo && (
                  <div className="relative z-10 mb-2.5">
                    <Image
                      src={tier.logo}
                      alt={tier.status_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain rounded-xl bg-white/10 backdrop-blur-sm p-1.5"
                    />
                  </div>
                )}

                <p
                  className={`relative z-10 text-sm sm:text-base font-bold transition-colors duration-300 ${
                    tier.banner || isActive ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {tier.status_name}
                </p>
                <p
                  className={`relative z-10 text-xs mt-0.5 transition-colors duration-300 text-center ${
                    tier.banner || isActive ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tier.tagline}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Benefits Section ── */}
      <div className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Exclusive Privileges for{" "}
            <span style={{ color: activeStyle.color }} className="font-extrabold">
              {activeTier?.status_name ?? ""}
            </span>
          </h2>
        </div>

        {/* Unlocked tier — show benefits with check icons */}
        {activeStatus === "unlocked" && activeBenefits.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden">
            {activeBenefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <FiCheckCircle
                  size={18}
                  className="shrink-0 text-emerald-500"
                />
                <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">
                  {benefit.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Current tier — show benefits with lock/unlocked icons */}
        {activeStatus === "current" && activeBenefits.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-white/[0.06] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden">
            {activeBenefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                {benefit.available ? (
                  <FiCheckCircle
                    size={18}
                    className="shrink-0 text-emerald-500"
                  />
                ) : (
                  <FiLock size={16} className="shrink-0 text-slate-400" />
                )}
                <p
                  className={`text-sm ${
                    benefit.available
                      ? "text-slate-800 dark:text-slate-200 font-semibold"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {benefit.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Future tier — show points needed */}
        {activeStatus === "future" && (
          <div className="p-8 text-center rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
              <FiLock size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Earn{" "}
              <span style={{ color: activeStyle.color }} className="font-bold">
                {(activeTier?.point ?? 0).toLocaleString()} points
              </span>{" "}
              to unlock {activeTier?.status_name} benefits
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {Math.max(
                0,
                (activeTier?.point ?? 0) - totalPoints,
              ).toLocaleString()}{" "}
              more points needed to reach this tier
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
