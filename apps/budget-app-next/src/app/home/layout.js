import { adminAuth } from '../../../firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function HomeLayout({ children }) {
  const cookieStore = await cookies();

  // First check budget password authentication (JWT)
  const budgetAuth = cookieStore.get('budget_auth');
  if (!budgetAuth) {
    redirect('/password');
  }

  try {
    jwt.verify(budgetAuth.value, JWT_SECRET);
  } catch (error) {
    // JWT verification failed - redirect to password page
    redirect('/password');
  }

  // Now check Firebase authentication
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
