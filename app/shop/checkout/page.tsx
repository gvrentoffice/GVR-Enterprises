'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { createOrder, generateOrderNumber } from '@/lib/firebase/services/orderService';
import type { Lead } from '@/lib/firebase/schema';
import type { OrderItem } from '@/lib/firebase/schema';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useCart();
    const { toast } = useToast();
    const [customer, setCustomer] = useState<Lead | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const customerData = localStorage.getItem('customer');
        if (customerData) {
            const parsedCustomer: Lead = JSON.parse(customerData);
            setCustomer(parsedCustomer);

            if (!parsedCustomer.priceAccessApproved) {
                toast({
                    title: 'Access Restricted',
                    description: 'You need agent approval to access prices and checkout.',
                    variant: 'destructive',
                });
                router.push('/shop');
            }
        } else {
            // Redirect to login if not authenticated
            router.push('/login');
        }
    }, [router, toast]);

    const handlePlaceOrder = async () => {
        if (!customer) {
            toast({
                title: 'Authentication Required',
                description: 'Please login to place an order',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert cart items to order items
            const orderItems: OrderItem[] = cart.items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                image: item.productImage,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                totalPrice: item.subtotal,
            }));

            // Create order
            const orderId = await createOrder({
                tenantId: 'ryth-bazar',
                orderNumber: generateOrderNumber(),
                leadId: customer.id,
                agentId: customer.agentId,
                agentName: customer.agentName,
                items: orderItems,
                subtotal: cart.subtotal,
                tax: cart.tax,
                total: cart.total,
                status: 'pending',
                agentConfirmed: false,
                paymentStatus: 'pending',
                shippingAddress: {
                    street: customer.primaryAddress.street,
                    city: customer.primaryAddress.city,
                    state: customer.primaryAddress.state,
                    pincode: customer.primaryAddress.pincode,
                },
                notes,
            });

            // Clear cart
            clearCart();

            // Show success toast
            toast({
                title: 'Order Placed Successfully!',
                description: 'Your sales agent will confirm your order shortly.',
            });

            // Redirect to order confirmation
            router.push(`/shop/orders/${orderId}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast({
                title: 'Order Failed',
                description: 'Failed to place order. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to your cart first</p>
                    <Link href="/shop">
                        <Button className="bg-amber-600 hover:bg-amber-700">Browse Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/shop/cart" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-1">Review and confirm your order</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-semibold text-gray-900">{customer.shopName}</p>
                                <p className="text-gray-600 mt-1">{customer.ownerName}</p>
                                <p className="text-gray-600 mt-2">
                                    {customer.primaryAddress.street}
                                    <br />
                                    {customer.primaryAddress.city}, {customer.primaryAddress.state}
                                    <br />
                                    {customer.primaryAddress.pincode}
                                </p>
                                <p className="text-gray-600 mt-2">Phone: {customer.whatsappNumber}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                            </div>

                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.productId} className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                                            <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {item.quantity} {item.unit} × ₹{item.unitPrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                ₹{item.subtotal.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Notes (Optional)</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special instructions or requirements..."
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST (18%)</span>
                                    <span>₹{cart.tax.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹{cart.total.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">📋 Note:</span> Your sales agent{' '}
                                    <span className="font-semibold">{customer.agentName}</span> will confirm this order
                                    before processing.
                                </p>
                            </div>

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
                            >
                                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                            </Button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing this order, you agree to our terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
