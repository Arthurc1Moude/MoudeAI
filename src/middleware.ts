import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    if (pathname.includes('__next_action')) {
      console.log('=== Server Actions request received ===');
      console.log('url:', req.url);
      // Print a few relevant headers
      const headersToInspect = [
        'host',
        'x-forwarded-host',
        'x-forwarded-proto',
        'origin',
        'referer',
        'x-forwarded-for',
        'user-agent',
      ];
      for (const h of headersToInspect) {
        const val = req.headers.get(h);
        console.log(`${h}:`, val);
      }
      console.log('=== End Server Actions headers ===');
    }
  } catch (e) {
    // don't fail the request logging
    console.error('middleware logging error:', e);
  }
  // Development-only workaround: if running with GENKIT_ENV=dev and
  // there's an x-forwarded-host header that doesn't match Origin, rewrite
  // the Origin header to match x-forwarded-host so Next's Server Actions
  // host/origin check passes during proxied dev environments (e.g., codespaces).
  try {
    const isDev = process.env.GENKIT_ENV === 'dev' || process.env.NODE_ENV === 'development';
    if (isDev && req.nextUrl.pathname.includes('__next_action')) {
      const xfHost = req.headers.get('x-forwarded-host');
      const origin = req.headers.get('origin');
      const xfProto = req.headers.get('x-forwarded-proto') || 'http';
      if (xfHost && origin && !origin.includes(xfHost)) {
        // Build a new Origin value using the forwarded proto and host
        const newOrigin = `${xfProto}://${xfHost}`;
        const newHeaders = new Headers(req.headers);
        newHeaders.set('origin', newOrigin);
        console.log(`Middleware dev override: setting Origin -> ${newOrigin}`);
        return NextResponse.next({ request: { headers: newHeaders } as any } as any);
      }
    }
  } catch (e) {
    console.error('middleware rewrite error:', e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/__next_action', '/:path*'],
};
