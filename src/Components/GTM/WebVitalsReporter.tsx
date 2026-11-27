"use client";

import { useReportWebVitals } from "next/web-vitals";
import type { WebVitalsInpDetails } from "@/types/tracking";
import { pushDataLayer } from "@/tracking/dataLayer";

// Field (real-user) Core Web Vitals → dataLayer, so GA4/GTM can show which
// element and which INP phase make interactions slow. Uses the web-vitals
// build bundled with Next (no extra dependency). Pushes made before GTM
// loads are queued in window.dataLayer and processed once it does.
//
// GTM setup needed to see the data: a Custom Event trigger on
// "web_vitals" and a GA4 event tag that maps the metric_* / inp_* fields.

const REPORTED = new Set(["INP", "LCP", "FCP", "CLS", "TTFB"]);

// Short, stable selector for the element that received the interaction,
// e.g. `button#faq-trigger-2` or `a.capitalize.hover:text-primary`.
// (`el.nodeType !== 1` → not an Element.)
function describe(el: unknown): string | undefined {
  if (!(el instanceof Element)) return undefined;
  let s = el.tagName.toLowerCase();
  if (el.id) return `${s}#${el.id}`;
  const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 2) : [];
  if (cls.length && cls[0]) s += `.${cls.join(".")}`;
  const label = el.getAttribute("aria-label");
  if (label) s += `[aria-label="${label.slice(0, 40)}"]`;
  return s.slice(0, 120);
}

// INP entries are Event Timing entries. For any other entry the timing
// fields were undefined, giving NaN below — kept.
const isEventTiming = (entry: PerformanceEntry): entry is PerformanceEventTiming => "processingStart" in entry;

function inpDetails(entries: PerformanceEntry[] | undefined): WebVitalsInpDetails {
  // The INP value comes from the slowest Event Timing entry.
  const entry = (entries || []).reduce<PerformanceEntry | null>((a, b) => (!a || b.duration > a.duration ? b : a), null);
  if (!entry) return {};
  const timing = isEventTiming(entry) ? entry : undefined;
  const end = entry.startTime + entry.duration;
  const processingStart = timing?.processingStart ?? NaN;
  const processingEnd = timing?.processingEnd ?? NaN;
  return {
    inp_target: describe(timing?.target),
    inp_event: entry.name,
    inp_input_delay: Math.round(processingStart - entry.startTime),
    inp_processing: Math.round(processingEnd - processingStart),
    inp_presentation: Math.round(end - processingEnd),
  };
}

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!REPORTED.has(metric.name)) return;
    pushDataLayer({
      event: "web_vitals",
      metric_name: metric.name,
      metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_id: metric.id,
      metric_navigation_type: metric.navigationType,
      page_path: window.location.pathname,
      ...(metric.name === "INP" ? inpDetails(metric.entries) : {}),
    });
  });

  return null;
}
