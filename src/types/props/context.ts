// Props for the provider components in src/context/*.
import type { ReactNode } from "react";

export type CounterProviderProps = {
  children?: ReactNode;
  /** Never passed today (both counts start at 0); kept for API compatibility. */
  initialCartCount?: number;
  initialWishlistCount?: number;
};

export type ChildrenProps = {
  children?: ReactNode;
};
