import { fieldsOf, orList, requireString, toDateInput } from "@/lib/json";

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function GET(): Promise<Response> {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: {
                Accept: "application/json",
                ...(INTERNAL_API_TOKEN && { "X-Internal-Token": INTERNAL_API_TOKEN }),
            },
            next: {revalidate: 3600},
        });

        if (!res.ok) throw new Error("API failed");

        // `json.data || []` then `.map` / `cat.slug.replace` — a null body, a
        // non-array list, a null entry or a non-string slug all throw, which
        // the catch below turns into the fallback sitemap, as before.
        const json: unknown = await res.json();
        const categories = orList(fieldsOf(json).data);

        const urls = categories.map((entry) => {
            const cat = fieldsOf(entry);
            const safeSlug = requireString(cat.slug)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');

            const lastModDate = cat.updated_at ? new Date(toDateInput(cat.updated_at)).toISOString() : new Date().toISOString();

            return `
    <url>
        <loc>${baseUrl}/categories/${safeSlug}</loc>
        <lastmod>${lastModDate}</lastmod> 
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;
        }).join("");

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>${urls}
</urlset>`;

        return new Response(sitemap.trim(), {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate"
            },
        });

    } catch (error) {
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/categories</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>
</urlset>`;

        return new Response(emptySitemap, {
            headers: {"Content-Type": "application/xml"}
        });
    }
}