// Props for the content pages and their components (P5d): blog, news,
// about us, Tekzo Care, claims, contact, partners, discovery, FAQ, policy,
// outlets. CMS / API values stay `unknown` and are read through
// src/lib/json.ts / src/lib/render.ts.
import type { ComponentType, ReactNode } from "react";

/** Components/Description/*PageDesc wrappers around PageDescription. */
export type PageDescWrapperProps = {
  pageDescription?: unknown;
  title?: string;
};

/** Pages that pass a /seo-page payload down to a client view. */
export type SeoDataProps = {
  seoData?: unknown;
};

export type BusinessRegisterFormHeaderProps = {
  title: string;
};

export type ChildrenProps = {
  children?: ReactNode;
};

/** Blog/GradeBadge: `category` is a raw API value. */
export type GradeBadgeProps = {
  category?: unknown;
  variant?: "default" | "light";
};

/** Blog/PostCard: a mapped post (fields stay raw API values); null renders nothing. */
export type PostCardProps = {
  post: unknown;
  variant?: "grid" | "featured" | "list";
};

/** Blog/BlogContent: raw /blogs sections; pagination is the raw `allPosts` pagination. */
export type BlogContentProps = {
  featured?: unknown;
  recentPosts?: unknown;
  popularPosts?: unknown;
  trendingPosts?: unknown;
  allPosts?: unknown;
  allPostsPagination?: unknown;
  currentPage?: number;
};

/** BlogContent's local section heading. */
export type BlogSectionHeadingProps = {
  id: string;
  eyebrow?: string;
  children?: ReactNode;
};

/** Blog/ShareButtons: values are encoded / copied as given (ToString). */
export type ShareButtonsProps = {
  url?: unknown;
  title?: unknown;
};

/** Blog/AllPostsCard */
export type AllPostsCardProps = {
  post: unknown;
};

/** news/News: the raw /news list. */
export type NewsProps = {
  newsData?: unknown;
};

/** news/News card and modal. `totalCount` is the raw list length. */
export type NewsCardProps = {
  news: unknown;
  index: number;
  onClick: (news: unknown, index: number) => void;
  totalCount: unknown;
};

export type NewsModalProps = {
  news: unknown;
  index: number;
  onClose: () => void;
  totalCount: unknown;
};

/** news/NewsHomePage (no importers): card and modal. */
export type NewsHomeCardProps = {
  news: unknown;
  onClick: (news: unknown) => void;
};

export type NewsHomeModalProps = {
  news: unknown;
  onClose: () => void;
};

/** faq/TekzoFAQ: the raw /faqs list (EN + BN entries). */
export type TekzoFAQProps = {
  faqs?: unknown;
};

/** One FAQ card (`faq` is a raw entry; `index` is accepted but unused). */
export type FAQCardProps = {
  faq: unknown;
  index: number;
  lang: "en" | "bn";
};

/** FAQColumn (unused): a raw list of entries. */
export type FAQColumnProps = {
  faqs: unknown;
  lang: "en" | "bn";
};

/**
 * Contact/actions `submitContactForm` state (useActionState). `message` /
 * `errors` come from the API or the thrown error, unvalidated.
 */
export type ContactFormState = {
  success: boolean | null;
  message: unknown;
  errors?: unknown;
};

/** Contact/ContactForm controlled fields. */
export type ContactFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/** Claim/ClaimWarranty result view. */
export type ClaimStatus = "success" | "unsuccess" | null;

/** Claim/HowToClaimClient language toggle. */
export type ClaimLanguage = "en" | "bn";

/** ReuseableComponent/JobApplicationForm (only referenced from the hidden careers page). */
export type JobApplicationFormProps = {
  slug?: unknown;
};

/** JobApplicationForm fields; a cancelled file picker leaves `undefined`. */
export type JobApplicationData = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: string;
  skills: string;
  reason_of_join: string;
  choos_reason: string;
  photo: File | null | undefined;
  cv: File | null | undefined;
};

/** ReuseableComponent/Form/BusinessForm (partner registration). */
export type BusinessFormData = {
  businessOwner: string;
  businessName: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  district: string;
  upazila: string;
  thana: string;
  postcode: string;
  streetAddress: string;
  tradeLicenseNumber: string;
  platformUrl: string;
  businessTradeLicense: File | null;
  businessLogo: File | null;
  businessOwnerNid: File | null;
  businessOwnerPhoto: File | null;
  agreedToPolicy: boolean;
};

export type BusinessFormProps = {
  title: string;
  setData: (data: BusinessFormData) => void;
};

/** Field name → message / chosen file name / shake flag. */
export type StringMap = Record<string, string>;
export type FlagMap = Record<string, boolean>;

/** AboutUs/OurJourney timeline entry; `year` / `title` are rendered but no entry sets them. */
export type TimelineItem = {
  year?: string;
  title?: string;
  description: string;
};

/** AboutHeading's pill → section component map. */
export type PillComponentMap = Record<string, ComponentType>;

/** ReuseableComponent/LoginPage/LoginPageAnimation */
export type LoginPageAnimationProps = {
  children?: ReactNode;
  title: string;
};

/** ReuseableComponent/LoginPage/LoginToggle */
export type LoginToggleProps = {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
};

// ─── Careers (ported from main b3b9ecf / af7e9eb) ──────────────────────────────

/** Components/Careers/CareersClient: the job list from getCareers(). */
export type CareersClientProps = {
  jobs?: unknown;
};

export type JobCircularProps = {
  jobs?: unknown;
};

export type CareerCardProps = {
  job: unknown;
};

/** Components/Careers/JobRichText: description / qualification / benefits strings. */
export type JobRichTextProps = {
  items?: unknown;
  className?: string;
  gap?: string;
};

export type JobBulletProps = {
  children: ReactNode;
  className?: string;
};

/** Plain-text job field split back into a subheading + bullet points. */
export type JobTextBlock = {
  heading: string | null;
  items: string[];
};
