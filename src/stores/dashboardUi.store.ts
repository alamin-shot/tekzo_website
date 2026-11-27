import { create } from "zustand";
import { flushSync } from "react-dom";
import type { DashboardTheme, DashboardUiStore, ThemeToggleOrigin } from "@/types/store";

// Dashboard UI preferences (was React state inside DashboardThemeProvider).
//
// Storage parity: the same three keys and string values as before —
// dash_theme ("light" | "dark"), dash_sidebar_collapsed ("true" | "false"),
// dash_show_points ("true" | "false"). No `persist` middleware (it would
// replace them with one JSON blob).
//
// Hydration: defaults (light / expanded / points shown) on server and first
// client render; DashboardThemeProvider calls hydrate() after mount, which
// applies stored values in a microtask, exactly as before.

const THEME_KEY = "dash_theme";
const SIDEBAR_KEY = "dash_sidebar_collapsed";
const POINTS_KEY = "dash_show_points";

const save = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

// Guards against rapid double-clicks while a view transition runs (was a ref
// in the provider; there is only ever one dashboard provider mounted).
let isTransitioning = false;

// Element-like target with getBoundingClientRect (event.currentTarget/target).
const hasRect = (value: unknown): value is Element => value instanceof Element;

export const useDashboardUiStore = create<DashboardUiStore>()((set, get) => ({
  theme: "light",
  isSidebarCollapsed: false,
  showPoints: true,

  hydrate: () => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      const storedSidebar = localStorage.getItem(SIDEBAR_KEY);
      const storedPoints = localStorage.getItem(POINTS_KEY);

      queueMicrotask(() => {
        if (storedTheme === "light" || storedTheme === "dark") {
          set({ theme: storedTheme });
        } else {
          set({ theme: "light" });
        }

        if (storedSidebar !== null) {
          set({ isSidebarCollapsed: storedSidebar === "true" });
        }

        if (storedPoints !== null) {
          set({ showPoints: storedPoints === "true" });
        }
      });
    } catch {
      // Fallback gracefully if localStorage is unavailable
    }
  },

  setTheme: (newTheme) => {
    const val: DashboardTheme = newTheme === "light" ? "light" : "dark";
    set({ theme: val });
    save(THEME_KEY, val);
  },

  // Circular ripple View Transition toggle
  toggleTheme: (event?: ThemeToggleOrigin | null) => {
    if (isTransitioning) return;

    let x = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let y = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    const target = event?.currentTarget || event?.target;
    if (target && hasRect(target)) {
      const rect = target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event?.clientX && event?.clientY) {
      x = Number(event.clientX);
      y = Number(event.clientY);
    }

    const nextTheme: DashboardTheme = get().theme === "dark" ? "light" : "dark";

    const hasViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasViewTransition) {
      set({ theme: nextTheme });
      save(THEME_KEY, nextTheme);
      return;
    }

    isTransitioning = true;

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 25;

    document.documentElement.style.setProperty("--theme-origin-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-origin-y", `${y}px`);
    document.documentElement.style.setProperty("--theme-end-radius", `${endRadius}px`);

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        set({ theme: nextTheme });
        save(THEME_KEY, nextTheme);
      });
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        { clipPath },
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });

    transition.finished.finally(() => {
      isTransitioning = false;
      document.documentElement.style.removeProperty("--theme-origin-x");
      document.documentElement.style.removeProperty("--theme-origin-y");
      document.documentElement.style.removeProperty("--theme-end-radius");
    });
  },

  // Toggle sidebar collapsed mode (72px mini <-> 285px expanded)
  toggleSidebar: () => {
    const next = !get().isSidebarCollapsed;
    save(SIDEBAR_KEY, String(next));
    set({ isSidebarCollapsed: next });
  },

  // Toggle points visibility
  toggleShowPoints: () => {
    const next = !get().showPoints;
    save(POINTS_KEY, String(next));
    set({ showPoints: next });
  },
}));

// Selectors
export const selectDashboardTheme = (s: DashboardUiStore): DashboardTheme => s.theme;
export const selectIsLight = (s: DashboardUiStore): boolean => s.theme === "light";
