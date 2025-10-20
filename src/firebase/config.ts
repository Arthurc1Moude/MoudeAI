const FALLBACK_CONFIG = {
  projectId: "studio-2224467452-4faa7",
  appId: "1:1091209241791:web:bd67cb94358103e882520a",
  apiKey: "AIzaSyCL1OXFrr6h8Y7cqm684eT71TX-U_25hdc",
  authDomain: "studio-2224467452-4faa7.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1091209241791",
  storageBucket: "studio-2224467452-4faa7.appspot.com"
};

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || FALLBACK_CONFIG.measurementId,
};
