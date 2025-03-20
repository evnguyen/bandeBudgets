import { adminAuth } from '../../../firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomeLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('firebase_token');

  if (!token) {
    redirect('/login');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token.value);
    const userId = decodedToken.uid;
  } catch (error) {
    redirect('/login');
  }

  return <div className="homeContainer">{children}</div>;
}
