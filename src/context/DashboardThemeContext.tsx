"use client";

import { createContext, useContext, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import type { DashboardThemeContextValue } from "@/types/store";
import type { ChildrenProps } from "@/types/props/context";
import { useDashboardUiStore } from "@/stores/dashboardUi.store";

// Compatibility layer over src/stores/dashboardUi.store.ts (P3). Public API
// (DashboardThemeProvider, useDashboardTheme, default export) is unchanged.

// Marks "inside DashboardThemeProvider" so the hook keeps its old error outside it.
const DashboardThemeContext = createContext(false);

export function DashboardThemeProvider({ children }: ChildrenProps) {
  const hydrate = useDashboardUiStore((s) => s.hydrate);
  const theme = useDashboardUiStore((s) => s.theme);

  // 1. Hydrate preferences from localStorage on client mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 2. Synchronize theme class on document element (removed on unmount,
  //    i.e. when leaving the dashboard — as before).
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.remove("dark");
      }
    };
  }, [theme]);

  return <DashboardThemeContext.Provider value={true}>{children}</DashboardThemeContext.Provider>;
}

export function useDashboardTheme(): DashboardThemeContextValue {
  const inside = useContext(DashboardThemeContext);
  const value = useDashboardUiStore(
    useShallow((s) => ({
      theme: s.theme,
      isLight: s.theme === "light",
      isSidebarCollapsed: s.isSidebarCollapsed,
      showPoints: s.showPoints,
      setTheme: s.setTheme,
      toggleTheme: s.toggleTheme,
      toggleSidebar: s.toggleSidebar,
      toggleShowPoints: s.toggleShowPoints,
    })),
  );
  if (!inside) {
    throw new Error("useDashboardTheme must be used within a DashboardThemeProvider");
  }
  return value;
}

export default DashboardThemeContext;
