import { NextResponse } from 'next/server';
// import { auth } from '../firebaseAdmin';
// // import { isLoggedIn } from './serverActions';
import { cookies } from 'next/headers';

// // This function can be marked `async` if using `await` inside

export async function middleware(request) {
  const cookieStore = await cookies();
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
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
};
