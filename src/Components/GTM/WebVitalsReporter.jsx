"use client";

import { useReportWebVitals } from "next/web-vitals";

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
function describe(el) {
  if (!el || el.nodeType !== 1) return undefined;
  let s = el.tagName.toLowerCase();
  if (el.id) return `${s}#${el.id}`;
  const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 2) : [];
  if (cls.length && cls[0]) s += `.${cls.join(".")}`;
  const label = el.getAttribute("aria-label");
  if (label) s += `[aria-label="${label.slice(0, 40)}"]`;
  return s.slice(0, 120);
}

function inpDetails(metric) {
  // The INP value comes from the slowest Event Timing entry.
  const entry = (metric.entries || []).reduce((a, b) => (!a || b.duration > a.duration ? b : a), null);
  if (!entry) return {};
  const end = entry.startTime + entry.duration;
  return {
    inp_target: describe(entry.target),
    inp_event: entry.name,
    inp_input_delay: Math.round(entry.processingStart - entry.startTime),
    inp_processing: Math.round(entry.processingEnd - entry.processingStart),
    inp_presentation: Math.round(end - entry.processingEnd),
  };
}

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!REPORTED.has(metric.name)) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "web_vitals",
      metric_name: metric.name,
      metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_id: metric.id,
      metric_navigation_type: metric.navigationType,
      page_path: window.location.pathname,
      ...(metric.name === "INP" ? inpDetails(metric) : {}),
    });
  });

  return null;
}
