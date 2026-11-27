import type { DataLayerEvent } from "@/types/tracking";

// Single typed entry point for app-side dataLayer pushes.
//
// It does exactly what every push site does today —
//   window.dataLayer = window.dataLayer || [];
//   window.dataLayer.push(payload);
// — synchronously, with the payload object passed through untouched (no
// cloning, defaults or key reordering). Callers keep their existing timing:
// call it at the same point (e.g. after the same `await`) as the push it
// replaces. Call sites are migrated batch by batch (P4–P8); until then the
// original inline pushes remain the source of truth.
export function pushDataLayer(payload: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
