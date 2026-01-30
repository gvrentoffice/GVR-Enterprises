'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyCart() {
    return (
        <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
                Discover our amazing products and add them to your cart to get started.
            </p>
            <Link href="/shop">
                <Button className="bg-amber-600 hover:bg-amber-700">
                    Start Shopping
                </Button>
            </Link>
        </div>
    );
}
