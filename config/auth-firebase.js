// Importa as funções necessárias do SDK do Firebase
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require("firebase/auth"); // Adicionado sendPasswordResetEmail
const { getFirestore } = require("firebase/firestore");
const { getAnalytics, isSupported, logEvent } = require("firebase/analytics");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDu3jUJd0loCMud9uxlgdoXpMkRsqWdemw",
  authDomain: "projeto-tdah.firebaseapp.com",
  projectId: "projeto-tdah",
  storageBucket: "projeto-tdah.appspot.com",
  messagingSenderId: "522286314266",
  appId: "1:522286314266:web:ea8f8d3c6a2cc1abf432a3",
  measurementId: "G-3N9VJWHGRX",
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

module.exports = { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, logCustomEvent, signOut, sendPasswordResetEmail };