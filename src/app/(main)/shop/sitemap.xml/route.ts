import { fieldsOf, isList, toDateInput } from "@/lib/json";

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function GET(): Promise<Response> {
    try {
        const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            headers: {
                Accept: "application/json",
                ...(INTERNAL_API_TOKEN && { "X-Internal-Token": INTERNAL_API_TOKEN }),
            },
            next: {revalidate: 3600},
        });

        if (!res.ok) throw new Error("API failed");

        // `const {data: products = []} = await res.json()` — the default applies
        // only to undefined; a non-array then throws at .map (→ empty sitemap).
        const payload: unknown = await res.json();
        const {data} = fieldsOf(payload);
        const products = data === undefined ? [] : data;
        if (!isList(products)) throw new TypeError("products.map is not a function");

        const formatDate = (date: unknown): string | null => {
            if (!date) return null;
            const d = new Date(toDateInput(date));
            return isNaN(d.getTime()) ? null : d.toISOString(); // Full ISO format is better
        };

        // Special character handle korar function
        const escapeXml = (unsafe: string): string => {
            return unsafe.replace(/[<>&"']/g, (m: string) => {
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
  ${products.map((entry) => {
            // `item.x` throws for a null/undefined entry (→ empty sitemap), as before.
            const item = fieldsOf(entry);
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