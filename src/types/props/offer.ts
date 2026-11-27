// Props for the offer pages' client components (P5c-2). Offer payloads stay
// `unknown` and are read through src/lib/json.ts.

/** OfferCard: the raw /offers list. */
export type OfferCardProps = {
  offers?: unknown;
};

export type OfferCardItemProps = {
  deal: unknown;
};

/** A countdown cell (OfferCard and CountdownTimer each have their own). */
export type TimeUnitProps = {
  value: number;
  label: string;
};

export type CountdownTimerProps = {
  endAt: unknown;
};

/** useCountdown() / CountdownTimer: whole seconds remaining, split into units. */
export type CountdownParts = {
  days: number;
  hours: number;
  mins: number;
  secs: number;
};
