// Props for the shared chrome converted in P4: layouts, navbar, footer,
// popups, SEO JSON-LD, trackers and PreFetchLink. API payloads (company
// settings, categories, brands, products, users) stay `unknown` and are read
// through src/lib/json.ts / src/lib/render.ts guards.
import type { ComponentProps, Dispatch, MouseEvent, ReactNode, SetStateAction } from "react";
import type Link from "next/link";
import type { NavMenuTitle } from "@/types/nav";
import type { NavUser } from "@/types/auth";
import type { QuickAnswerItem, QuickAnswerQuote, QuickAnswerSource } from "@/types/seo";

// ─── Layouts ────────────────────────────────────────────────────────────

export type LayoutProps = {
  children?: ReactNode;
};

/**
 * error.tsx boundary props (Next 16): `error` is whatever was thrown (not
 * always an Error), plus the recovery callbacks. Forwarded as-is to ErrorFallback.
 */
export type ErrorBoundaryProps = {
  error: unknown;
  reset: () => void;
  retry: () => void;
};

// ─── Shared link ────────────────────────────────────────────────────────

/** PreFetchLink accepts everything next/link's <Link> accepts. */
export type PreFetchLinkProps = ComponentProps<typeof Link>;

// ─── Company settings consumers ─────────────────────────────────────────

/** Components that read the /settings payload (raw, unvalidated). */
export type CompanySettingProps = {
  companySetting?: unknown;
};

export type CompanySettingWithChildrenProps = CompanySettingProps & {
  children?: ReactNode;
};

// ─── Navbar ─────────────────────────────────────────────────────────────

export type SidebarFunctionProps = {
  children?: ReactNode;
  categories?: unknown;
  brands?: unknown;
  companySetting?: unknown;
};

export type NavHoverEffectProps = {
  children?: ReactNode;
  title: NavMenuTitle;
  categories?: unknown;
  brands?: unknown;
};

export type ModalBoxProps = {
  title: NavMenuTitle;
  categories?: unknown;
  brands?: unknown;
  setIsHovered: (value: boolean) => void;
};

export type ItemMergeProps = {
  item: unknown;
  name: "brand" | "categories";
};

export type SidebarItemsProps = {
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  categories?: unknown;
  brands?: unknown;
};

export type SidebarItemsDataProps = SidebarItemsProps & {
  title: NavMenuTitle;
};

export type ExpandableContentProps = {
  children?: ReactNode;
  title: NavMenuTitle;
  onToggle: (title: NavMenuTitle) => void;
  isOpen: boolean;
};

export type AllPageProps = {
  link: string;
  title: string;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export type NavItemTileProps = {
  image?: unknown;
  name?: unknown;
  link: string;
  setIsHovered?: (value: boolean) => void;
  setIsSidebarOpen?: Dispatch<SetStateAction<boolean>>;
};

export type NavBadgesProps = {
  isLoggedIn: boolean;
  user?: NavUser;
};

// ─── SEO ────────────────────────────────────────────────────────────────

export type CompanyJsonLdProps = {
  companySetting?: unknown;
  seo?: unknown;
};

export type ProductJsonLdProps = {
  seo?: unknown;
  product?: unknown;
};

export type ProductListJsonLdProps = {
  products?: unknown;
  path: string;
  /** Raw CMS values are passed through into the JSON-LD unchanged. */
  name?: unknown;
  listName?: unknown;
  description?: unknown;
  productPath?: string;
};

export type QuickAnswersProps = {
  title?: string;
  items?: QuickAnswerItem[];
  sources?: QuickAnswerSource[];
  quote?: QuickAnswerQuote | null;
  path?: unknown;
  collapseSources?: boolean;
};

// ─── Trackers ───────────────────────────────────────────────────────────

export type ProductViewTrackerProps = {
  product?: unknown;
};

export type CheckoutTrackerProps = {
  cartItems?: unknown;
};

export type PurchaseTrackerProps = {
  order?: unknown;
};

// ─── Misc handlers ──────────────────────────────────────────────────────

export type LinkClickHandler = (event: MouseEvent<HTMLAnchorElement>) => void;
