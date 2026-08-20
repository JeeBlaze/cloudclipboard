import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  const firebaseConfig = {
    apiKey: firebaseConfigData.apiKey,
    authDomain: firebaseConfigData.authDomain,
    projectId: firebaseConfigData.projectId,
    storageBucket: firebaseConfigData.storageBucket,
    messagingSenderId: firebaseConfigData.messagingSenderId,
    appId: firebaseConfigData.appId,
  };

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);

  // Initialize Firestore with specific database ID if available
  const databaseId = firebaseConfigData.firestoreDatabaseId;
  if (databaseId && databaseId !== '(default)') {
    db = getFirestore(app, databaseId);
  } else {
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { app, auth, db };
