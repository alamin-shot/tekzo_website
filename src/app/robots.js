export default function robots() {
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://www.tekzo.com.bd').replace(/\/$/, '');

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/cart/', '/checkout/', '/undefined/', '/customer/'],
            },
            {
                // Specifically block AI crawlers
                userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'Google-Extended'],
                disallow: '/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}