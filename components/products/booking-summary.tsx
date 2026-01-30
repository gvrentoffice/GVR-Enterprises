"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface BookingSummaryProps {
    product: Product;
    quantity: number;
    onPlaceOrder?: () => void;
    className?: string;
}

/**
 * BookingSummary Component
 * Displays price breakdown, delivery charges, and total amount.
 */
export function BookingSummary({ product, quantity, onPlaceOrder, className }: BookingSummaryProps) {
    const itemTotal = product.price * quantity;
    const deliveryCharge = itemTotal > 500 ? 0 : 40;
    const taxes = Math.round(itemTotal * 0.05); // 5% GST estimate
    const grandTotal = itemTotal + deliveryCharge + taxes;

    return (
        <Card className={cn("border-gray-100 shadow-lg sticky top-8", className)}>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {/* Item Info */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">₹{product.price} x {quantity} {product.unit}</p>
                    </div>
                    <span className="font-bold text-gray-900">₹{itemTotal}</span>
                </div>

                <Separator className="bg-gray-100" />

                {/* Sub-charges */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{itemTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Estimated Taxes (5% GST)</span>
                        <span>₹{taxes}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery Charges</span>
                        <span className={cn(deliveryCharge === 0 ? "text-green-600 font-semibold" : "")}>
                            {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                        </span>
                    </div>
                </div>

                <Separator className="bg-gray-200" />

                {/* Total */}
                <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xl font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{grandTotal}</span>
                </div>

                {/* Savings helper */}
                {deliveryCharge > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
                        Tip: Add products worth <b>₹{500 - itemTotal}</b> more to get <b>FREE delivery</b>!
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-6 pt-0">
                <Button
                    className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-xl shadow-md transition-all hover:scale-[1.02]"
                    onClick={onPlaceOrder}
                >
                    Confirm & Place Order
                </Button>
            </CardFooter>
        </Card>
    );
}
