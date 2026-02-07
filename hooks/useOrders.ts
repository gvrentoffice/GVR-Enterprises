'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getOrderById,
    getCustomerOrders,
    getAllOrders,
    getOrdersByStatus,
    createOrder,
    getOrdersByAgentId,
    getOrdersByLeadId,
} from '@/lib/firebase/services/orderService';
import {
    createOrderAction,
    confirmOrderAction,
    updateOrderStatusAction,
    updatePaymentStatusAction,
    updateOrderLogisticsAction,
} from '@/app/actions/orderActions';
import type { Order, OrderStatus, OrderItem } from '@/lib/firebase/schema';

export function useOrder(orderId: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        if (!orderId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getOrderById(orderId);
            setOrder(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch order');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    return { order, loading, error, refresh: fetchOrder };
}

export function useCustomerOrders(userId: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getCustomerOrders(userId);
                setOrders(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchOrders();
        }
    }, [userId]);

    return { orders, loading, error };
}

export function useAllOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getAllOrders();
                setOrders(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return { orders, loading, error };
}

export function useOrdersByStatus(status: OrderStatus) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrdersByStatus(status);
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [status]);

    return { orders, loading };
}

export function useCreateOrder() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const orderId = await createOrder(orderData);
            return orderId;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create order';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}

export function useUpdateOrderStatus() {
    const [loading, setLoading] = useState(false);

    const update = useCallback(async (orderId: string, status: OrderStatus) => {
        try {
            setLoading(true);
            // Use server action instead of client-side Firebase
            const result = await updateOrderStatusAction(orderId, status);
            return result.success;
        } catch (err) {
            console.error('Error updating order:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading };
}

export function useUpdatePaymentStatus() {
    const [loading, setLoading] = useState(false);

    const update = useCallback(async (orderId: string, status: 'pending' | 'partial' | 'paid') => {
        try {
            setLoading(true);
            // Use server action instead of client-side Firebase
            const result = await updatePaymentStatusAction(orderId, status);
            return result.success;
        } catch (err) {
            console.error('Error updating payment status:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading };
}

export function useUpdateOrderLogistics() {
    const [loading, setLoading] = useState(false);

    const update = useCallback(async (orderId: string, logistics: Order['logistics']) => {
        try {
            setLoading(true);
            // Use server action instead of client-side Firebase
            const result = await updateOrderLogisticsAction(orderId, logistics);
            return result.success;
        } catch (err) {
            console.error('Error updating order logistics:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading };
}

export function useAgentOrders(agentId: string | undefined) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!agentId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getOrdersByAgentId(agentId);
            setOrders(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch agent orders');
        } finally {
            setLoading(false);
        }
    }, [agentId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, refresh: fetchOrders };
}

export function useCustomerOrderHistory(companyId: string | undefined) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!companyId) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getOrdersByLeadId(companyId);
                setOrders(data);
            } catch (err) {
                console.error('Error fetching customer orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [companyId]);

    return { orders, loading };
}

export function useConfirmOrder() {
    const [loading, setLoading] = useState(false);

    const confirm = useCallback(async (orderId: string) => {
        try {
            setLoading(true);
            // Use server action instead of client-side Firebase
            const result = await confirmOrderAction(orderId);
            return result.success;
        } catch (err) {
            console.error('Error confirming order:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { confirm, loading };
}

/**
 * Hook for agents to create orders for leads (B2B)
 * Uses server action to bypass Firestore security rules
 */
export function useCreateAgentOrder() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (orderData: {
        leadId: string;
        agentId: string;
        agentName: string;
        items: OrderItem[];
        subtotal: number;
        tax: number;
        total: number;
        shippingAddress?: Order['shippingAddress'];
        notes?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);
            const result = await createOrderAction(orderData);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create order');
            }
            return { orderId: result.orderId, orderNumber: result.orderNumber };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create order';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { create, loading, error };
}
