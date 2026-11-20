export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        
        <sitemap>
            <loc>${baseUrl}/static-pages-sitemap.xml</loc>
        </sitemap>

        <sitemap>
            <loc>${baseUrl}/shop/sitemap.xml</loc>
        </sitemap>

        <sitemap>
            <loc>${baseUrl}/categories/sitemap.xml</loc>
        </sitemap>

        <sitemap>
            <loc>${baseUrl}/brands/sitemap.xml</loc>
        </sitemap>

    </sitemapindex>`;

    return new Response(sitemap, {
        headers: { "Content-Type": "application/xml" }
    });
}