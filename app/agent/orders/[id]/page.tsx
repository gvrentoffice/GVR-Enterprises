'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Calendar,
    User,
    MapPin,
    Phone,
    ShoppingBag,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Copy,
    ExternalLink,
    MessageSquare,
    Printer
} from 'lucide-react';
import { useOrder, useConfirmOrder, useUpdateOrderStatus, useUpdatePaymentStatus, useUpdateOrderLogistics } from '@/hooks/useOrders';
import { useLead } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getWhatsAppUrl, formatOrderMessage } from '@/lib/utils/whatsapp';
import type { OrderStatus } from '@/lib/firebase/schema';

const statusConfig = {
    pending: { label: 'Pending Confirmation', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    confirmed: { label: 'Order Confirmed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    draft: { label: 'Draft', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function AgentOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { order, loading: orderLoading, refresh: refreshOrder } = useOrder(id);
    const { lead, loading: leadLoading } = useLead(order?.leadId);
    const { confirm, loading: confirming } = useConfirmOrder();
    const { update: updateStatus, loading: updating } = useUpdateOrderStatus();
    const { update: updatePayment, loading: updatingPayment } = useUpdatePaymentStatus();
    const { update: updateLogistics, loading: updatingLogistics } = useUpdateOrderLogistics();
    const { toast } = useToast();

    const [logisticsForm, setLogisticsForm] = useState({
        transportName: '',
        vehicleNumber: '',
        driverName: '',
        driverContact: '',
        trackingId: ''
    });

    // Initialize form when order loads
    useEffect(() => {
        if (order?.logistics) {
            setLogisticsForm({
                transportName: order.logistics.transportName || '',
                vehicleNumber: order.logistics.vehicleNumber || '',
                driverName: order.logistics.driverName || '',
                driverContact: order.logistics.driverContact || '',
                trackingId: order.logistics.trackingId || ''
            });
        }
    }, [order]);

    const loading = orderLoading || leadLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
                <p className="text-gray-500 mt-2">The order you're looking for doesn't exist or has been removed.</p>
                <Link href="/agent/orders" className="mt-6 inline-block">
                    <Button variant="outline">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    const config = statusConfig[order.status];
    const StatusIcon = config.icon;

    const handleConfirm = async () => {
        try {
            const success = await confirm(order.id);
            if (success) {
                toast({ title: 'Success', description: 'Order confirmed successfully!' });
                refreshOrder();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to confirm order', variant: 'destructive' });
        }
    };

    const handleUpdateStatus = async (status: OrderStatus) => {
        try {
            const success = await updateStatus(order.id, status);
            if (success) {
                toast({ title: 'Success', description: `Status updated to ${status}` });
                refreshOrder();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        }
    };

    const handleUpdatePayment = async (status: 'pending' | 'partial' | 'paid') => {
        try {
            const success = await updatePayment(order.id, status);
            if (success) {
                toast({ title: 'Success', description: `Payment status updated to ${status}` });
                refreshOrder();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update payment status', variant: 'destructive' });
        }
    };

    const handleSaveLogistics = async () => {
        try {
            const success = await updateLogistics(order.id, logisticsForm);
            if (success) {
                toast({ title: 'Success', description: 'Logistics information updated' });
                refreshOrder();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update logistics', variant: 'destructive' });
        }
    };

    const handleWhatsApp = () => {
        if (!lead || !order) return;

        const message = formatOrderMessage({
            orderNumber: order.orderNumber,
            customerName: lead.ownerName,
            shopName: lead.shopName,
            total: order.total,
            status: order.status
        });

        window.open(getWhatsAppUrl(lead.whatsappNumber, message), '_blank');
    };

    const copyOrderNumber = () => {
        navigator.clipboard.writeText(order.orderNumber);
        toast({ title: 'Copied', description: 'Order number copied to clipboard' });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center gap-3">
                <Link href="/agent/orders" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-none">Order Details</h1>
                    <div className="flex items-center gap-1.5 mt-1" onClick={copyOrderNumber}>
                        <p className="text-xs text-gray-500 font-medium font-mono">{order.orderNumber}</p>
                        <Copy className="w-3 h-3 text-gray-400" />
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={handlePrint}>
                    <Printer className="w-5 h-5 text-gray-600" />
                </Button>
            </div>

            <div className="p-4 space-y-4">
                {/* Status Card */}
                <div className={`p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-colors ${config.bg} ${config.border}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-white ${config.color} shadow-sm border border-gray-50`}>
                            <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Status</p>
                            <h3 className={`font-bold ${config.color}`}>{config.label}</h3>
                        </div>
                    </div>
                    {order.status === 'pending' && !order.agentConfirmed && (
                        <div className="animate-pulse">
                            <CheckCircle className="w-6 h-6 text-amber-500 opacity-50" />
                        </div>
                    )}
                </div>

                {/* Agent Confirmation Alert */}
                {order.status === 'pending' && !order.agentConfirmed && (
                    <div className="bg-amber-600 p-4 rounded-xl shadow-lg border border-amber-500 flex flex-col gap-3">
                        <div className="flex items-start gap-3 text-white">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold">Confirmation Required</h4>
                                <p className="text-sm opacity-90">Please review the order details and items. Confirm once you've verified with the customer.</p>
                            </div>
                        </div>
                        <Button
                            className="w-full bg-white text-amber-600 hover:bg-amber-50 font-bold shadow-md"
                            onClick={handleConfirm}
                            disabled={confirming}
                        >
                            {confirming ? 'Confirming...' : 'Confirm Order & Notify Customer'}
                        </Button>
                    </div>
                )}

                {/* Customer & Payment Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-amber-600" />
                                Customer Info
                            </h2>
                            {lead && (
                                <Link href={`/agent/customers/${lead.id}`} className="text-amber-600 text-xs font-bold flex items-center gap-0.5">
                                    View Profile <ExternalLink className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{lead?.shopName || 'Customer'}</h3>
                                    <p className="text-sm text-gray-500">{lead?.ownerName}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleWhatsApp}
                                        className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors border border-green-100 shadow-sm"
                                        title="Send WhatsApp Update"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                    <a href={`tel:${lead?.whatsappNumber}`} className="p-2 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors border border-amber-100 shadow-sm">
                                        <Phone className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="text-gray-900 font-medium">{order.shippingAddress?.street}</p>
                                    <p className="text-gray-500">
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left">
                        <div className="p-4 border-b border-gray-50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                Payment Status
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Current Status:</span>
                                <Badge variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'partial' ? 'warning' : 'danger'} className={
                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                        order.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                }>
                                    {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdatePayment('partial')}
                                    disabled={updatingPayment || order.paymentStatus === 'paid'}
                                    className="text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50"
                                >
                                    Log Partial
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdatePayment('paid')}
                                    disabled={updatingPayment || order.paymentStatus === 'paid'}
                                    className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-50"
                                >
                                    Mark Paid
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 italic">
                                * Full payment is required before shipping.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Logistics Info (Form when processing/shipped, Display when delivered) */}
                {(order.status === 'processing' || order.status === 'shipped' || order.logistics) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-purple-600" />
                                Logistics & Tracking
                            </h2>
                            {(order.status === 'processing' || order.status === 'shipped') && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-amber-600 font-bold text-xs h-8"
                                    onClick={handleSaveLogistics}
                                    disabled={updatingLogistics}
                                >
                                    {updatingLogistics ? 'Saving...' : 'Save Info'}
                                </Button>
                            )}
                        </div>
                        <div className="p-4">
                            {(order.status === 'processing' || order.status === 'shipped') ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Transport Name</label>
                                        <Input
                                            placeholder="e.g. Blue Dart, Porter, Private"
                                            className="h-9 text-sm"
                                            value={logisticsForm.transportName}
                                            onChange={(e) => setLogisticsForm({ ...logisticsForm, transportName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Vehicle Number</label>
                                        <Input
                                            placeholder="e.g. MH 12 AB 1234"
                                            className="h-9 text-sm"
                                            value={logisticsForm.vehicleNumber}
                                            onChange={(e) => setLogisticsForm({ ...logisticsForm, vehicleNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tracking ID</label>
                                        <Input
                                            placeholder="e.g. TRK7890"
                                            className="h-9 text-sm"
                                            value={logisticsForm.trackingId}
                                            onChange={(e) => setLogisticsForm({ ...logisticsForm, trackingId: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Driver Name</label>
                                        <Input
                                            placeholder="Name"
                                            className="h-9 text-sm"
                                            value={logisticsForm.driverName}
                                            onChange={(e) => setLogisticsForm({ ...logisticsForm, driverName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Driver Contact</label>
                                        <Input
                                            placeholder="Phone"
                                            className="h-9 text-sm"
                                            value={logisticsForm.driverContact}
                                            onChange={(e) => setLogisticsForm({ ...logisticsForm, driverContact: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 pb-2 border-b border-gray-50 mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Transport Name</p>
                                        <p className="text-sm font-bold text-gray-900">{order.logistics?.transportName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Vehicle Info</p>
                                        <p className="text-sm font-medium text-gray-900">{order.logistics?.vehicleNumber || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-500">{order.logistics?.trackingId && `ID: ${order.logistics.trackingId}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Driver Details</p>
                                        <p className="text-sm font-medium text-gray-900">{order.logistics?.driverName || 'N/A'}</p>
                                        <p className="text-[10px] text-amber-600">{order.logistics?.driverContact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Order Summary & Items */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Summary</p>
                                <h4 className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</h4>
                            </div>
                            <div className="text-right">
                                <Calendar className="w-4 h-4 text-gray-400 ml-auto mb-1" />
                                <p className="text-xs text-gray-500">
                                    {order.createdAt.toDate().toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="p-4 flex gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <ShoppingBag className="w-8 h-8 opacity-20" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{item.productName}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs font-medium text-amber-600">Base: ₹{item.totalPrice.toLocaleString('en-IN')}</p>
                                        <p className="font-bold text-gray-900 text-sm">₹{item.totalPrice.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-gray-50/30 space-y-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal ({order.items.length} items)</span>
                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>GST / Tax</span>
                            <span>₹{order.tax.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                            <span>Total Amount</span>
                            <span className="text-amber-600">₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Order Notes */}
                {order.notes && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Customer Notes
                        </h4>
                        <p className="text-amber-800 text-sm leading-relaxed italic">"{order.notes}"</p>
                    </div>
                )}

                {/* Status Update Actions (Only if already confirmed) */}
                {order.agentConfirmed && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                        <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 text-center">Update Fulfillment Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {order.status === 'confirmed' && (
                                <Button
                                    className="col-span-2 bg-blue-600 hover:bg-blue-700 font-bold"
                                    onClick={() => handleUpdateStatus('processing')}
                                    disabled={updating}
                                >
                                    Mark as Processing
                                </Button>
                            )}
                            {order.status === 'processing' && (
                                <div className="col-span-2 space-y-1">
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700 font-bold"
                                        onClick={() => handleUpdateStatus('shipped')}
                                        disabled={updating || order.paymentStatus !== 'paid'}
                                    >
                                        Mark as Shipped
                                    </Button>
                                    {order.paymentStatus !== 'paid' && (
                                        <p className="text-[10px] text-red-500 text-center font-medium">
                                            Payment must be fully paid before shipping
                                        </p>
                                    )}
                                </div>
                            )}
                            {order.status === 'shipped' && (
                                <Button
                                    className="col-span-2 bg-green-600 hover:bg-green-700 font-bold"
                                    onClick={() => handleUpdateStatus('delivered')}
                                    disabled={updating}
                                >
                                    Mark as Delivered
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-100 hover:bg-red-50 font-bold h-10"
                                onClick={() => handleUpdateStatus('cancelled')}
                                disabled={updating}
                            >
                                Cancel Order
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
