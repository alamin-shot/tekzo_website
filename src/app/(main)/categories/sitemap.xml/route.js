export async function GET() {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            next: {revalidate: 3600},
        });

        if (!res.ok) throw new Error("API failed");

        const json = await res.json();
        const categories = json.data || [];

        const urls = categories.map((cat) => {
            const safeSlug = cat.slug
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');

            const lastModDate = cat.updated_at ? new Date(cat.updated_at).toISOString() : new Date().toISOString();

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