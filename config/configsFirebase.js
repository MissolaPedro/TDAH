const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const admin = require('firebase-admin');
const path = require('path');

// Configurações do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Configurações do Firebase Admin usando o caminho do arquivo JSON
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const authAdmin = admin.auth();
const firestoreAdmin = admin.firestore();

module.exports = { auth, firestore, authAdmin, firestoreAdmin };