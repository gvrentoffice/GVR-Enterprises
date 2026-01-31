"use client";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: OrderStatus | string;
    className?: string;
}

const statusStyles: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
    "Confirmed": "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    "Shipped": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200",
    "Delivered": "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    "Cancelled": "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const style = statusStyles[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";

    return (
        <Badge
            className={cn("border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", style, className)}
        >
            {status}
        </Badge>
    );
}
