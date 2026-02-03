import {
    collection,
    doc,
    setDoc,
    getDocs,
    getDoc,
    query,
    where,
    or,
    and,
    orderBy,
    Timestamp,
    updateDoc,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';
import { TENANT_ID } from '../../constants';
import type { Order, OrderStatus } from '../schema';
import { updateProductStock } from './productService';
import { logAgentActivity, getAgentById } from './agentService';

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${dateStr}-${randomStr}`;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
        const orderId = doc(collection(db, 'orders')).id;
        const now = Timestamp.now();

        const order: Order = {
            id: orderId,
            ...orderData,
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(doc(db, 'orders', orderId), order);

        // Log agent activity
        if (orderData.agentId) {
            const agent = await getAgentById(orderData.agentId);
            if (agent) {
                await logAgentActivity({
                    agentId: orderData.agentId,
                    agentName: agent.name,
                    type: 'ORDER_CREATED',
                    description: `Created order for ${orderData.shippingAddress?.name || 'Customer'}`,
                    metadata: {
                        orderId,
                        total: orderData.total,
                        customerName: orderData.shippingAddress?.name || 'Customer'
                    }
                });
            }
        }

        return orderId;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const docRef = doc(db, 'orders', orderId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.data() as Order;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

/**
 * Get customer's orders
 */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
    try {
        const q = query(
            collection(db, 'orders'),
            and(
                where('tenantId', '==', TENANT_ID),
                or(
                    where('userId', '==', userId),
                    where('leadId', '==', userId)
                )
            ),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return [];
    }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((doc) => ({
            ...(doc.data() as any),
            id: doc.id
        } as Order));

        console.log(`[getAllOrders] Fetched ${orders.length} orders for tenant: ${TENANT_ID}`);
        return orders;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return [];
    }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('status', '==', status),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        return [];
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
): Promise<boolean> {
    try {
        const docRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(docRef);

        if (!orderSnap.exists()) return false;
        const order = orderSnap.data() as Order;

        // If cancelling a confirmed/processing/shipped order, restore stock
        if (newStatus === 'cancelled' && ['confirmed', 'processing', 'shipped'].includes(order.status)) {
            const stockUpdates = order.items.map((item) =>
                updateProductStock(item.productId, item.quantity)
            );
            await Promise.all(stockUpdates);
        }

        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'partial' | 'paid'
): Promise<boolean> {
    try {
        const docRef = doc(db, 'orders', orderId);
        await updateDoc(docRef, {
            paymentStatus,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating payment status:', error);
        return false;
    }
}

/**
 * Update order logistics
 */
export async function updateOrderLogistics(
    orderId: string,
    logistics: Order['logistics']
): Promise<boolean> {
    try {
        const docRef = doc(db, 'orders', orderId);
        await updateDoc(docRef, {
            logistics,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating order logistics:', error);
        return false;
    }
}

/**
 * Search orders by order number
 */
export async function searchOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('orderNumber', '==', orderNumber),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as Order;
    } catch (error) {
        console.error('Error searching order:', error);
        return null;
    }
}

/**
 * Get orders by date range (for reports)
 */
export async function getOrdersByDateRange(
    startDate: Date,
    endDate: Date
): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching orders by date:', error);
        return [];
    }
}

/**
 * Get orders by lead ID (B2B)
 */
export async function getOrdersByLeadId(leadId: string): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('leadId', '==', leadId),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching orders by lead:', error);
        return [];
    }
}

/**
 * Get orders by agent ID (B2B)
 */
export async function getOrdersByAgentId(agentId: string): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching orders by agent:', error);
        return [];
    }
}

/**
 * Get orders by company ID (B2B)
 */
export async function getOrdersByCompanyId(companyId: string): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('companyId', '==', companyId),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching orders by company:', error);
        return [];
    }
}

/**
 * Confirm order by agent (B2B)
 */
export async function confirmOrderByAgent(orderId: string): Promise<boolean> {
    try {
        const docRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(docRef);

        if (!orderSnap.exists()) return false;
        const order = orderSnap.data() as Order;

        // Decrement stock for each item
        const stockUpdates = order.items.map((item) =>
            updateProductStock(item.productId, -item.quantity)
        );
        await Promise.all(stockUpdates);

        await updateDoc(docRef, {
            agentConfirmed: true,
            status: 'confirmed',
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error confirming order:', error);
        return false;
    }
}

/**
 * Get all orders for a specific agent
 */
export async function getAgentOrders(agentId: string): Promise<Order[]> {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('agentId', '==', agentId),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error fetching agent orders:', error);
        return [];
    }
}
