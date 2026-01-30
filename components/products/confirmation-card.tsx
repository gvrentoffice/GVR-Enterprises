"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationCardProps {
    orderId: string;
    deliveryDate: string;
    className?: string;
    onTrackOrder?: () => void;
    onContinueShopping?: () => void;
}

/**
 * ConfirmationCard Component
 * Shown after a successful booking.
 */
export function ConfirmationCard({
    orderId,
    deliveryDate,
    className,
    onTrackOrder,
    onContinueShopping
}: ConfirmationCardProps) {
    return (
        <Card className={cn("border-none shadow-xl overflow-hidden bg-white max-w-2xl mx-auto", className)}>
            <div className="bg-primary h-2 w-full" />
            <CardContent className="p-8 md:p-12 text-center space-y-8">
                {/* Success Icon */}
                <div className="relative inline-block">
                    <div className="bg-green-100 rounded-full p-6 animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-secondary text-black font-bold text-xs px-2 py-1 rounded-full border-2 border-white shadow-sm">
                        SUCCESS
                    </div>
                </div>

                {/* Header Text */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
                    <p className="text-gray-500 text-lg">
                        Thank you for shopping with Ryth Bazar. Your fresh produce is on its way.
                    </p>
                </div>

                {/* Brief Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary" />
                        <div className="text-left">
                            <p className="text-xs text-gray-400 font-semibold uppercase">Order ID</p>
                            <p className="font-bold text-gray-700">#{orderId}</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div className="text-left">
                            <p className="text-xs text-gray-400 font-semibold uppercase">Est. Delivery</p>
                            <p className="font-bold text-gray-700">{deliveryDate}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        onClick={onTrackOrder}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-xl shadow-lg group"
                    >
                        Track Order Status
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                        onClick={onContinueShopping}
                        variant="outline"
                        className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold h-14 rounded-xl"
                    >
                        Continue Shopping
                    </Button>
                </div>

                <p className="text-sm text-gray-400 italic">
                    A confirmation email has been sent to your registered address.
                </p>
            </CardContent>
        </Card>
    );
}
