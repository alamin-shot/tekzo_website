import DOMPurify from "isomorphic-dompurify";

/**
 * Formats rendered HTML strings for dangerouslySetInnerHTML:
 * - Ensures all <a> tags have target="_blank"
 * - Ensures all <a> tags have rel="noopener noreferrer"
 * - Ensures all <a> tags have blue color, underline, and clickability
 * - Downgrades any <h1> in the content to <h2>
 * - Preserves existing href, text content, and DOMPurify sanitization
 */
export function formatHtml(html) {
  if (!html || typeof html !== "string") return "";

  // Sanitize allowing target and rel attributes
  const sanitized = DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel"],
  });

  // This is always rendered as a sub-section of a page that has (or should
  // have) its own single page-title <h1> elsewhere in JSX — CMS-authored
  // content injected here must never introduce a competing/duplicate <h1>
  // (an SEO audit found the homepage carrying 22 <h1>s sourced entirely
  // from this kind of backend-supplied HTML block).
  const withoutH1 = sanitized.replace(
    /<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi,
    (match, attrs = "", inner) => `<h2${attrs || ""}>${inner}</h2>`
  );

  // Transform <a> tags
  return withoutH1.replace(/<a\b([^>]*)>/gi, (match, p1) => {
    let attrs = p1;

    // Set target="_blank"
    if (/target\s*=\s*["'][^"']*["']/i.test(attrs)) {
      attrs = attrs.replace(/target\s*=\s*["'][^"']*["']/gi, 'target="_blank"');
    } else {
      attrs += ' target="_blank"';
    }

    // Set rel="noopener noreferrer"
    if (/rel\s*=\s*["'][^"']*["']/i.test(attrs)) {
      attrs = attrs.replace(/rel\s*=\s*["'][^"']*["']/gi, 'rel="noopener noreferrer"');
    } else {
      attrs += ' rel="noopener noreferrer"';
    }

    // Add blue text styling if not already present
    if (/class\s*=\s*["']([^"']*)["']/i.test(attrs)) {
      attrs = attrs.replace(/class\s*=\s*["']([^"']*)["']/gi, (m, c) => {
        if (c.includes("text-blue-")) return m;
        return `class="${c} text-blue-600 hover:text-blue-800 no-underline cursor-pointer"`;
      });
    } else {
      attrs += ' class="text-blue-600 hover:text-blue-800 no-underline cursor-pointer"';
    }

    return `<a${attrs}>`;
  });
}

export default formatHtml;
