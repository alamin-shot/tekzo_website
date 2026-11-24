const nextConfig = {
    output: "standalone",
    poweredByHeader: false,
    async headers() {
        return [
            {
                // Applies to every route.
                source: "/(.*)",
                headers: [
                    // Force HTTPS on every future visit once a browser has
                    // seen this once — closes the SSL-stripping window on
                    // http://tekzo.com.bd / bare-domain entry points.
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    // Blocks the storefront from being framed by another
                    // site (clickjacking on cart/checkout).
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    // Stops the browser from MIME-sniffing a response into
                    // an unintended content type.
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    // Unused browser APIs are denied outright; none of the
                    // storefront's own code or known GTM tags need them.
                    {
                        key: "Permissions-Policy",
                        value:
                            "camera=(), microphone=(), geolocation=(), payment=()",
                    },
                    // Report-only for now: GTM injects Facebook/TikTok
                    // Pixel, Clarity, and a CAPI bundle at runtime from its
                    // own container config, so the full third-party script
                    // list isn't visible in this codebase. This collects
                    // violation reports without risking breakage; once the
                    // report data confirms the allowed sources are
                    // complete, switch the key to
                    // "Content-Security-Policy" to enforce it.
                    {
                        key: "Content-Security-Policy-Report-Only",
                        value: [
                            "default-src 'self'",
                            // server.tekzo.com.bd is the server-side GTM container; the
                            // rest are scripts GTM/Cloudflare inject (PSI "Issues"
                            // panel listed each one as a report-only violation).
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://server.tekzo.com.bd https://connect.facebook.net https://analytics.tiktok.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://googleads.g.doubleclick.net https://*.amazonaws.com https://*.cloudflare.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: https:",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "connect-src 'self' https:",
                            "frame-src 'self' https://www.googletagmanager.com https://server.tekzo.com.bd https://www.google.com https://www.facebook.com https://googleads.g.doubleclick.net https://td.doubleclick.net",
                            "object-src 'none'",
                            "base-uri 'self'",
                        ].join("; "),
                    },
                ],
            },
            {
                // Static files from /public (badges, icons, logos). Their
                // names are not content-hashed, so they get 30 days rather
                // than "immutable"; PSI reported a 4h lifetime.
                source: "/:file*\\.(svg|webp|png|jpg|jpeg|gif|ico)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=2592000, stale-while-revalidate=86400",
                    },
                ],
            },
        ];
    },
   logging: {
    fetches: {
      fullUrl: true,
    },
  },
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    // inlineCss stays off. It wrote the ~246 KB site stylesheet into every
    // HTML response three times (a <style> tag plus two copies in the RSC
    // payload), taking the homepage document from ~64 KB to ~175 KB gzipped.
    // Lighthouse's LCP model charges those bytes before the hero image, so
    // inlining cost ~0.4 s of LCP and ~0.2 s of FCP versus one cached,
    // render-blocking 37 KB stylesheet.
    optimizePackageImports: ["lucide-react", "react-icons"],
    serverActions: {
      // Server Actions (login/register, contact form) reject requests whose
      // Origin doesn't match the Host. Behind Cloudflare/nginx the forwarded
      // host can differ, so the public domains are allowed explicitly.
      allowedOrigins: ["www.tekzo.com.bd", "tekzo.com.bd"],
    },
  },
  images: {
    // AVIF output is disabled. The 94-96% CPU load previously blamed on AVIF
    // encoding is now treated as a suspected COMPROMISE INDICATOR, not a
    // performance cost: next@16.1.4 had an unauthenticated RCE in the image
    // optimizer when AVIF is used (GHSA-2xp9-vwfh-vxw4), and sustained
    // near-100% CPU is a classic cryptominer signature. See
    // docs/diagnosis/99-traffic-spike.md. WebP-only also cuts encode CPU.
    formats: ["image/webp"],
    // SVGs are never passed through the optimizer (explicit; this is also the
    // default). An SVG-path RCE (GHSA-2464-fhr4-w9xw) affected next <=16.4.0.
    dangerouslyAllowSVG: false,
    // Cache each encoded variant for 31 days instead of the 60s default, so
    // repeat requests for the same product image reuse the cached WebP file
    // instead of re-running sharp.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2c2zgda4zwbg9.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "web-api.tekzo.com.bd",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "web-api.salamatinnovation.com",
        pathname: "/**",
      },
      {
        // /search-products returns product_image URLs on this bucket.
        protocol: "https",
        hostname: "salamat-innovation.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
