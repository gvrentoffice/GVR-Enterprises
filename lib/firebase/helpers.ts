import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Get a single document by ID
 */
export async function getDocument<T>(
  collectionRef: CollectionReference<T>,
  id: string
): Promise<T | null> {
  try {
    const docRef = doc(collectionRef, id) as DocumentReference<T>;
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

/**
 * Get all documents from a collection with optional filters
 */
export async function getDocuments<T>(
  collectionRef: CollectionReference<T>,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

/**
 * Create a new document with auto-generated ID
 */
export async function createDocument<T>(
  collectionRef: CollectionReference<T>,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = doc(collectionRef);
    const timestamp = serverTimestamp();
    
    await setDoc(docRef, {
      ...data,
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as any);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T>(
  collectionRef: CollectionReference<T>,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const docRef = doc(collectionRef, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument<T>(
  collectionRef: CollectionReference<T>,
  id: string
): Promise<void> {
  try {
    const docRef = doc(collectionRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Query documents with filters
 */
export async function queryDocuments<T>(
  collectionRef: CollectionReference<T>,
  filters: {
    field: string;
    operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'in' | 'not-in';
    value: any;
  }[],
  orderByField?: string,
  limitCount?: number
): Promise<T[]> {
  const constraints: QueryConstraint[] = filters.map((filter) =>
    where(filter.field, filter.operator, filter.value)
  );

  if (orderByField) {
    constraints.push(orderBy(orderByField));
  }

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  return getDocuments(collectionRef, constraints);
}

// ============================================
// TIMESTAMP HELPERS
// ============================================

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export function timestampToDate(timestamp: Timestamp | undefined): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Get current server timestamp
 */
export function getCurrentTimestamp() {
  return serverTimestamp();
}

// ============================================
// BATCH OPERATIONS (for better performance)
// ============================================

import { writeBatch } from 'firebase/firestore';
import { db } from './config';

/**
 * Create multiple documents in a single batch
 */
export async function batchCreate<T>(
  collectionRef: CollectionReference<T>,
  items: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<string[]> {
  const batch = writeBatch(db);
  const ids: string[] = [];
  const timestamp = serverTimestamp();

  items.forEach((item) => {
    const docRef = doc(collectionRef);
    ids.push(docRef.id);
    
    batch.set(docRef, {
      ...item,
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as any);
  });

  await batch.commit();
  return ids;
}

/**
 * Update multiple documents in a single batch
 */
export async function batchUpdate<T>(
  collectionRef: CollectionReference<T>,
  updates: { id: string; data: Partial<Omit<T, 'id' | 'createdAt'>> }[]
): Promise<void> {
  const batch = writeBatch(db);
  const timestamp = serverTimestamp();

  updates.forEach(({ id, data }) => {
    const docRef = doc(collectionRef, id);
    batch.update(docRef, {
      ...data,
      updatedAt: timestamp,
    } as any);
  });

  await batch.commit();
}
