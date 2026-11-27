// Globals the app reads or writes on `window`.
import type { DataLayerEntry } from "./tracking";
import type { SpeechRecognitionCtor } from "./search";

declare global {
  interface Window {
    /** GTM data layer. Created lazily (`window.dataLayer = window.dataLayer || []`). */
    dataLayer?: DataLayerEntry[];
    /** Raw /settings payload inlined by checkout/layout (read by checkout and OrderReassurance). */
    __COMPANY_SETTING__?: unknown;
    /** Checkout banner image inlined by checkout/layout. */
    __CHECKOUT_BANNER__?: unknown;
    /** PurchaseTracker de-dupe flag (AUDIT_NOTES N9). */
    __purchase_fired?: boolean;
    /** Web Speech API (useVoiceSearch); either may be missing. */
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export {};
