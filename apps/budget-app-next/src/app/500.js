'use client';

export const dynamic = 'force-dynamic';

export default function Error() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>500 - Internal Server Error</h1>
      <p>Something went wrong. Please try again later.</p>
    </div>
  );
}
