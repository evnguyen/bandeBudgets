// Import the functions you need from the SDKs you need
// const { initializeApp } = require("firebase/app");
// const { getFirestore } = require("firebase/firestore");
// const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./budget-app-c4027-firebase-adminsdk-1o7xp-ef94eca352");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAqcpXF5GDcfg4alTF5Mc2RMli6G6Vf9eE",
//   authDomain: "budget-app-c4027.firebaseapp.com",
//   projectId: "budget-app-c4027",
//   storageBucket: "budget-app-c4027.appspot.com",
//   messagingSenderId: "512196803028",
//   appId: "1:512196803028:web:52a60641043a0c4120fe41",
//   measurementId: "G-J3J140790S",
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

const db = getFirestore();
module.exports = {
  db,
};
