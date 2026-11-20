export async function GET() {
    try {
        const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            next: {revalidate: 3600},
        });

        if (!res.ok) throw new Error("API failed");

        const {data: products = []} = await res.json();

        const formatDate = (date) => {
            if (!date) return null;
            const d = new Date(date);
            return isNaN(d.getTime()) ? null : d.toISOString(); // Full ISO format is better
        };

        // Special character handle korar function
        const escapeXml = (unsafe) => {
            return unsafe.replace(/[<>&"']/g, (m) => {
                switch (m) {
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '&':
                        return '&amp;';
                    case '"':
                        return '&quot;';
                    case "'":
                        return '&apos;';
                    default:
                        return m;
                }
            });
        };

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${products.map((item) => {
            const lastmod = formatDate(item.updated_at);
            const fullUrl = escapeXml(`${baseUrl}/product/${item.slug}`);

            return `
  <url>
    <loc>${fullUrl}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }).join("")}
</urlset>`;

        return new Response(sitemap, {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });

    } catch (error) {
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
            {
                headers: {"Content-Type": "application/xml"}
            }
        );
    }
}