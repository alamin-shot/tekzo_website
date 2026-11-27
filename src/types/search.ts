// Search bar / search modal shapes (P5c).
import type { Dispatch, MouseEvent, ReactNode, RefObject, SetStateAction } from "react";
import type { SearchProduct } from "./product";

/** useProductSearch(): debounced /api/search results. */
export type ProductSearchState = {
  results: SearchProduct[];
  isLoading: boolean;
  error: string | null;
};

/** Minimal Web Speech API recognizer (not declared by lib.dom; webkit-prefixed in Chrome/Safari). */
export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** useVoiceSearch() */
export type VoiceSearchState = {
  isListening: boolean;
  toggleListening: (e: MouseEvent<HTMLElement>) => void;
};

/** Search bar parts */
export type MicIconProps = {
  size?: number;
  isListening: boolean;
};

export type MicButtonProps = {
  className?: string;
  isListening: boolean;
  onClick: (e: MouseEvent<HTMLElement>) => void;
  micRef: RefObject<HTMLButtonElement | null>;
};

export type SearchBarActionProps = {
  isModalOpen: boolean;
  onClose: () => void;
};

export type SearchInputProps = {
  value: string;
  /** Receives the input's new text (SearchBar passes its setSearchQuery). */
  onChange: (value: string) => void;
  onFocus: () => void;
  isModalOpen: boolean;
  isListening: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
};

export type SearchModalOverlayProps = {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  searchResults: SearchProduct[];
  isLoading: boolean;
  searchError: string | null;
  micRef: RefObject<HTMLButtonElement | null>;
  clearBtnRef: RefObject<HTMLButtonElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
};

/** Search modal content */
export type SearchModalContentProps = {
  searchQuery: string;
  searchResults: SearchProduct[];
  isLoading: boolean;
  searchError: string | null;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};

export type SearchResultsProps = {
  searchQuery: string;
  searchResults: SearchProduct[];
  isLoading: boolean;
  searchError: string | null;
  onSelect: () => void;
};

export type SearchProductCardProps = {
  product: SearchProduct;
  onSelect: () => void;
};

export type FeaturedGridProps = {
  products: SearchProduct[];
  onSelect: () => void;
};

/** One warranty/condition badge image keyed by a SearchProduct badge flag. */
export type BadgeDef = {
  key: keyof SearchProduct["badges"];
  src: string;
};

export type ProductBadgesProps = {
  badges?: SearchProduct["badges"];
};

/** /home-categories payload as the sidebar receives it (raw). */
export type SearchSidebarProps = {
  searchQuery: string;
  homeCat: unknown;
  loading: boolean;
  onSelect: () => void;
};

export type TrendingLinksProps = {
  loading: boolean;
  homeCat: unknown;
  onSelect: () => void;
};

export type QuickLinksProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSelect: () => void;
};

export type SidebarLinkProps = {
  href: string;
  label: ReactNode;
  tag?: ReactNode;
  onClick?: () => void;
  className?: string;
};

/** A quick link entry (SearchModal/quickLinksData). */
export type QuickLinkItem = {
  name: string;
  href: string;
};
