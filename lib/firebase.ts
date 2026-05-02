import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

if (process.env.NODE_ENV === 'production') {
	const missing = Object.entries(firebaseConfig)
		.filter(([, v]) => !v)
		.map(([k]) => k)
	if (missing.length > 0) {
		throw new Error(`Missing Firebase config: ${missing.join(', ')}`)
	}
} else if (Object.values(firebaseConfig).some(v => !v)) {
	console.warn('[firebase] Some Firebase environment variables are missing — using empty config in development')
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
