export async function GET() {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    const currentDate = new Date().toISOString();

    const staticPages = [
        { url: '', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
        { url: '/flash-sale', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
        { url: '/about-us', priority: '0.5', changefreq: 'monthly', lastmod: '2026-04-11' },
        { url: '/contact-us', priority: '0.5', changefreq: 'monthly', lastmod: '2026-04-11' },
        { url: '/policy/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-04-11' },
        { url: '/policy/terms-conditions', priority: '0.3', changefreq: 'yearly', lastmod: '2026-04-11' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages.map(page => `
    <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod> 
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('')}
</urlset>`;

    return new Response(sitemap.trim(), {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate"
        },
    });
}