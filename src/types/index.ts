import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Post {
  id?: string; // Document ID from Firestore
  title: string;
  content: string;
  authorId: string;
  authorEmail: string; // Store denormalized author email
  authorDisplayName?: string; // Optional: store denormalized author display name
  createdAt: Timestamp | FieldValue; // Firestore Timestamp or ServerTimestamp
  updatedAt: Timestamp | FieldValue; // Firestore Timestamp or ServerTimestamp
}
