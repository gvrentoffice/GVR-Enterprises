import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { TENANT_ID } from '../constants';

/**
 * Remove all demo products from Firebase
 * Demo products typically have IDs starting with 'demo-' or contain 'demo' in their data
 */
export async function removeDemoProducts() {
    try {
        console.log('Starting to remove demo products...');

        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('tenantId', '==', TENANT_ID));
        const snapshot = await getDocs(q);

        let deletedCount = 0;
        const deletePromises: Promise<void>[] = [];

        snapshot.docs.forEach((docSnapshot) => {
            const product = docSnapshot.data();
            const productId = docSnapshot.id;

            // Check if it's a demo product
            const isDemo =
                productId.toLowerCase().includes('demo') ||
                product.name?.toLowerCase().includes('demo') ||
                product.sku?.toLowerCase().includes('demo') ||
                product.description?.toLowerCase().includes('demo') ||
                product.isDemoProduct === true;

            if (isDemo) {
                console.log(`Deleting demo product: ${productId} - ${product.name}`);
                deletePromises.push(deleteDoc(doc(db, 'products', productId)));
                deletedCount++;
            }
        });

        await Promise.all(deletePromises);

        console.log(`✅ Successfully deleted ${deletedCount} demo products`);
        return { success: true, deletedCount };
    } catch (error) {
        console.error('Error removing demo products:', error);
        return { success: false, error };
    }
}

/**
 * Remove ALL products (use with caution!)
 */
export async function removeAllProducts() {
    try {
        console.log('⚠️ Starting to remove ALL products...');

        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('tenantId', '==', TENANT_ID));
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'products', docSnapshot.id))
        );

        await Promise.all(deletePromises);

        console.log(`✅ Successfully deleted ${snapshot.docs.length} products`);
        return { success: true, deletedCount: snapshot.docs.length };
    } catch (error) {
        console.error('Error removing all products:', error);
        return { success: false, error };
    }
}
