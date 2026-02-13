// const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./budget-app-c4027-firebase-adminsdk-1o7xp-7d1f9b8d56.json');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  admin.app();
}

// const db = getFirestore();
const adminAuth = getAuth();
module.exports = {
  adminAuth,
};
