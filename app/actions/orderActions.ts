'use server';

import type { Order, OrderItem } from '@/lib/firebase/schema';
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
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${dateStr}-${random}`;
}

/**
 * Create order (server action for agents creating B2B orders)
 */
export async function createOrderAction(
  orderData: {
    leadId: string;
    agentId: string;
    agentName: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    shippingAddress?: Order['shippingAddress'];
    notes?: string;
  }
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    console.log('[createOrderAction] Starting order creation...');

    // Verify agent session exists
    const session = await getSession('agent');
    if (!session) {
      console.log('[createOrderAction] No agent session found');
      return { success: false, error: 'Unauthorized - Agent session required' };
    }
    console.log('[createOrderAction] Agent session verified');

    const firestore = await getAdminFirestore();
    const orderRef = firestore.collection('orders').doc();
    const now = new Date();
    const orderNumber = generateOrderNumber();

    const order = {
      id: orderRef.id,
      tenantId: TENANT_ID,
      orderNumber,
      leadId: orderData.leadId,
      agentId: orderData.agentId,
      agentName: orderData.agentName,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      status: 'pending' as const,
      agentConfirmed: false,
      paymentStatus: 'pending' as const,
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      createdAt: now,
      updatedAt: now,
    };

    console.log('[createOrderAction] Creating order:', order.orderNumber);
    await orderRef.set(order);

    // Log agent activity
    try {
      const activityRef = firestore.collection('agent_logs').doc();
      await activityRef.set({
        agentId: orderData.agentId,
        agentName: orderData.agentName,
        type: 'ORDER_CREATED',
        description: `Created order ${orderNumber} for ₹${orderData.total}`,
        metadata: { orderId: order.id, orderNumber, total: orderData.total },
        timestamp: now,
      });
    } catch (logError) {
      console.warn('[createOrderAction] Failed to log activity:', logError);
    }

    console.log('[createOrderAction] Order created successfully');
    return { success: true, orderId: orderRef.id, orderNumber };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    console.error('[createOrderAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Confirm order by agent (reserves stock)
 */
export async function confirmOrderAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[confirmOrderAction] Confirming order:', orderId);

    const session = await getSession('agent');
    if (!session) {
      return { success: false, error: 'Unauthorized - Agent session required' };
    }

    const firestore = await getAdminFirestore();

    // Use a transaction to atomically update order and reserve stock
    await firestore.runTransaction(async (transaction) => {
      const orderRef = firestore.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data() as Order;

      // Reserve stock for each item
      for (const item of orderData.items) {
        const productRef = firestore.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);

        if (productDoc.exists) {
          const productData = productDoc.data();
          const currentAvailable = productData?.inventory?.available || 0;

          if (currentAvailable >= item.quantity) {
            transaction.update(productRef, {
              'inventory.available': currentAvailable - item.quantity,
              'inventory.reserved': (productData?.inventory?.reserved || 0) + item.quantity,
            });
          }
        }
      }

      // Update order status
      transaction.update(orderRef, {
        agentConfirmed: true,
        status: 'confirmed',
        updatedAt: new Date(),
      });
    });

    console.log('[confirmOrderAction] Order confirmed successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to confirm order';
    console.error('[confirmOrderAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update order status (server action for admin)
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: Order['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();

    // If cancelling, restore stock
    if (newStatus === 'cancelled') {
      await firestore.runTransaction(async (transaction) => {
        const orderRef = firestore.collection('orders').doc(orderId);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error('Order not found');
        }

        const orderData = orderDoc.data() as Order;

        // Restore stock for each item
        for (const item of orderData.items) {
          const productRef = firestore.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);

          if (productDoc.exists) {
            const productData = productDoc.data();
            transaction.update(productRef, {
              'inventory.available': (productData?.inventory?.available || 0) + item.quantity,
              'inventory.reserved': Math.max(0, (productData?.inventory?.reserved || 0) - item.quantity),
            });
          }
        }

        transaction.update(orderRef, {
          status: newStatus,
          updatedAt: new Date(),
        });
      });
    } else {
      const orderRef = firestore.collection('orders').doc(orderId);
      await orderRef.update({
        status: newStatus,
        updatedAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
    console.error('[updateOrderStatusAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update order payment status (server action for admin)
 */
export async function updatePaymentStatusAction(
  orderId: string,
  paymentStatus: Order['paymentStatus']
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const orderRef = firestore.collection('orders').doc(orderId);

    await orderRef.update({
      paymentStatus,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update payment status';
    console.error('[updatePaymentStatusAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update order logistics (server action for admin)
 */
export async function updateOrderLogisticsAction(
  orderId: string,
  logistics: Order['logistics']
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession('admin');
    if (!session) {
      return { success: false, error: 'Unauthorized - Admin session required' };
    }

    const firestore = await getAdminFirestore();
    const orderRef = firestore.collection('orders').doc(orderId);

    await orderRef.update({
      logistics,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update logistics';
    console.error('[updateOrderLogisticsAction] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
