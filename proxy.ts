import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot_password',
  '/reset_password',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/activities',
  '/featuresshowcase'
];

// Define API routes that should be excluded from proxy
const apiRoutes = [
  '/api/'
];

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  // Check if it's an exact match
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // Check if it starts with any of the public route prefixes
  for (const route of publicRoutes) {
    if (pathname.startsWith(route)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to check if a route is an API route
function isApiRoute(pathname: string): boolean {
  return apiRoutes.some(route => pathname.startsWith(route));
}

// Proxy function that handles authentication checks
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log proxy execution
  console.log('[PROXY] Processing request for:', pathname);
  
  // Skip proxy for API routes
  if (isApiRoute(pathname)) {
    console.log('[PROXY] Skipping API route');
    return NextResponse.next();
  }
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('[PROXY] Allowing public route');
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = request.cookies.get('token') || 
                request.cookies.get('accessToken') || 
                request.cookies.get('authToken');
  
  console.log('[PROXY] Token found:', !!token);
  
  // If no token and not a public route, redirect to login
  if (!token) {
    console.log('[PROXY] No token found, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log('[PROXY] Token found, allowing access');
  return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};