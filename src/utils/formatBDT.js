// Formats a price for display after the "৳ " symbol, or returns null when
// there is no usable price (so callers can render a fallback instead of a
// bare "৳"). Uses the same default-locale grouping the UI always used.
export function formatBDT(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : null;
}
