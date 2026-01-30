'use client';

import { Loader2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCustomerOrderHistory } from '@/hooks/useOrders';

export function CustomerOrderHistory({ leadId }: { leadId: string }) {
    const { orders, loading } = useCustomerOrderHistory(leadId);

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>;

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No orders found for this customer.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-amber-200 transition-colors">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                            {order.items.length} items • ₹{order.total.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium text-gray-400">
                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                        </p>
                        <Link href={`/agent/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-amber-600 font-bold text-xs p-0 hover:bg-transparent">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
