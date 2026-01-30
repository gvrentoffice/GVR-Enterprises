'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Cart } from '@/lib/hooks/useCart';

interface CartSummaryProps {
    cart: Cart;
    isLoading?: boolean;
}

export function CartSummary({ cart, isLoading }: CartSummaryProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Order Summary</h3>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                        ₹{cart.subtotal.toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-semibold text-gray-900">
                        ₹{cart.tax.toLocaleString('en-IN')}
                    </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-amber-600">
                        ₹{cart.total.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Info Messages */}
            <div className="bg-blue-50 rounded p-3 mb-4 border border-blue-200">
                <p className="text-xs text-blue-800">
                    💡 <strong>Bulk discounts available</strong> for orders over ₹10,000
                </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
                <Link href="/shop/checkout" className="block">
                    <Button
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12"
                        disabled={isLoading || cart.items.length === 0}
                    >
                        Proceed to Checkout
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>

                <Link href="/shop" className="block">
                    <Button
                        variant="outline"
                        className="w-full border-gray-300"
                    >
                        Continue Shopping
                    </Button>
                </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                <p>✓ Secure checkout</p>
                <p>✓ Money-back guarantee</p>
                <p>✓ Free support</p>
            </div>
        </div>
    );
}
