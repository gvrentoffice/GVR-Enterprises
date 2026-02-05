'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ShoppingBag, ChevronRight, Clock, CheckCircle, Package, Truck, XCircle, Loader2 } from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';
import { useAgentOrders, useConfirmOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { OrderStatus } from '@/lib/firebase/schema';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    draft: { label: 'Draft', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function AgentOrdersPage() {
    const { agent } = useAgent();
    const { orders, loading, refresh } = useAgentOrders(agent?.id);
    const { confirm, loading: confirming } = useConfirmOrder();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

    const handleConfirm = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const success = await confirm(orderId);
            if (success) {
                toast({
                    title: 'Order Confirmed',
                    description: 'The order has been successfully confirmed.',
                });
                refresh();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to confirm the order.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error confirming order:', error);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Orders List</h1>
                <Link href="/agent/orders/create">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        New Order
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search order # or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
                <Button variant="outline" size="icon" className="bg-white">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(['all', 'pending', 'confirmed', 'shipped'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${statusFilter === status
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const config = statusConfig[order.status];
                        const StatusIcon = config.icon;

                        return (
                            <Link key={order.id} href={`/agent/orders/${order.id}`}>
                                <div className="glass-standard p-4 rounded-xl active:scale-[0.98] transition-all group hover:shadow-xl">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                                                #{order.orderNumber}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Placed on {order.createdAt.toDate().toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.bg} ${config.color} ${config.border}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {config.label}
                                            </div>
                                            {order.logistics?.transportName && (
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                    {order.logistics.transportName}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 truncate mr-4">
                                                    {item.productName} <span className="text-gray-400">×{item.quantity}</span>
                                                </span>
                                                <span className="font-medium text-gray-900 leading-none">
                                                    ₹{item.totalPrice.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                +{order.items.length - 2} more items
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Total: </span>
                                            <span className="font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                                        </div>

                                        {order.status === 'pending' && !order.agentConfirmed ? (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 px-4"
                                                onClick={(e) => handleConfirm(e, order.id)}
                                                disabled={confirming}
                                            >
                                                {confirming ? 'Confirming...' : 'Confirm Order'}
                                            </Button>
                                        ) : (
                                            <div className="text-amber-600 font-bold text-xs flex items-center gap-1">
                                                Details <ChevronRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
