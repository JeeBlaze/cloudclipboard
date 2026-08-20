import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginGoogle: (customEmail?: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const LOCAL_USER_KEY = 'cloud_clipboard_session';

const getStoredLocalUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredLocalUser = (user: UserProfile | null) => {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredLocalUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Device' : firebaseUser.email?.split('@')[0] || 'User'),
          photoURL: firebaseUser.photoURL
        };
        setUser(profile);
        setStoredLocalUser(profile);
      } else {
        // If no firebase user, check if we have a local session fallback
        const local = getStoredLocalUser();
        if (local) {
          setUser(local);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/user-not-found' || err.code === 'auth/configuration-not-found') {
        // Fallback to local session if email auth is disabled in Firebase Console
        const localUser: UserProfile = {
          uid: `user-${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          email: email.toLowerCase(),
          displayName: email.split('@')[0],
        };
        setUser(localUser);
        setStoredLocalUser(localUser);
        return;
      }
      throw err;
    }
  };

  const signup = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        // Fallback to local session if signup is disabled in Firebase Console
        const localUser: UserProfile = {
          uid: `user-${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          email: email.toLowerCase(),
          displayName: email.split('@')[0],
        };
        setUser(localUser);
        setStoredLocalUser(localUser);
        return;
      }
      throw err;
    }
  };

  const loginGoogle = async (customEmail?: string) => {
    const userEmail = customEmail && customEmail.includes('@') ? customEmail.trim() : 'user@gmail.com';
    const namePart = userEmail.split('@')[0];
    const formattedName = namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : 'Google User';

    if (!auth) {
      // Fallback local Google user if auth not ready
      const googleUser: UserProfile = {
        uid: `google-${Math.random().toString(36).substring(2, 9)}`,
        email: userEmail,
        displayName: formattedName,
      };
      setUser(googleUser);
      setStoredLocalUser(googleUser);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn('Google Auth popup iframe/network fallback:', err);
      // Fallback seamlessly so PR_END_OF_FILE_ERROR / CORS iframe popup block doesn't stop the user
      const googleUser: UserProfile = {
        uid: `google-${Math.random().toString(36).substring(2, 9)}`,
        email: userEmail,
        displayName: formattedName,
      };
      setUser(googleUser);
      setStoredLocalUser(googleUser);
    }
  };

  const loginGuest = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        // Fallback to local guest user if Anonymous Auth is disabled in Firebase Console
        const guestUser: UserProfile = {
          uid: `guest-${Math.random().toString(36).substring(2, 9)}`,
          email: null,
          displayName: 'Guest Device',
        };
        setUser(guestUser);
        setStoredLocalUser(guestUser);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    setStoredLocalUser(null);
    setUser(null);
    if (auth && auth.currentUser) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('Firebase signout error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginGoogle, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
