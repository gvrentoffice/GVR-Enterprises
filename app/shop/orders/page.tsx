'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, ChevronRight, Clock, CheckCircle, Package, Truck, XCircle, Loader2 } from 'lucide-react';
import { useCustomerOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Order, OrderStatus } from '@/lib/firebase/schema';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    draft: { label: 'Draft', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function CustomerOrdersPage() {
    const [customer, setCustomer] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        const saved = localStorage.getItem('customer');
        if (saved) setCustomer(JSON.parse(saved));
    }, []);

    const { orders, loading } = useCustomerOrders(customer?.id);

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
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-amber-50/30 to-orange-50/20">
            <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                </div>
                <Link href="/shop">
                    <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30">
                        Continue Shopping
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white rounded-xl border-gray-200"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {(['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${statusFilter === status
                                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200'
                                : 'bg-white text-gray-600 border-gray-100 hover:border-amber-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 glass-standard rounded-3xl border border-dashed border-white/50">
                        <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                        <Link href="/shop" className="inline-block mt-6">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full px-8 shadow-lg shadow-amber-500/30">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    filteredOrders.map((order: Order) => {
                        const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                        const StatusIcon = config.icon;

                        return (
                            <Link key={order.id} href={`/shop/orders/${order.id}`}>
                                <div className="glass-standard p-5 rounded-3xl hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                                                    Order #{order.orderNumber}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Placed on {new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${config.bg} ${config.color} ${config.border}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {config.label}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-gray-700 font-medium truncate max-w-[200px] md:max-w-xs">
                                                        {item.productName}
                                                    </span>
                                                    <span className="text-gray-400 font-bold">×{item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    ₹{item.totalPrice.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-[11px] text-amber-600 font-bold ml-10">
                                                + {order.items.length - 3} more items
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Amount</p>
                                            <p className="text-lg font-black text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                                        </div>

                                        <div className="flex items-center text-amber-600 font-bold text-sm bg-amber-50 px-4 py-2 rounded-full group-hover:bg-amber-100 transition-colors">
                                            View Details <ChevronRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
        </div>
    );
}
