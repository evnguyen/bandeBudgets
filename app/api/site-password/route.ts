import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_KEYS, COOKIE_MAX_AGE } from '@/lib/constants/keys';

const SITE_PASSWORD = process.env.SITE_PASSWORD;
const isProduction = process.env.NODE_ENV === 'production';

const sanitizeReturnUrl = (returnUrl: string | null): string => {
  if (!returnUrl) return '/';

  if (returnUrl.startsWith('http://') || returnUrl.startsWith('https://')) {
    try {
      const parsed = new URL(returnUrl);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return '/';
    }
  }

  return returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');
  const returnUrl = sanitizeReturnUrl(String(formData.get('returnUrl') ?? '/'));
  const redirectUrl = new URL(returnUrl, request.nextUrl.origin).href;
  const response = NextResponse.redirect(redirectUrl);

  const setError = () => {
    response.cookies.set(COOKIE_KEYS.ACCESS_ERROR, '1', {
      path: '/',
      maxAge: COOKIE_MAX_AGE.ERROR,
      sameSite: 'lax',
      secure: isProduction,
    });
    response.cookies.delete(COOKIE_KEYS.ACCESS_GRANTED);
  };

  if (!SITE_PASSWORD || password !== SITE_PASSWORD) {
    setError();
    return response;
  }

  response.cookies.set(COOKIE_KEYS.ACCESS_GRANTED, '1', {
    path: '/',
    maxAge: COOKIE_MAX_AGE.ACCESS,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  });
  response.cookies.delete(COOKIE_KEYS.ACCESS_ERROR);
  return response;
}
