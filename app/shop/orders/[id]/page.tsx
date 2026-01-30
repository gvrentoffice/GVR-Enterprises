'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    MessageSquare,
    MapPin,
    Calendar,
    ShoppingBag,
    Printer,
    Phone
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { getWhatsAppUrl, formatPlacementMessage } from '@/lib/utils/whatsapp';

const statusConfig = {
    pending: { label: 'Pending Confirmation', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    confirmed: { label: 'Confirmed by Agent', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    cancelled: { label: 'Cancelled', icon: Clock, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    draft: { label: 'Draft', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { order, loading } = useOrder(id);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
                <p className="text-gray-600 mt-2 mb-8">We couldn't find the order you're looking for.</p>
                <Button onClick={() => router.push('/shop')} className="bg-amber-600 hover:bg-amber-700">
                    Continue Shopping
                </Button>
            </div>
        );
    }

    const config = statusConfig[order.status];
    const StatusIcon = config.icon;

    const handleShareWhatsApp = () => {
        const message = formatPlacementMessage(order.orderNumber, order.total);
        const customerData = localStorage.getItem('customer');
        const agentPhone = customerData ? JSON.parse(customerData).agentPhone || '' : '';

        window.open(getWhatsAppUrl(agentPhone, message), '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/shop/orders')} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-xs text-gray-500 font-mono">#{order.orderNumber}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handlePrint} className="text-gray-500">
                        <Printer className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Status Hero */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
                    <div className={`inline-flex p-4 rounded-full mb-4 ${config.bg} ${config.color}`}>
                        <StatusIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.label}</h2>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        {order.status === 'pending'
                            ? `Your agent ${order.agentName} will confirm your order shortly.`
                            : `Your order is currently ${order.status}.`}
                    </p>

                    {order.status === 'pending' && (
                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Want to speed up confirmation?</p>
                            <Button
                                onClick={handleShareWhatsApp}
                                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-100"
                            >
                                <MessageSquare className="w-6 h-6" />
                                Share with Agent via WhatsApp
                            </Button>
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-amber-600">
                            <Calendar className="w-4 h-4" />
                            <h3 className="font-bold text-gray-900">Order Date</h3>
                        </div>
                        <p className="text-gray-900 font-medium">
                            {order.createdAt.toDate().toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-amber-600">
                            <MapPin className="w-4 h-4" />
                            <h3 className="font-bold text-gray-900">Delivery Address</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                        </p>
                    </div>
                </div>

                {/* Logistics Info */}
                {order.logistics && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-purple-600">
                            <Truck className="w-5 h-5" />
                            <h3 className="font-bold text-gray-900">Delivery Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transport Name</p>
                                <p className="text-sm font-bold text-gray-900">{order.logistics.transportName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle Details</p>
                                <p className="text-sm font-bold text-gray-900">{order.logistics.vehicleNumber || 'Standard Delivery'}</p>
                                {order.logistics.trackingId && (
                                    <p className="text-xs text-gray-500 mt-0.5">ID: {order.logistics.trackingId}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Driver Details</p>
                                <p className="text-sm font-bold text-gray-900">{order.logistics.driverName || 'Verified Partner'}</p>
                                {order.logistics.driverContact && (
                                    <a href={`tel:${order.logistics.driverContact}`} className="text-xs text-amber-600 font-bold mt-0.5 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {order.logistics.driverContact}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Items List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Order Items</h3>
                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                            {order.items.length} Items
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="p-6 flex gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
                                    <ShoppingBag className="w-8 h-8 opacity-20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.productName}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.quantity} {item.unit} × ₹{item.unitPrice.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-2">
                                        ₹{item.totalPrice.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50/50 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-gray-900 font-bold">₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Tax / GST</span>
                            <span className="text-gray-900 font-bold">₹{order.tax.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                            <span className="text-2xl font-black text-amber-600">₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 pb-8 space-y-3">
                    <Button onClick={() => router.push('/shop')} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold h-14 rounded-2xl shadow-sm">
                        Continue Shopping
                    </Button>
                    <Link href="/shop/orders" className="block text-center text-amber-600 font-bold text-sm hover:underline">
                        View Order History
                    </Link>
                </div>
            </div>
        </div>
    );
}