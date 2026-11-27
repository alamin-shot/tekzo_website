import { ImageResponse } from "next/og";
import { getCategoryInfo } from "@/lib/api";
import type { ParamsOnlyProps } from "@/types/route";
import { rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

// Image metadata
export const alt = "Category Image";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation - this creates a fallback OG image if none exists
export default async function Image({ params }: ParamsOnlyProps) {
  const { slug } = await params;

  try {
    const categoryInfo = rec(await getCategoryInfo(slug));

    // If category has a banner, redirect to it
    if (categoryInfo?.banner) {
      // Return redirect or fetch the actual image
      return new ImageResponse(
        <div
          style={{
            fontSize: 64,
            background: "#f8f9fa",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1a1a1a",
            fontFamily: "sans-serif",
            flexDirection: "column",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              marginBottom: 20,
              color: "#2c3e50",
            }}
          >
            {nodeOf(categoryInfo?.name || slug.replace(/-/g, " "))}
          </div>
          <div style={{ fontSize: 32, opacity: 0.7, color: "#5a6c7d" }}>
            Shop Premium Tech Products at Tekzo
          </div>
        </div>,
        {
          ...size,
        },
      );
    }

    // Fallback dynamic OG image
    return new ImageResponse(
      <div
        style={{
          fontSize: 64,
          background: "#f8f9fa",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1a1a1a",
          fontFamily: "sans-serif",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: "bold", color: "#2c3e50" }}>
          {slug.replace(/-/g, " ")}
        </div>
        <div style={{ fontSize: 32, marginTop: 20, color: "#5a6c7d" }}>
          Tekzo
        </div>
      </div>,
      {
        ...size,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Error fallback
    return new ImageResponse(
      <div
        style={{
          fontSize: 64,
          background: "#f8f9fa",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2c3e50",
        }}
      >
        Tekzo
      </div>,
      {
        ...size,
      },
    );
  }
}
