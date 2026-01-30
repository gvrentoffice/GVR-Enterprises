'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAgent } from '@/hooks/useAgent';
import { useAgentLeads } from '@/hooks/useLeads';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, Search, ShoppingCart, Loader2, User, MapPin, Phone, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrder } from '@/hooks/useOrders';
import { generateOrderNumber } from '@/lib/firebase/services/orderService';
import type { Order } from '@/lib/firebase/schema';
import { useOfflineSync } from '@/hooks/useOfflineSync';

// Mock types for quick order form
interface OrderItemRow {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    moq?: number;
    unit?: string;
}

function CreateOrderForm() {
    const searchParams = useSearchParams();
    const customerIdParam = searchParams.get('customerId');
    const { toast } = useToast();
    const { agent } = useAgent();
    // Using agent?.id ensures we only fetch leads if agent is loaded.
    // However, hooks order must not change. agent?.id is undefined initially.
    // The useAgentLeads hook handles undefined agentId safely.
    const { leads } = useAgentLeads(agent?.id);
    const customers = leads; // Show all leads, not just price approved
    const [viewCustomer, setViewCustomer] = useState<typeof leads[0] | null>(null);
    const { products } = useProducts(undefined); // Fetch all products
    const { create: createOrder, loading: saving } = useCreateOrder();
    const { isOnline, saveOffline } = useOfflineSync();

    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [items, setItems] = useState<OrderItemRow[]>([]);

    // Set initial customer from URL if provided
    useEffect(() => {
        if (customerIdParam) {
            setSelectedCustomerId(customerIdParam);
        }
    }, [customerIdParam]);

    // Simplistic product search/add
    const [productSearch, setProductSearch] = useState('');

    const handleAddProduct = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setItems(prev => {
            const existing = prev.find(i => i.productId === productId);
            if (existing) {
                return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + (product.pricing.moq || 1) } : i);
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                quantity: product.pricing.moq || 1,
                unitPrice: product.pricing.dealerPrice,
                moq: product.pricing.moq || 1,
                unit: product.pricing.unit || 'pc'
            }];
        });
        setProductSearch('');
    };

    const updateQuantity = (index: number, val: number) => {
        const item = items[index];
        const minQty = item.moq || 1;
        setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: val >= minQty ? val : minQty } : item));
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = totalAmount * 0.18; // 18% GST assumption
    const grandTotal = totalAmount + taxAmount;

    const handleSubmit = async () => {
        if (!selectedCustomerId || items.length === 0 || !agent) return;

        try {
            const customer = customers.find(c => c.id === selectedCustomerId);

            const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
                tenantId: 'ryth-bazar',
                companyId: selectedCustomerId,
                leadId: selectedCustomerId,
                orderNumber: generateOrderNumber(),
                agentId: agent.id,
                agentName: agent.employeeId, // Or agent.name if available
                agentConfirmed: true,
                items: items.map(i => ({
                    productId: i.productId,
                    productName: i.productName,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    totalPrice: i.quantity * i.unitPrice,
                    unit: i.unit || 'pc'
                })),
                subtotal: totalAmount,
                tax: taxAmount,
                total: grandTotal,
                status: 'pending',
                paymentStatus: 'pending',
                shippingAddress: customer?.primaryAddress || {
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                },
                billingAddress: customer?.primaryAddress || {
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                }
            };

            if (isOnline) {
                await createOrder(orderData);
                toast({
                    title: "Order Created",
                    description: `Order #${orderData.orderNumber} created successfully.`,
                });
            } else {
                await saveOffline('orders', orderData);
                toast({
                    title: "Order Saved Offline",
                    description: "Will sync when online.",
                });
            }
            setItems([]);
            setSelectedCustomerId('');

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to create order.",
            });
        }
    };

    // Filter products based on search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
                    <p className="text-sm text-gray-500">New order for customer</p>
                </div>
            </header>

            <div className="space-y-4">
                {/* Customer Selection */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                    <div className="flex gap-2">
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Search customer..." />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.shopName} ({c.ownerName})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={!selectedCustomerId}
                            onClick={() => {
                                const c = customers.find(cust => cust.id === selectedCustomerId);
                                if (c) setViewCustomer(c);
                            }}
                        >
                            <User className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Product Selection */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Add Products</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Dropdown results for search - simplified */}
                        {productSearch && (
                            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mt-2 bg-white shadow-lg z-10">
                                {filteredProducts.map(p => (
                                    <div
                                        key={p.id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                                        onClick={() => handleAddProduct(p.id)}
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-500">₹{p.pricing.dealerPrice}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-8">Add</Button>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="p-4 text-center text-sm text-gray-500">No products found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                {items.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Order Items ({items.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {items.map((item, idx) => (
                                <div key={idx} className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                            <p className="text-sm text-gray-500">Unit Price: ₹{item.unitPrice}</p>
                                        </div>
                                        <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-600">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md bg-white shadow-sm hover:bg-gray-50"
                                                onClick={() => updateQuantity(idx, item.quantity - 1)}
                                                disabled={item.quantity <= (item.moq || 1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md bg-white shadow-sm hover:bg-gray-50"
                                                onClick={() => updateQuantity(idx, item.quantity + 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="ml-auto font-medium text-gray-900">
                                            ₹{(item.quantity * item.unitPrice).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>GST (18%)</span>
                                <span>₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={saving || !selectedCustomerId || items.length === 0}
                >
                    {saving ? 'Creating Order...' : `Place Order • ₹${grandTotal.toFixed(2)}`}
                </Button>
            </div>


            {/* Customer Details Modal */}
            <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && setViewCustomer(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Customer Profile</DialogTitle>
                        <DialogDescription>Details for {viewCustomer?.shopName}</DialogDescription>
                    </DialogHeader>
                    {viewCustomer && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl">
                                    {viewCustomer.shopName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{viewCustomer.shopName}</h3>
                                    <p className="text-sm text-gray-500">{viewCustomer.ownerName}</p>
                                    <Badge variant={viewCustomer.priceAccessApproved ? "default" : "secondary"} className="mt-2">
                                        {viewCustomer.priceAccessApproved ? "Price Access Active" : "No Price Access"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{viewCustomer.whatsappNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="flex-1">
                                        {viewCustomer.primaryAddress.street}, {viewCustomer.primaryAddress.city}, {viewCustomer.primaryAddress.state} - {viewCustomer.primaryAddress.pincode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}

export default function CreateOrderPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
            <CreateOrderForm />
        </Suspense>
    );
}
