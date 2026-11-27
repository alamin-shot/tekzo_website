export async function GET(): Promise<Response> {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    const content = `# Tekzo

> Tekzo is a Bangladesh-based e-commerce platform offering new and used electronics, gadgets, and tech accessories.

## Pages

- [Home](${baseUrl}/): Browse featured products, flash sales, and top categories.
- [Shop](${baseUrl}/shop): Full product catalog with filters for category, brand, and price.
- [Brands](${baseUrl}/brands): Browse products by brand.
- [Categories](${baseUrl}/categories): Browse products by category.
- [Flash Sale](${baseUrl}/flash-sale): Limited-time discounted products.
- [Used Devices](${baseUrl}/used-device): Pre-owned electronics for sale.
- [Blog](${baseUrl}/blog): Tech news, reviews, and buying guides.
- [FAQ](${baseUrl}/faq): Frequently asked questions.
- [About Us](${baseUrl}/about-us): Company information and mission.
- [Contact Us](${baseUrl}/contact-us): Customer support and contact details.
- [Outlets](${baseUrl}/outlets): Physical store locations.
- [Privacy Policy](${baseUrl}/policy/privacy-policy): Data and privacy information.
- [Terms & Conditions](${baseUrl}/policy/terms-condition): Terms of service.

## Sitemaps

- [Sitemap Index](${baseUrl}/sitemap.xml)
- [Static Pages Sitemap](${baseUrl}/static-pages-sitemap.xml)
- [Shop Sitemap](${baseUrl}/shop/sitemap.xml)
- [Categories Sitemap](${baseUrl}/categories/sitemap.xml)
- [Brands Sitemap](${baseUrl}/brands/sitemap.xml)
`;

    return new Response(content.trim(), {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
        },
    });
}
