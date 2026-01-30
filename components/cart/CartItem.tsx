'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType } from '@/lib/hooks/useCart';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
}

export function CartItem({
    item,
    onUpdateQuantity,
    onRemove,
}: CartItemProps) {
    const handleDecrement = () => {
        if (item.quantity > item.moq) {
            onUpdateQuantity(item.quantity - item.moq);
        }
    };

    const handleIncrement = () => {
        onUpdateQuantity(item.quantity + item.moq);
    };

    const discount = item.dealerPrice
        ? item.unitPrice - item.dealerPrice
        : 0;

    return (
        <div className="flex gap-4 border-b border-gray-200 py-6">
            {/* Product Image */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Product Details */}
            <div className="flex-1">
                <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {item.productName}
                    </h3>
                    <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-amber-600">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                    </span>
                    {discount > 0 && (
                        <>
                            <span className="text-sm text-gray-400 line-through">
                                ₹{(item.unitPrice + discount).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Save ₹{discount.toLocaleString('en-IN')}
                            </span>
                        </>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecrement}
                        disabled={item.quantity <= item.moq}
                        className="h-8 w-8 p-0"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                        {item.quantity} {item.unit}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleIncrement}
                        className="h-8 w-8 p-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Subtotal & Remove */}
            <div className="text-right flex flex-col justify-between">
                <div>
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-xl font-bold text-gray-900">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                </Button>
            </div>
        </div>
    );
}
