import { Timestamp } from 'firebase/firestore';

export interface ClipboardItem {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp | Date | number | string;
  updatedAt: Timestamp | Date | number | string;
  isPinned?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export type SortOrder = 'newest' | 'oldest' | 'alphabetical';
