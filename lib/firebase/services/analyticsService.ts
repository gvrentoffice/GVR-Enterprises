import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';
import type { Order } from '../schema';

const TENANT_ID = 'ryth-bazar';

/**
 * Get order statistics for date range
 */
export async function getOrderStats(startDate: Date, endDate: Date) {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        const orders = snapshot.docs.map((doc) => doc.data() as Order);

        return {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            averageOrderValue:
                orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
            totalItems: orders.reduce((sum, order) => sum + order.items.length, 0),
            pendingOrders: orders.filter((o) => o.status === 'pending').length,
            deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
            cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
        };
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            totalItems: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
        };
    }
}

/**
 * Get daily revenue for chart
 */
export async function getDailyRevenue(startDate: Date, endDate: Date) {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
            orderBy('createdAt', 'asc'),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((doc) => doc.data() as Order);

        // Group by day
        const dailyData: Record<string, number> = {};

        orders.forEach((order) => {
            const date = new Date(order.createdAt.seconds * 1000);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!dailyData[dateStr]) {
                dailyData[dateStr] = 0;
            }
            dailyData[dateStr] += order.total;
        });

        return Object.entries(dailyData).map(([date, revenue]) => ({
            date,
            revenue,
        }));
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        return [];
    }
}

/**
 * Get top products by revenue
 */
export async function getTopProducts(startDate: Date, endDate: Date, limit = 10) {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((doc) => doc.data() as Order);

        // Aggregate product sales
        const productSales: Record<
            string,
            { name: string; quantity: number; revenue: number; orders: number }
        > = {};

        orders.forEach((order) => {
            order.items.forEach((item) => {
                const key = item.productId;
                if (!productSales[key]) {
                    productSales[key] = {
                        name: item.productName,
                        quantity: 0,
                        revenue: 0,
                        orders: 0,
                    };
                }
                productSales[key].quantity += item.quantity;
                productSales[key].revenue += item.totalPrice;
                productSales[key].orders += 1;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    } catch (error) {
        console.error('Error fetching top products:', error);
        return [];
    }
}

/**
 * Get order status breakdown
 */
export async function getOrderStatusBreakdown(startDate: Date, endDate: Date) {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((doc) => doc.data() as Order);

        const statusBreakdown: Record<string, number> = {};

        orders.forEach((order) => {
            if (!statusBreakdown[order.status]) {
                statusBreakdown[order.status] = 0;
            }
            statusBreakdown[order.status] += 1;
        });

        return Object.entries(statusBreakdown).map(([status, count]) => ({
            status,
            count,
            percentage: (count / orders.length) * 100,
        }));
    } catch (error) {
        console.error('Error fetching status breakdown:', error);
        return [];
    }
}

/**
 * Get payment status breakdown
 */
export async function getPaymentStatusBreakdown(startDate: Date, endDate: Date) {
    try {
        const constraints: QueryConstraint[] = [
            where('tenantId', '==', TENANT_ID),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate)),
        ];

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((doc) => doc.data() as Order);

        const paymentBreakdown: Record<string, number> = {};

        orders.forEach((order) => {
            if (!paymentBreakdown[order.paymentStatus]) {
                paymentBreakdown[order.paymentStatus] = 0;
            }
            paymentBreakdown[order.paymentStatus] += 1;
        });

        return Object.entries(paymentBreakdown).map(([status, count]) => ({
            status,
            count,
            percentage: (count / orders.length) * 100,
        }));
    } catch (error) {
        console.error('Error fetching payment breakdown:', error);
        return [];
    }
}

/**
 * Get total leads count
 */
export async function getLeadsCount() {
    try {
        const q = query(collection(db, 'leads'));
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching leads count:', error);
        return 0;
    }
}

/**
 * Get active agents count (checked in today)
 */
export async function getActiveAgentsCount() {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Count agents with attendance.checkIn today
        const q = query(
            collection(db, 'agents'),
            where('attendance.checkIn', '>=', Timestamp.fromDate(todayStart))
        );
        const snapshot = await getDocs(q);

        // If no agents checked in today using the new field, fallback to status
        if (snapshot.size === 0) {
            const qFallback = query(collection(db, 'agents'), where('status', '==', 'active'));
            const snapshotFallback = await getDocs(qFallback);
            return snapshotFallback.size;
        }

        return snapshot.size;
    } catch (error) {
        console.error('Error fetching active agents count:', error);
        return 0;
    }
}
