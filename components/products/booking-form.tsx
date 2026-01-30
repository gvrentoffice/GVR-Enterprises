"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CalendarIcon,
    Minus,
    Plus,
    MapPin,
    Clock,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingFormProps {
    unit: string;
    onQuantityChange?: (quantity: number) => void;
    onSubmit?: (data: BookingFormData) => void;
    className?: string;
}

export interface BookingFormData {
    quantity: number;
    address: string;
    deliveryDate: string;
    notes?: string;
}

/**
 * BookingForm Component
 * Handles quantity selection, address input, and delivery scheduling.
 */
export function BookingForm({ unit, onQuantityChange, onSubmit, className }: BookingFormProps) {
    const [quantity, setQuantity] = React.useState(1);
    const [address, setAddress] = React.useState("");
    const [deliveryDate, setDeliveryDate] = React.useState("");
    const [notes, setNotes] = React.useState("");

    const handleIncrement = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        onQuantityChange?.(newQty);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            onQuantityChange?.(newQty);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.({
            quantity,
            address,
            deliveryDate,
            notes
        });
    };

    return (
        <Card className={cn("border-gray-100 shadow-sm overflow-hidden", className)}>
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quantity Selector */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Select Quantity ({unit})</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-2 border-gray-200"
                                onClick={handleDecrement}
                            >
                                <Minus className="h-5 w-5" />
                            </Button>
                            <div className="flex-1 text-center">
                                <span className="text-2xl font-bold text-primary">{quantity}</span>
                                <span className="text-gray-500 ml-2">{unit}</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-2 border-gray-200"
                                onClick={handleIncrement}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                        <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                            <MapPin className="inline-block w-4 h-4 mr-1 mb-1 text-primary" />
                            Delivery Address
                        </Label>
                        <Textarea
                            id="address"
                            required
                            placeholder="Enter your full door-to-door delivery address..."
                            value={address}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
                            className="min-h-[100px] rounded-xl border-2 border-gray-100 focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Delivery Date */}
                    <div className="space-y-3">
                        <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                            <Clock className="inline-block w-4 h-4 mr-1 mb-1 text-primary" />
                            Preferred Delivery Date
                        </Label>
                        <div className="relative">
                            <Input
                                id="date"
                                type="date"
                                required
                                value={deliveryDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryDate(e.target.value)}
                                className="rounded-xl border-2 border-gray-100 h-12 focus:border-primary pl-10"
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-3">
                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                            <MessageSquare className="inline-block w-4 h-4 mr-1 mb-1 text-primary" />
                            Notes for Agent (Optional)
                        </Label>
                        <Input
                            id="notes"
                            placeholder="e.g. Leave at the gate, call before arrival..."
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                            className="rounded-xl border-2 border-gray-100 h-12 focus:border-primary"
                        />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
