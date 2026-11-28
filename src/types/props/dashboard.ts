// Props and local state for the /dashboard area (P7). API payloads (user,
// orders, addresses, reviews, listings) stay `unknown` and are read through
// src/lib/json.ts / src/lib/render.ts.
import type { ComponentType, ReactElement, ReactNode } from "react";

export type ChildrenProps = {
  children: ReactNode;
};

/** The signed-in customer from getAuthUser() (null when signed out). */
export type DashboardUserProps = {
  user?: unknown;
};

export type DashboardLayoutClientProps = {
  children: ReactNode;
  user?: unknown;
};

export type DashboardMobileHeaderProps = {
  user?: unknown;
  onOpenMenu: () => void;
};

export type DashboardBottomNavProps = {
  onOpenMenu: () => void;
};

/** An icon component (lucide) or an already-built element. */
export type DashboardIcon = ComponentType<{ className?: string; size?: number | string; strokeWidth?: number }>;

export type DashboardStatCardProps = {
  label?: ReactNode;
  value?: unknown;
  icon?: DashboardIcon | ReactElement;
  gradient?: string;
  shadow?: string;
  subText?: unknown;
  href?: string;
  linkText?: ReactNode;
};

/** One entry of DASHBOARD_MENU_GROUPS (Sidebar.tsx). `shadow` is read but never set (renders "undefined" in the class list, as before). */
export type DashboardMenuItem = {
  id: string;
  name: string;
  href: string;
  icon: DashboardIcon;
  gradient: string;
  shadow?: string;
};

export type DashboardMenuGroup = {
  title: string;
  items: DashboardMenuItem[];
};

export type SidebarProps = {
  user?: unknown;
  onClose?: () => void;
};

/** Collapsed-sidebar hover tooltip (name as passed by the caller). */
export type SidebarTooltip = {
  name: unknown;
  top: number;
  left: number;
};

export type DashboardMobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: unknown;
  menuGroups: DashboardMenuGroup[];
};

/** Components/Dashboard/DashboardTable (no importers; its sample list is empty). */
export type DashboardSampleOrder = {
  id: number;
  placedOn: string;
  qty: number;
  total: number;
  status: string;
};

export type DashboardTableProps = {
  title?: ReactNode;
};

export type DashboardStatusBadgeProps = {
  status: string;
};

export type DashboardOrderRowProps = {
  order: DashboardSampleOrder;
};

/** Coupons page claim banner. */
export type CouponClaimMessage = {
  type: string;
  text: string;
};

/** Review history / to-review rows (API rating passed through). */
export type RatingProps = {
  rating: unknown;
};

export type ReviewRowProps = {
  review: unknown;
  isLast: boolean;
};

export type SkeletonRowProps = {
  isLast: boolean;
};

/** app/dashboard/elite-status/EliteContent (user from getAuthUser, tiers from /elite). */
export type EliteContentProps = {
  user?: unknown;
  tiers?: unknown;
};

/** my-sell-requests status pill (keyed by the API status code). */
export type SellRequestStatusStyle = {
  label: string;
  dot: string;
  pill: string;
};

export type StatusBadgeProps = {
  status: unknown;
};

export type DeleteConfirmModalProps = {
  request: unknown;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
};

export type SellRequestRowProps = {
  request: unknown;
  isLast: boolean;
  onDeleteClick: (request: unknown) => void;
  deleting: boolean;
};

/** Components/Dashboard/OrderStatusList (one page per order status). */
export type OrderStatusListProps = {
  statusCode: number;
  title: string;
};

/** AddAddressPopup form state (edit mode loads API values as given). */
export type AddressForm = {
  district_id: unknown;
  district_name: unknown;
  area_id: unknown;
  area_name: unknown;
  thana: unknown;
  postcode: unknown;
  street: unknown;
  label: unknown;
  /** UPD-005: "This order is for someone else" toggle. */
  forSomeoneElse: boolean;
  recipient_name: unknown;
  recipient_phone: unknown;
};

/** Body AddAddressPopup hands to onSave (POST / PUT /customer/addresses). */
export type AddressSavePayload = {
  new_district_id: unknown;
  area_id: unknown;
  thana: unknown;
  postcode: unknown;
  street: unknown;
  label: unknown;
  /** UPD-005: null when the order is for the account holder. */
  recipient_name: unknown;
  recipient_phone: unknown;
};

export type AddAddressPopupProps = {
  onClose: () => void;
  onSave: (payload: AddressSavePayload) => Promise<void>;
  initialData?: unknown;
};

/** all-orders Pay Now modal / rows (order from /customer/orders). */
export type PayNowModalProps = {
  order: unknown;
  onClose: () => void;
};

export type OrderHistoryRowProps = {
  order: unknown;
  onPayNow: (order: unknown) => void;
};

/** all-orders pager (last_page / total from the API, passed through). */
export type OrderPaginationProps = {
  page: number;
  lastPage: unknown;
  total: unknown;
  onPageChange: (page: number) => void;
};

/** A /customer/wishlists entry as mapWishlistItem() flattens it (API values passed through). */
export type WishlistItem = {
  id: unknown;
  name: unknown;
  category: unknown;
  brand: unknown;
  image: unknown;
  price: unknown;
  discountedPrice: unknown;
  flatDiscount: number;
  quantity: unknown;
  discountType: unknown;
  discountAmount: unknown;
  variants: unknown;
  variantId: unknown;
};

export type VariantBadgesProps = {
  variants: unknown;
};

export type WishlistCardProps = {
  product: WishlistItem;
  onRemove: (id: unknown) => void;
  onAddToCart: (product: WishlistItem) => Promise<void>;
};

/** order-status/[id]: one row of the built timeline (date/time from the API). */
export type OrderTimelineEntry = {
  date: unknown;
  time: unknown;
  status: string;
  message: string;
};

/** order-status/[id]: the order as the page reshapes /customer/orders/{id}/detail. */
export type OrderDetailView = {
  id: unknown;
  invoiceNumber: unknown;
  date: unknown;
  time: unknown;
  currentStatus: unknown;
  subtotal: unknown;
  shipping: unknown;
  timeline: OrderTimelineEntry[];
};

export type OrderStepperProps = {
  currentStatus: unknown;
};

export type OrderTimelineProps = {
  timeline: OrderTimelineEntry[];
};

export type OrderSummaryProps = {
  subtotal: unknown;
  shipping: unknown;
};

/** A /customer/carts item as my-bag's mapCartItem() flattens it (API values passed through). */
export type BagItem = {
  id: unknown;
  name: unknown;
  category: unknown;
  brand: unknown;
  image: unknown;
  price: unknown;
  discountedPrice: unknown;
  flatDiscount: number;
  quantity: unknown;
  selected: boolean;
  discountType: unknown;
  isPreOwned: unknown;
  discountAmount: unknown;
  total: unknown;
  variants: unknown;
  giftProduct: unknown;
  productCare: unknown;
};

export type QuantityButtonProps = {
  onClick: () => void;
  label: ReactNode;
  preOwned: unknown;
};

export type BagProductCardProps = {
  product: BagItem;
  onRemove: (id: unknown) => void;
  onQuantityChange: (id: unknown, delta: number) => void;
  onSelect: (id: unknown) => void;
};

export type BagOrderSummaryProps = {
  products: BagItem[];
};

/** my-bag debounce timers, keyed by cart item id. */
export type QtyTimers = Record<string, ReturnType<typeof setTimeout>>;

/** profile/ProfileView */
export type ProfileViewProps = {
  user?: unknown;
};

export type AvatarDisplayProps = {
  sizeClass: string;
  iconSize: number;
  profilePicture: unknown;
  imgError: boolean;
  onError: () => void;
};

/** A credential row; `isVerified` is passed by callers but not rendered. */
export type ProfileFieldProps = {
  icon: ReactNode;
  label: ReactNode;
  value: unknown;
  isVerified?: unknown;
  /** Rendered next to the value (e.g. the phone-verified badge / Verify button). */
  extra?: ReactNode;
  onAction?: () => void;
  isExpanded?: boolean;
  children?: ReactNode;
};

/** Email / phone / password change flows inside ProfileView. */
export type ProfileWorkflowProps = {
  user?: unknown;
  step: number;
  setStep: (step: number) => void;
};

export type PasswordFormField = "current_password" | "password" | "password_confirmation";

/** edit-profile/EditProfile */
export type EditProfileProps = {
  user?: unknown;
};

/** Editable fields (seeded from the API user as given). */
export type EditProfileForm = {
  name: unknown;
  birthday: unknown;
  gender: unknown;
  /** UPD-004: optional second phone; cleared → null. */
  secondaryPhone: unknown;
  /** UPD-004: postal address, up to 191 characters. */
  address: unknown;
};

/** Field-level message from a 422 `errors` map (string or string[]). */
export type FieldErrorProps = {
  errors: unknown;
  field: string;
};

export type SecurityFieldProps = {
  label: ReactNode;
  value: unknown;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export type VerificationWorkflowProps = {
  placeholder: string;
  type: string;
  step: number;
  setStep: (step: number) => void;
  onPhoneUpdate?: (phone: string) => void;
};

export type PasswordWorkflowProps = {
  step: number;
  setStep: (step: number) => void;
};

export type AddressFieldProps = {
  label: ReactNode;
  required?: boolean;
  children: ReactNode;
};

/** PhoneVerifyInline step: Verify button, or the OTP input. */
export type PhoneVerifyStep = "idle" | "code";

/** Profile: verify the account phone (UPD-002). */
export type PhoneVerifyInlineProps = {
  phone: unknown;
  verified: boolean;
  verifiedAt: unknown;
  onVerified: () => void;
};

/** A "Deliver to" line for an address with a recipient (UPD-005 / UPD-007). */
export type RecipientLineProps = {
  address: unknown;
  className?: string;
};
