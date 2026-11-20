import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard'];
const PUBLIC_ROUTES = ['/login', '/register'];

// Old (pre-redesign) URL structure that Google still has indexed but no
// longer resolves to anything — these 301s recover that SEO equity instead
// of leaving them as dead 404s. See GSC "Not found (404)" report.
const STATIC_REDIRECTS = {
    '/home': '/',
    '/all-brands': '/brands',
    '/all-categories': '/categories',
    '/all-products': '/shop',
    '/offers': '/shop/offer',
    '/faqs': '/faq',
    '/preowned-device': '/marketplace',
};

function resolveLegacyRedirect(pathname, search) {
    // /brand/details/:slug and /brand/:slug -> /brands/:slug (lowercase-only slugs)
    let match = pathname.match(/^\/brand\/details\/([^/]+)\/?$/i);
    if (match) return `/brands/${match[1].toLowerCase()}${search}`;

    match = pathname.match(/^\/brand\/([^/]+)\/?$/i);
    if (match) return `/brands/${match[1].toLowerCase()}${search}`;

    // /categories/details/:slug and /category/:slug -> /categories/:slug
    match = pathname.match(/^\/categories\/details\/([^/]+)\/?$/i);
    if (match) return `/categories/${match[1]}${search}`;

    match = pathname.match(/^\/category\/([^/]+)\/?$/i);
    if (match) return `/categories/${match[1]}${search}`;

    // /career/apply/:slug and /career/:slug -> /careers/apply/:slug
    match = pathname.match(/^\/career\/apply\/([^/]+)\/?$/i);
    if (match) return `/careers/apply/${match[1]}${search}`;

    match = pathname.match(/^\/career\/([^/]+)\/?$/i);
    if (match) return `/careers/apply/${match[1]}${search}`;

    if (STATIC_REDIRECTS[pathname]) return `${STATIC_REDIRECTS[pathname]}${search}`;

    return null;
}

export async function proxy(request) {
    const { pathname, search } = request.nextUrl;

    const legacyRedirect = resolveLegacyRedirect(pathname, search);
    if (legacyRedirect) {
        return NextResponse.redirect(new URL(legacyRedirect, request.url), 301);
    }

    const token = request.cookies.get('auth_token')?.value;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL('/dashboard/manage-account', request.url));
    }

    if (isProtectedRoute) {
        if (!token) return redirectToLogin(request);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            if (response.status === 401) return redirectToLogin(request);
        } catch (error) {
            return redirectToLogin(request);
        }
    }

    return NextResponse.next();
}

function redirectToLogin(request) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('has_auth');
    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register',
        '/brand/:path*',
        '/category/:path*',
        '/career/:path*',
        '/categories/details/:path*',
        '/home',
        '/all-brands',
        '/all-categories',
        '/all-products',
        '/offers',
        '/faqs',
        '/preowned-device',
    ]
};