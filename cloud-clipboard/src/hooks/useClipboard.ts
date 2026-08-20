import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ClipboardItem } from '../types';

const getLocalStorageClips = (uid: string): ClipboardItem[] => {
  try {
    const raw = localStorage.getItem(`cloud_clip_${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalStorageClips = (uid: string, clips: ClipboardItem[]) => {
  try {
    localStorage.setItem(`cloud_clip_${uid}`, JSON.stringify(clips));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export function useClipboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalOnly, setUseLocalOnly] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    if (!db || useLocalOnly) {
      setItems(getLocalStorageClips(user.uid));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsSyncing(true);

    const userClipboardRef = collection(db, 'users', user.uid, 'clipboard');
    const q = query(userClipboardRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems: ClipboardItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: user.uid,
            content: data.content || '',
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || data.createdAt || Timestamp.now(),
            isPinned: !!data.isPinned,
          };
        });
        setItems(fetchedItems);
        setLocalStorageClips(user.uid, fetchedItems);
        setIsLoading(false);
        setIsSyncing(false);
        setError(null);
      },
      (err) => {
        console.warn('Firestore fallback to local storage:', err.message);
        setUseLocalOnly(true);
        setItems(getLocalStorageClips(user.uid));
        setIsLoading(false);
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user, useLocalOnly]);

  const addClip = useCallback(
    async (content: string): Promise<boolean> => {
      if (!user) {
        setError('Please sign in to save clips.');
        return false;
      }

      setIsSyncing(true);
      const nowIso = new Date().toISOString();

      if (useLocalOnly || !db) {
        const newItem: ClipboardItem = {
          id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: user.uid,
          content,
          createdAt: nowIso,
          updatedAt: nowIso,
          isPinned: false,
        };
        const updated = [newItem, ...items];
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }

      try {
        const userClipboardRef = collection(db, 'users', user.uid, 'clipboard');
        await addDoc(userClipboardRef, {
          content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPinned: false,
        });
        setIsSyncing(false);
        return true;
      } catch (err: any) {
        console.warn('Firestore add error, falling back to local storage:', err);
        setUseLocalOnly(true);
        const newItem: ClipboardItem = {
          id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: user.uid,
          content,
          createdAt: nowIso,
          updatedAt: nowIso,
          isPinned: false,
        };
        const updated = [newItem, ...items];
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }
    },
    [user, useLocalOnly, items]
  );

  const updateClip = useCallback(
    async (id: string, newContent: string): Promise<boolean> => {
      if (!user) return false;

      setIsSyncing(true);
      const nowIso = new Date().toISOString();

      if (useLocalOnly || !db) {
        const updated = items.map((i) =>
          i.id === id ? { ...i, content: newContent, updatedAt: nowIso } : i
        );
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }

      try {
        const clipDocRef = doc(db, 'users', user.uid, 'clipboard', id);
        await updateDoc(clipDocRef, {
          content: newContent,
          updatedAt: serverTimestamp(),
        });
        setIsSyncing(false);
        return true;
      } catch (err: any) {
        console.warn('Firestore update error, using local fallback:', err);
        setUseLocalOnly(true);
        const updated = items.map((i) =>
          i.id === id ? { ...i, content: newContent, updatedAt: nowIso } : i
        );
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }
    },
    [user, useLocalOnly, items]
  );

  const togglePin = useCallback(
    async (item: ClipboardItem): Promise<boolean> => {
      if (!user) return false;

      setIsSyncing(true);

      if (useLocalOnly || !db) {
        const updated = items.map((i) =>
          i.id === item.id ? { ...i, isPinned: !i.isPinned } : i
        );
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }

      try {
        const clipDocRef = doc(db, 'users', user.uid, 'clipboard', item.id);
        await updateDoc(clipDocRef, {
          isPinned: !item.isPinned,
        });
        setIsSyncing(false);
        return true;
      } catch (err: any) {
        console.warn('Firestore pin error, using local fallback:', err);
        setUseLocalOnly(true);
        const updated = items.map((i) =>
          i.id === item.id ? { ...i, isPinned: !i.isPinned } : i
        );
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }
    },
    [user, useLocalOnly, items]
  );

  const deleteClip = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      setIsSyncing(true);

      if (useLocalOnly || !db) {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }

      try {
        const clipDocRef = doc(db, 'users', user.uid, 'clipboard', id);
        await deleteDoc(clipDocRef);
        setIsSyncing(false);
        return true;
      } catch (err: any) {
        console.warn('Firestore delete error, using local fallback:', err);
        setUseLocalOnly(true);
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        setLocalStorageClips(user.uid, updated);
        setIsSyncing(false);
        return true;
      }
    },
    [user, useLocalOnly, items]
  );

  return {
    items,
    isLoading,
    isSyncing,
    error,
    addClip,
    updateClip,
    togglePin,
    deleteClip,
  };
}
