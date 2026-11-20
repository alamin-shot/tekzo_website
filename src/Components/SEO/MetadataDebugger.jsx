"use client";

import { useState } from "react";

/**
 * MetadataDebugger - Shows current page metadata for debugging
 * Only visible in development mode
 * Usage: Add <MetadataDebugger /> to any page during development
 */
export default function MetadataDebugger() {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const getMetaTags = () => {
    if (typeof window === "undefined") return [];

    const metaTags = [];
    const metas = document.getElementsByTagName("meta");

    // Get relevant meta tags
    const relevantTags = [
      "description",
      "keywords",
      "og:title",
      "og:description",
      "og:image",
      "og:url",
      "og:type",
      "og:site_name",
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:site",
    ];

    for (let i = 0; i < metas.length; i++) {
      const name =
        metas[i].getAttribute("name") || metas[i].getAttribute("property");
      const content = metas[i].getAttribute("content");

      if (name && relevantTags.includes(name)) {
        metaTags.push({ name, content });
      }
    }

    return metaTags;
  };

  const metaTags = getMetaTags();
  const title = typeof window !== "undefined" ? document.title : "";
  const canonical =
    typeof window !== "undefined"
      ? document.querySelector('link[rel="canonical"]')?.href
      : "";

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          cursor: "pointer",
          fontSize: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        title="Debug Metadata"
      >
        🔍
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 20,
            maxWidth: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              borderBottom: "2px solid #667eea",
              paddingBottom: 10,
            }}
          >
            <h3 style={{ margin: 0, color: "#667eea" }}>
              📊 Metadata Debugger
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#333", marginTop: 0 }}>Page Title</h4>
            <div
              style={{
                background: "#f5f5f5",
                padding: 10,
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              {title || "No title found"}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: "#333" }}>Canonical URL</h4>
            <div
              style={{
                background: "#f5f5f5",
                padding: 10,
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 12,
                wordBreak: "break-all",
              }}
            >
              {canonical || "No canonical URL found"}
            </div>
          </div>

          <div>
            <h4 style={{ color: "#333" }}>Meta Tags</h4>
            {metaTags.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {metaTags.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f5f5f5",
                      padding: 10,
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#667eea",
                        marginBottom: 5,
                      }}
                    >
                      {tag.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        color: "#333",
                      }}
                    >
                      {tag.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#999" }}>No meta tags found</div>
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid #ddd",
            }}
          >
            <h4 style={{ color: "#333" }}>Quick Actions</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(
                  window.location.href,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1877f2",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Test on Facebook
              </a>
              <a
                href={`https://cards-dev.twitter.com/validator`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1da1f2",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Test on Twitter
              </a>
              <a
                href={`https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(
                  window.location.href,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#0077b5",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Test on LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
