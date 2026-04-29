'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ReturnUrlInput = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const returnUrl = queryString ? `${pathname}?${queryString}` : pathname;

  return <input type="hidden" name="returnUrl" value={returnUrl} />;
};
