'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/firebase/schema';

interface AddToCartModalProps {
    product: Product;
    isApproved: boolean;
    onClose: () => void;
}

export function AddToCartModal({ product, isApproved, onClose }: AddToCartModalProps) {
    const [quantity, setQuantity] = useState<number>(product.pricing.moq);
    const [inputValue, setInputValue] = useState<string>(product.pricing.moq.toString());
    const { addToCart } = useCart();
    const { toast } = useToast();

    const handleQuantityChange = (value: string) => {
        setInputValue(value);
        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed >= product.pricing.moq) {
            setQuantity(parsed);
        }
    };

    const handleBlur = () => {
        const parsed = parseInt(inputValue);
        if (isNaN(parsed) || parsed < product.pricing.moq) {
            setQuantity(product.pricing.moq);
            setInputValue(product.pricing.moq.toString());
        } else {
            // Optional: round to nearest multiple of MOQ if strictly required
            // const moq = product.pricing.moq;
            // const adjusted = Math.round(parsed / moq) * moq;
            // setQuantity(adjusted);
            // setInputValue(adjusted.toString());
            setQuantity(parsed);
            setInputValue(parsed.toString());
        }
    };

    const handleIncrement = () => {
        const next = quantity + 1; // Or + product.pricing.moq if strictly in multiples
        setQuantity(next);
        setInputValue(next.toString());
    };

    const handleDecrement = () => {
        const next = Math.max(product.pricing.moq, quantity - 1);
        setQuantity(next);
        setInputValue(next.toString());
    };

    const handleAddToCart = () => {
        addToCart(product, quantity, isApproved);
        toast({
            title: 'Added to Cart',
            description: `${quantity} ${product.pricing.unit} of ${product.name} added to cart.`,
        });
        onClose();
    };

    const price = isApproved ? product.pricing.dealerPrice : product.pricing.mrp;
    const totalPrice = price * quantity;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Product Info */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                    {isApproved ? (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-amber-600">
                                ₹{product.pricing.dealerPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.pricing.mrp.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-gray-500">per {product.pricing.unit}</span>
                        </div>
                    ) : (
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{product.pricing.mrp.toLocaleString('en-IN')}
                            <span className="text-xs text-gray-500 ml-2">per {product.pricing.unit}</span>
                        </div>
                    )}
                </div>

                {/* MOQ Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-amber-800">
                        <span className="font-semibold">Minimum Order Quantity:</span> {product.pricing.moq}{' '}
                        {product.pricing.unit}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                        Quantity must be in multiples of {product.pricing.moq}
                    </p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDecrement}
                            disabled={quantity <= product.pricing.moq}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>

                        <div className="flex-1">
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                onBlur={handleBlur}
                                min={product.pricing.moq}
                                className="w-full text-center text-lg font-semibold border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <p className="text-xs text-gray-500 text-center mt-1">{product.pricing.unit}</p>
                        </div>

                        <Button variant="outline" size="icon" onClick={handleIncrement}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-2xl font-bold text-gray-900">
                            ₹{totalPrice.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {quantity} {product.pricing.unit} × ₹{price.toLocaleString('en-IN')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddToCart}
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                        disabled={product.status === 'out_of_stock'}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}
