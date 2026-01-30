import { cn } from "@/lib/utils";

import { OrderStatus } from "@/lib/types";

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const styles: Record<OrderStatus, string> = {
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
        Shipped: "bg-purple-100 text-purple-700 border-purple-200",
        Delivered: "bg-green-100 text-green-700 border-green-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            styles[status] || "bg-gray-100 text-gray-700",
            className
        )}>
            {status}
        </span>
    );
}
