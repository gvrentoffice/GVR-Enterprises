'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';

export default function CartPage() {
    const { cart, updateQuantity, removeItem, isLoading } = useCart();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Link
                            href="/shop"
                            className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Shopping
                        </Link>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Shopping Cart
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cart.items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                {cart.items.map((item) => (
                                    <CartItem
                                        key={item.productId}
                                        item={item}
                                        onUpdateQuantity={(quantity) =>
                                            updateQuantity(item.productId, quantity)
                                        }
                                        onRemove={() => removeItem(item.productId)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <CartSummary cart={cart} isLoading={isLoading} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
