"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

interface OrderDetailProps {
    order: Order;
    onBack?: () => void;
    className?: string;
}

export function OrderDetail({ order, onBack, className }: OrderDetailProps) {
    return (
        <Card className={cn("w-full max-w-3xl mx-auto", className)}>
            <CardHeader className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            className="pl-0 mb-2 text-gray-500 hover:text-primary"
                            onClick={onBack}
                        >
                            ← Back to Orders
                        </Button>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            Order #{order.orderNumber}
                            <StatusBadge status={order.status} />
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            Placed on {order.date}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Items List */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Order Items</h3>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.productName}
                                    className="w-16 h-16 object-cover rounded-md bg-white"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium">{item.productName}</h4>
                                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} x ₹{item.price} / {item.unit}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Delivery & Payment Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Delivery Details</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {order.deliveryAddress}
                        </p>
                        {order.estimatedDelivery && (
                            <p className="text-sm font-medium text-green-600 mt-2">
                                Estimated Delivery: {order.estimatedDelivery}
                            </p>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-gray-50 rounded-b-xl flex flex-col sm:flex-row justify-end gap-3 p-6">
                <Button variant="outline" className="w-full sm:w-auto">
                    Download Invoice
                </Button>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary-hover">
                    Track Order
                </Button>
            </CardFooter>
        </Card>
    );
}
