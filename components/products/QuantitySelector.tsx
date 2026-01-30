'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuantitySelectorProps {
    moq: number;
    unit: string;
    maxQuantity?: number;
    onQuantityChange?: (quantity: number) => void;
}

export function QuantitySelector({
    moq,
    unit,
    maxQuantity,
    onQuantityChange,
}: QuantitySelectorProps) {
    const [quantity, setQuantity] = useState(moq);

    const handleChange = (newQuantity: number) => {
        // Enforce MOQ
        if (newQuantity < moq) {
            return;
        }

        // Enforce max quantity if set
        if (maxQuantity && newQuantity > maxQuantity) {
            return;
        }

        setQuantity(newQuantity);
        onQuantityChange?.(newQuantity);
    };

    const handleDecrement = () => {
        handleChange(quantity - moq);
    };

    const handleIncrement = () => {
        handleChange(quantity + moq);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            handleChange(value);
        }
    };

    const isMinReached = quantity <= moq;
    const isMaxReached = maxQuantity ? quantity >= maxQuantity : false;

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-900">
                    Quantity ({unit})
                </label>
                <p className="text-xs text-gray-500">
                    Minimum: {moq} {unit} {maxQuantity && `• Maximum: ${maxQuantity} ${unit}`}
                </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDecrement}
                    disabled={isMinReached}
                    className="h-9 w-9 p-0"
                >
                    <Minus className="w-4 h-4" />
                </Button>

                <Input
                    type="number"
                    value={quantity}
                    onChange={handleInputChange}
                    className="border-0 text-center font-semibold focus:ring-0 h-9"
                    min={moq}
                    max={maxQuantity}
                />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleIncrement}
                    disabled={isMaxReached}
                    className="h-9 w-9 p-0"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* Info Messages */}
            {quantity < moq && (
                <p className="text-sm text-red-600">
                    ⚠️ Minimum order quantity is {moq} {unit}
                </p>
            )}

            {isMaxReached && (
                <p className="text-sm text-amber-600">
                    ℹ️ Maximum quantity reached for this order
                </p>
            )}
        </div>
    );
}
