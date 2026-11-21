export default function robots() {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/cart/', '/checkout/', '/undefined/', '/customer/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}