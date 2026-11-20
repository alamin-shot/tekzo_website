"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

const DashboardThemeContext = createContext(null);

export function DashboardThemeProvider({ children }) {
  // Theme state: 'light' (default) | 'dark', persisted in localStorage
  const [theme, setThemeState] = useState("light");

  // Sidebar collapsed state: false (expanded, 285px) | true (mini, 72px)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Quick Points / Balance visibility state
  const [showPoints, setShowPoints] = useState(true);

  // Track transition state to prevent rapid double-clicks
  const isTransitioningRef = useRef(false);

  // 1. Hydrate preferences from localStorage on client mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("dash_theme");
      const storedSidebar = localStorage.getItem("dash_sidebar_collapsed");
      const storedPoints = localStorage.getItem("dash_show_points");

      queueMicrotask(() => {
        if (storedTheme === "light" || storedTheme === "dark") {
          setThemeState(storedTheme);
        } else {
          setThemeState("light");
        }

        if (storedSidebar !== null) {
          setIsSidebarCollapsed(storedSidebar === "true");
        }

        if (storedPoints !== null) {
          setShowPoints(storedPoints === "true");
        }
      });
    } catch {
      // Fallback gracefully if localStorage is unavailable
    }
  }, []);

  // 2. Synchronize theme class on document element
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

  // 3. Direct theme setter
  const setTheme = useCallback((newTheme) => {
    const val = newTheme === "light" ? "light" : "dark";
    setThemeState(val);
    try {
      localStorage.setItem("dash_theme", val);
    } catch {}
  }, []);

  // 4. Circular ripple View Transition toggle
  const toggleTheme = useCallback((event) => {
    if (isTransitioningRef.current) return;

    let x = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let y = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    const target = event?.currentTarget || event?.target;
    if (target && typeof target.getBoundingClientRect === "function") {
      const rect = target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event?.clientX && event?.clientY) {
      x = event.clientX;
      y = event.clientY;
    }

    const nextTheme = theme === "dark" ? "light" : "dark";

    const hasViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasViewTransition) {
      setThemeState(nextTheme);
      try {
        localStorage.setItem("dash_theme", nextTheme);
      } catch {}
      return;
    }

    isTransitioningRef.current = true;

    const endRadius =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) + 25;

    document.documentElement.style.setProperty("--theme-origin-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-origin-y", `${y}px`);
    document.documentElement.style.setProperty("--theme-end-radius", `${endRadius}px`);

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setThemeState(nextTheme);
        try {
          localStorage.setItem("dash_theme", nextTheme);
        } catch {}
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        { clipPath },
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });

    transition.finished.finally(() => {
      isTransitioningRef.current = false;
      document.documentElement.style.removeProperty("--theme-origin-x");
      document.documentElement.style.removeProperty("--theme-origin-y");
      document.documentElement.style.removeProperty("--theme-end-radius");
    });
  }, [theme]);

  // 5. Toggle sidebar collapsed mode (72px mini <-> 285px expanded)
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dash_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  // 6. Toggle points visibility
  const toggleShowPoints = useCallback(() => {
    setShowPoints((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dash_show_points", String(next));
      } catch {}
      return next;
    });
  }, []);

  const value = {
    theme,
    isLight: theme === "light",
    isSidebarCollapsed,
    showPoints,
    setTheme,
    toggleTheme,
    toggleSidebar,
    toggleShowPoints,
  };

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    throw new Error("useDashboardTheme must be used within a DashboardThemeProvider");
  }
  return context;
}

export default DashboardThemeContext;
