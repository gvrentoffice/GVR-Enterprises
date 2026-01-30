'use client';

import { useEffect, useState } from 'react';
import {
    getOrderStats,
    getDailyRevenue,
    getTopProducts,
    getOrderStatusBreakdown,
    getPaymentStatusBreakdown,
    getLeadsCount,
    getActiveAgentsCount,
} from '@/lib/firebase/services/analyticsService';

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalItems: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
}

export interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
    orders: number;
}

export interface StatusBreakdown {
    status: string;
    count: number;
    percentage: number;
}

export function useOrderStats(startDate: Date, endDate: Date) {
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getOrderStats(startDate, endDate);
                setStats(data);
            } catch (err) {
                console.error('Error fetching order stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [startDate, endDate]);

    return { stats, loading };
}

export function useDailyRevenue(startDate: Date, endDate: Date) {
    const [data, setData] = useState<DailyRevenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDailyRevenue(startDate, endDate);
                setData(result);
            } catch (err) {
                console.error('Error fetching daily revenue:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    return { data, loading };
}

export function useTopProducts(startDate: Date, endDate: Date) {
    const [products, setProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await getTopProducts(startDate, endDate);
                setProducts(result);
            } catch (err) {
                console.error('Error fetching top products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [startDate, endDate]);

    return { products, loading };
}

export function useOrderStatusBreakdown(startDate: Date, endDate: Date) {
    const [data, setData] = useState<StatusBreakdown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getOrderStatusBreakdown(startDate, endDate);
                setData(result);
            } catch (err) {
                console.error('Error fetching status breakdown:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    return { data, loading };
}

export function usePaymentStatusBreakdown(startDate: Date, endDate: Date) {
    const [data, setData] = useState<StatusBreakdown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getPaymentStatusBreakdown(startDate, endDate);
                setData(result);
            } catch (err) {
                console.error('Error fetching payment breakdown:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    return { data, loading };
}

export function useLeadsCount() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeadsCount().then(c => {
            setCount(c);
            setLoading(false);
        });
    }, []);

    return { count, loading };
}

export function useActiveAgentsCount() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveAgentsCount().then(c => {
            setCount(c);
            setLoading(false);
        });
    }, []);

    return { count, loading };
}
