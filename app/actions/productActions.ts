'use server';

import type { Product, Category } from '@/lib/firebase/schema';
import { getSession } from './auth';
import { TENANT_ID } from '@/lib/constants';

/**
 * Get or initialize Firebase Admin SDK Firestore
 */
async function getAdminFirestore() {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Firebase Admin SDK credentials not configured');
  }

  const admin = await import('firebase-admin');

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  return admin.firestore();
}

/**
 * Create a new product (server action for admin)
 */
export async function createProductAction(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    console.log('[createProductAction] Starting product creation...');

    const session = await getSession('admin');
    if (!session) {
      console.log('[createProductAction] No admin session found');
      return { success: false, error: 'Unauthorized - Admin session required' };
    }
    console.log('[createProductAction] Admin session verified');

    const firestore = await getAdminFirestore();
    const productRef = firestore.collection('products').doc();
    const now = new Date();

    const product = {
      id: productRef.id,
      tenantId: TENANT_ID,
      name: productData.name,
      description: productData.description || '',
      categoryId: productData.categoryId,
      categoryName: productData.categoryName || '',
      sku: productData.sku || '',
      pricing: {
        mrp: productData.pricing?.mrp || 0,
        dealerPrice: productData.pricing?.dealerPrice || 0,
        unit: productData.pricing?.unit || 'piece',
        moq: productData.pricing?.moq || 1,
      },
      images: productData.images || [],
      thumbnail: productData.thumbnail || '',
      inventory: {
        available: productData.inventory?.available || 0,
        reserved: productData.inventory?.reserved || 0,
        reorderLevel: productData.inventory?.reorderLevel || 10,
      },
      tags: productData.tags || [],
      status: productData.status || 'active',
      visibility: productData.visibility || 'public',
      showPriceToPublic: productData.showPriceToPublic ?? true,
      showDealerPriceToRegistered: productData.showDealerPriceToRegistered ?? true,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[createProductAction] Creating product:', product.name);
    await productRef.set(product);

    console.log('[createProductAction] Product created successfully');
    return { success: true, productId: productRef.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    console.error('[createProductAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update a product (server action for admin)
 */
export async function updateProductAction(
  productId: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const productRef = firestore.collection('products').doc(productId);

    await productRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
    console.error('[updateProductAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update product inventory (server action for admin)
 */
export async function updateInventoryAction(
  productId: string,
  inventory: Partial<Product['inventory']>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const productRef = firestore.collection('products').doc(productId);

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (inventory.available !== undefined) updateData['inventory.available'] = inventory.available;
    if (inventory.reserved !== undefined) updateData['inventory.reserved'] = inventory.reserved;
    if (inventory.reorderLevel !== undefined) updateData['inventory.reorderLevel'] = inventory.reorderLevel;

    await productRef.update(updateData);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update inventory';
    console.error('[updateInventoryAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Create a new category (server action for admin)
 */
export async function createCategoryAction(
  categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
): Promise<{ success: boolean; categoryId?: string; error?: string }> {
  try {
    console.log('[createCategoryAction] Starting category creation...');

    const session = await getSession('admin');
    if (!session) {
      console.log('[createCategoryAction] No admin session found');
      return { success: false, error: 'Unauthorized - Admin session required' };
    }
    console.log('[createCategoryAction] Admin session verified');

    const firestore = await getAdminFirestore();
    const categoryRef = firestore.collection('categories').doc();
    const now = new Date();

    // Generate slug from name
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const category = {
      id: categoryRef.id,
      tenantId: TENANT_ID,
      name: categoryData.name,
      slug,
      description: categoryData.description || '',
      parentId: categoryData.parentId || null,
      level: categoryData.level || 0,
      order: categoryData.order || 0,
      isActive: categoryData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[createCategoryAction] Creating category:', category.name);
    await categoryRef.set(category);

    console.log('[createCategoryAction] Category created successfully');
    return { success: true, categoryId: categoryRef.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
    console.error('[createCategoryAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update a category (server action for admin)
 */
export async function updateCategoryAction(
  categoryId: string,
  updates: Partial<Category>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const categoryRef = firestore.collection('categories').doc(categoryId);

    await categoryRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
    console.error('[updateCategoryAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a category (server action for admin)
 */
export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();

    // Soft delete by setting isActive to false
    const categoryRef = firestore.collection('categories').doc(categoryId);
    await categoryRef.update({
      isActive: false,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
    console.error('[deleteCategoryAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
