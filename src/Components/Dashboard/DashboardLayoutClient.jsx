"use client";

import React, { useState } from "react";
import { useDashboardTheme } from "@/context/DashboardThemeContext";
import Sidebar, { DASHBOARD_MENU_GROUPS } from "./Sidebar";
import DashboardTopNavbar from "./DashboardTopNavbar";
import DashboardMobileHeader from "./DashboardMobileHeader";
import DashboardBottomNav from "./DashboardBottomNav";
import DashboardMobileDrawer from "./DashboardMobileDrawer";

export default function DashboardLayoutClient({ children, user }) {
  const { theme, isLight, isSidebarCollapsed } = useDashboardTheme();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div
      className={`dashboard-root ${theme} min-h-screen w-full flex bg-dash-bg text-dash-text-primary relative selection:bg-sky-500/30 selection:text-sky-200 no-scrollbar`}
      style={{
        background: "var(--dash-bg-gradient)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 1. DESKTOP FIXED SIDEBAR (LG & ABOVE) */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 h-screen border-r z-40 no-scrollbar overflow-hidden transition-all duration-300 ease-in-out ${
          isLight ? "bg-[#F5F5F7] border-slate-200/80" : "bg-[#070b14] border-white/10"
        } ${
          isSidebarCollapsed ? "w-[72px]" : "lg:w-[270px] xl:w-[285px]"
        }`}
      >
        <Sidebar user={user} onClose={() => setMobileDrawerOpen(false)} />
      </aside>

      {/* 2. MAIN VIEWPORT (TOP NAVBAR + CONTENT) */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[270px] xl:pl-[285px]"
        }`}
      >
        {/* Desktop Fixed Top Navbar (60px) */}
        <div
          className={`hidden lg:block fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "left-[72px]" : "left-[270px] xl:left-[285px]"
          }`}
        >
          <DashboardTopNavbar user={user} />
        </div>

        {/* Mobile Header (56px) */}
        <DashboardMobileHeader
          user={user}
          onOpenMenu={() => setMobileDrawerOpen(true)}
        />

        {/* Fixed Topbar Height Spacer */}
        <div className="h-14 lg:h-[60px] shrink-0 w-full" aria-hidden="true" />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 pb-24 lg:pb-12 no-scrollbar">
          {children}
        </main>
      </div>

      {/* 3. MOBILE 5-ITEM BOTTOM NAVIGATION BAR */}
      <DashboardBottomNav onOpenMenu={() => setMobileDrawerOpen(true)} />

      {/* 4. MOBILE SLIDE-OVER DRAWER SHEET */}
      <DashboardMobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        user={user}
        menuGroups={DASHBOARD_MENU_GROUPS}
      />
    </div>
  );
}
