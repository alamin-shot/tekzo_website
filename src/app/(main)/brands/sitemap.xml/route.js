export async function GET() {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) throw new Error("API failed");

        const json = await res.json();
        const brands = json.data || [];

        const urls = brands.map((brand) => {
            const safeSlug = brand.slug.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const lastModDate = brand.updated_at
                ? new Date(brand.updated_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            return `
    <url>
        <loc>${baseUrl}/brands/${safeSlug}</loc>
        <lastmod>${lastModDate}</lastmod> 
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        }).join("");

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/brands</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>${urls}
</urlset>`;

        return new Response(sitemap.trim(), {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate"
            },
        });

    } catch (error) {
        const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/brands</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>
</urlset>`;

        return new Response(errorSitemap, {
            headers: { "Content-Type": "application/xml" }
        });
    }
}