import { NextResponse } from 'next/server';

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;
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
                    ...(INTERNAL_API_TOKEN && { 'X-Internal-Token': INTERNAL_API_TOKEN }),
                },
            });
            if (response.status === 401) return redirectToLogin(request);
        } catch (error) {
            return redirectToLogin(request);
        }
    }

    return syncAuthMarker(request, NextResponse.next(), token);
}

// Client components (checkout, navbar badges) read the non-httpOnly `has_auth`
// marker to decide guest vs logged-in. Sessions created before the marker
// existed only carry `auth_token`, which made checkout treat logged-in users
// as guests. Keep the two cookies in sync on every page request.
function syncAuthMarker(request, response, token) {
    const hasMarker = request.cookies.has('has_auth');
    if (token && !hasMarker) {
        response.cookies.set('has_auth', '1', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });
    } else if (!token && hasMarker) {
        response.cookies.delete('has_auth');
    }
    return response;
}

function redirectToLogin(request) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('has_auth');
    return response;
}

export const config = {
    // Run on all page routes (needed for the has_auth sync above), skipping
    // API routes, Next internals and static files.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|js|css|map|woff2?)$).*)',
    ],
};