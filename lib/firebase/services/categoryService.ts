import {
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    orderBy,
    QueryConstraint,
    Timestamp,
    collection
} from 'firebase/firestore';
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

/**
 * Create a new category
 */
export async function createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    level: number;
    order: number;
}): Promise<string> {
    try {
        const categoryRef = doc(collection(db, 'categories'));
        const now = Timestamp.now();

        const category: Record<string, any> = {
            tenantId: TENANT_ID,
            name: data.name,
            slug: data.slug,
            level: data.level,
            order: data.order,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        if (data.description) category.description = data.description;
        if (data.parentId) category.parentId = data.parentId;

        await setDoc(categoryRef, category);
        return categoryRef.id;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}

/**
 * Update an existing category
 */
export async function updateCategory(
    categoryId: string,
    data: Partial<Omit<Category, 'id' | 'tenantId' | 'createdAt'>>
): Promise<void> {
    try {
        const categoryRef = doc(db, 'categories', categoryId);

        // Remove undefined values
        const updateData: Record<string, any> = { ...data };
        Object.keys(updateData).forEach(key =>
            updateData[key] === undefined && delete updateData[key]
        );

        await updateDoc(categoryRef, {
            ...updateData,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

/**
 * Delete a category (soft delete by setting isActive to false)
 */
export async function deleteCategory(categoryId: string): Promise<void> {
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, {
            isActive: false,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

/**
 * Get the next order number for a category level
 */
export async function getNextOrderNumber(parentId?: string): Promise<number> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
        ];

        if (parentId) {
            constraints.push(where('parentId', '==', parentId));
        } else {
            constraints.push(where('level', '==', 0));
        }

        const q = query(categoriesRef, ...constraints, orderBy('order', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return 0;

        const highestOrder = snapshot.docs[0].data().order || 0;
        return highestOrder + 1;
    } catch (error) {
        console.error('Error getting next order number:', error);
        return 0;
    }
}
