import { query, where, getDocs, doc, getDoc, orderBy, QueryConstraint } from 'firebase/firestore';
import { categoriesRef } from '../collections';
import { db } from '../config';
import { TENANT_ID } from '../../constants';
import type { Category } from '../schema';

/**
 * Fetch all active categories
 */
export async function getAllCategories(): Promise<Category[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('isActive', '==', true),
            orderBy('level', 'asc'),
            orderBy('order', 'asc'),
        ];

        const q = query(categoriesRef, ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Category[];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Fetch only main categories (level 0)
 */
export async function getMainCategories(): Promise<Category[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('isActive', '==', true),
            where('level', '==', 0),
            orderBy('order', 'asc'),
        ];

        const q = query(categoriesRef, ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Category[];
    } catch (error) {
        console.error('Error fetching main categories:', error);
        return [];
    }
}

/**
 * Fetch subcategories for a parent category
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('parentId', '==', parentId),
            where('isActive', '==', true),
            orderBy('order', 'asc'),
        ];

        const q = query(categoriesRef, ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Category[];
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
    }
}

/**
 * Build hierarchical category tree
 */
export async function getCategoryTree(): Promise<(Category & { children?: Category[] })[]> {
    try {
        const allCategories = await getAllCategories();

        const mainCategories = allCategories.filter((c) => c.level === 0);
        const subCategories = allCategories.filter((c) => c.level > 0);

        return mainCategories.map((main) => ({
            ...main,
            children: subCategories.filter((sub) => sub.parentId === main.id),
        }));
    } catch (error) {
        console.error('Error building category tree:', error);
        return [];
    }
}

/**
 * Fetch single category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
    try {
        const docRef = doc(db, 'categories', categoryId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            ...snapshot.data(),
            id: snapshot.id,
        } as Category;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

/**
 * Get category by slug (URL-friendly)
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
        const q = query(
            categoriesRef,
            where('tenantId', '==', TENANT_ID),
            where('slug', '==', slug)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return {
            ...doc.data(),
            id: doc.id,
        } as Category;
    } catch (error) {
        console.error('Error fetching category by slug:', error);
        return null;
    }
}
