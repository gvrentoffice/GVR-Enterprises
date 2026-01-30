"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Order } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

interface OrderCardProps {
    order: Order;
    onViewDetails?: (order: Order) => void;
    className?: string;
}

export function OrderCard({ order, onViewDetails, className }: OrderCardProps) {
    return (
        <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)} onClick={() => onViewDetails?.(order)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                        {order.orderNumber}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {order.date}
                    </CardDescription>
                </div>
                <StatusBadge status={order.status} />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </div>
                    <div className="font-bold text-lg text-primary">
                        ₹{order.totalAmount}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        {order.deliveryAddress.split(',')[0]}...
                    </span>
                    <Button variant="ghost" size="sm" className="ml-auto text-primary hover:text-primary-hover hover:bg-primary/5">
                        View Details →
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
