const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/too-many-requests': 'Too many failed attempts. Try again later.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export const mapAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: unknown }).code);
    return FIREBASE_ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
};
