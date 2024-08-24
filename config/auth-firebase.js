// Importa as funções necessárias do SDK do Firebase
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require("firebase/auth");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const { getAnalytics, isSupported, logEvent } = require("firebase/analytics");

// Importa as funções necessárias do Firebase Admin SDK
const { initializeApp: initializeAdminApp, cert } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.warn("Firebase Analytics não é suportado neste ambiente.");
  }
});

function logCustomEvent(eventName, eventData) {
  if (analytics) {
    logEvent(analytics, eventName, eventData);
  } else {
    console.warn("Tentativa de registrar evento personalizado sem o Analytics inicializado.");
  }
}

// Inicializa o Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

initializeAdminApp({
  credential: cert(serviceAccount)
});

const adminDb = getAdminFirestore();
const adminAuth = getAdminAuth();

module.exports = { auth, db, adminDb, adminAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, logCustomEvent, signOut, sendPasswordResetEmail, collection, addDoc };