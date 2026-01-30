import {
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    increment,
    writeBatch,
    Timestamp,
    setDoc,
    QueryConstraint,
} from 'firebase/firestore';
import { productsRef } from '../collections';
import { db } from '../config';
import { TENANT_ID } from '../../constants';
import type { Product } from '../schema';

/**
 * Fetch all products visible to the public
 * (Hides dealer prices and B2B-only products)
 */
export async function getPublicProducts(): Promise<Product[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', 'active'),
            where('visibility', '==', 'public'),
        ];

        const q = query(productsRef, ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Product[];
    } catch (error: any) {
        console.error('Error fetching public products:', error);
        // Log the full error object to help user find the index link
        if (error?.code === 'failed-precondition') {
            console.error('INDEX REQUIRED: Please click the link in the error above to create the index in Firebase Console.');
        }
        return [];
    }
}

/**
 * Fetch products visible to registered users
 * (Includes B2B pricing, registered-only products)
 */
export async function getRegisteredProducts(): Promise<Product[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', 'active'),
            // Public + Registered Only + B2B Only
        ];

        const q = query(productsRef, ...constraints);
        const snapshot = await getDocs(q);

        return (snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Product[]).filter(
            (p) =>
                p.visibility === 'public' ||
                p.visibility === 'registered_only' ||
                p.visibility === 'b2b_only'
        );
    } catch (error) {
        console.error('Error fetching registered products:', error);
        return [];
    }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
    try {
        const docRef = doc(db, 'products', productId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return {
            ...snapshot.data(),
            id: snapshot.id,
        } as Product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

/**
 * Search products by name or SKU
 */
export async function searchProducts(
    searchTerm: string,
    isRegistered: boolean = false
): Promise<Product[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', 'active'),
        ];

        const q = query(productsRef, ...constraints);
        const snapshot = await getDocs(q);

        let results = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Product[];

        // Filter by visibility
        if (!isRegistered) {
            results = results.filter((p) => p.visibility === 'public');
        }

        // Filter by search term
        const term = searchTerm.toLowerCase();
        results = results.filter(
            (p) =>
                p.name.toLowerCase().includes(term) ||
                p.sku.toLowerCase().includes(term) ||
                p.categoryName.toLowerCase().includes(term)
        );

        return results;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

/**
 * Format product for display
 * Shows MRP to public, dealer price to registered
 */
export function formatProductForDisplay(product: Product, isRegistered: boolean) {
    return {
        ...product,
        displayPrice: isRegistered ? product.pricing.dealerPrice : product.pricing.mrp,
        displayPriceLabel: isRegistered ? 'Dealer Price' : 'MRP',
        savings: isRegistered
            ? product.pricing.mrp - product.pricing.dealerPrice
            : 0,
        savingsPercentage: isRegistered
            ? Math.round(((product.pricing.mrp - product.pricing.dealerPrice) / product.pricing.mrp) * 100)
            : 0,
    };
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
    categoryId: string,
    isRegistered: boolean = false
): Promise<Product[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('categoryId', '==', categoryId),
            where('status', '==', 'active'),
        ];

        const q = query(productsRef, ...constraints);
        const snapshot = await getDocs(q);

        let results = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as Product[];

        if (!isRegistered) {
            results = results.filter((p) => p.visibility === 'public');
        }

        return results;
    } catch (error) {
        console.error('Error fetching category products:', error);
        return [];
    }
}

/**
 * Update product stock quantity
 */
export async function updateProductStock(
    productId: string,
    quantityDelta: number
): Promise<boolean> {
    try {
        const docRef = doc(db, 'products', productId);
        await updateDoc(docRef, {
            'inventory.available': increment(quantityDelta),
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating stock:', error);
        return false;
    }
}

/**
 * Create a single product
 */
export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
        const newDocRef = doc(productsRef);
        const id = newDocRef.id;
        await setDoc(newDocRef, {
            ...productData,
            id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as any);
        return id;
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
}

/**
 * Bulk create products using Firestore batch
 */
export async function bulkCreateProducts(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<boolean> {
    try {
        const batch = writeBatch(db);

        products.forEach((p) => {
            const newDocRef = doc(productsRef);
            batch.set(newDocRef, {
                ...p,
                id: newDocRef.id,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error in bulk upload:', error);
        return false;
    }
}

/**
 * Update product details
 */
export async function updateProduct(
    productId: string,
    productData: Partial<Product>
): Promise<boolean> {
    try {
        const docRef = doc(db, 'products', productId);
        await updateDoc(docRef, {
            ...productData,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating product:', error);
        return false;
    }
}
