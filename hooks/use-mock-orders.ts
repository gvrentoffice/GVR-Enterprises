import { useState, useEffect } from 'react';

import { DEMO_ORDERS } from '@/lib/demo-data'; // Using centralized mock data
// Order type is imported from lib/types.ts via demo-data or directly if exported
import { Order } from '@/lib/types';

export function useMockOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOrders(DEMO_ORDERS);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return { orders, loading };
}
