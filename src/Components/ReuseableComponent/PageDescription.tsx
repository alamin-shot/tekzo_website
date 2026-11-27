"use client";

import type { PageDescriptionProps } from "@/types/props/catalog";
import { formatHtml } from "@/lib/formatHtml";
import { rec } from "@/lib/json";
import PageDescriptionView from "./PageDescriptionView";

/**
 * Reusable collapsible page description component.
 *
 * @param {string} [title="Learn More"] - Title displayed on the collapsible trigger button.
 * @param {string} [description] - HTML/text content to display inside the description box.
 * @param {string} [pageDescription] - Alias for description prop.
 * @param {string} [content] - Alias for description prop.
 * @param {object} [companySetting] - Optional company setting object to pull seoData.long_description from.
 * @param {string} [className=""] - Custom wrapper styling classes.
 * @param {boolean} [defaultOpen=false] - Whether the accordion starts expanded.
 */
export default function PageDescription({ title = "Learn More", description, pageDescription, content, companySetting, className = "", defaultOpen = false }: PageDescriptionProps) {
  // Extract description string from various supported prop signatures
  const seoData = rec(rec(companySetting)?.seoData);
  const rawDesc = description || pageDescription || content || seoData?.long_description || seoData?.description || "";

  const desc = typeof rawDesc === "string" ? rawDesc.trim() : "";

  return <PageDescriptionView title={title} html={desc ? formatHtml(desc) : ""} className={className} defaultOpen={defaultOpen} />;
}
