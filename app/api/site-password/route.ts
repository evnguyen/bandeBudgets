import { NextRequest, NextResponse } from 'next/server';

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'admin';
const ACCESS_COOKIE = 'siteAccessGranted';
const ERROR_COOKIE = 'siteAccessError';

function sanitizeReturnUrl(returnUrl: string | null): string {
  if (!returnUrl) {
    return '/';
  }

  if (returnUrl.startsWith('http://') || returnUrl.startsWith('https://')) {
    try {
      const parsed = new URL(returnUrl);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return '/';
    }
  }

  if (returnUrl.startsWith('/')) {
    return returnUrl;
  }

  return `/${returnUrl}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');
  const returnUrl = sanitizeReturnUrl(String(formData.get('returnUrl') ?? '/'));
  const redirectUrl = new URL(returnUrl, request.nextUrl.origin).href;

  const response = NextResponse.redirect(redirectUrl);

  if (password === SITE_PASSWORD) {
    response.cookies.set(ACCESS_COOKIE, '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.delete(ERROR_COOKIE);
    return response;
  }

  response.cookies.set(ERROR_COOKIE, '1', {
    path: '/',
    maxAge: 60,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  response.cookies.delete(ACCESS_COOKIE);
  return response;
}
