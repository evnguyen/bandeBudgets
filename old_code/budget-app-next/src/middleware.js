import { NextResponse } from 'next/server';
// import { auth } from '../firebaseAdmin';
// // import { isLoggedIn } from './serverActions';
import { cookies } from 'next/headers';

// // This function can be marked `async` if using `await` inside

export async function middleware(request) {
  const cookieStore = await cookies();

  // Skip middleware for static files, API routes, and password page
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname === '/password'
  ) {
    return NextResponse.next();
  }

  // Simple cookie existence check (not secure, but prevents obvious unauthorized access)
  const budgetAuth = cookieStore.get('budget_auth');
  if (!budgetAuth) {
    // Redirect to password page with return URL
    const passwordUrl = new URL('/password', request.url);
    passwordUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(passwordUrl);
  }

  // Password authentication passed, now check Firebase auth
  const token = cookieStore.get('firebase_token');

  if (
    (!token || request.nextUrl.pathname === '/') &&
    !request.url.includes('/login')
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher:
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|password).*)',
};
