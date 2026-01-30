"use client";

import { Order } from "@/lib/types";
import { OrderStatusBadge } from "./order-status-badge";
import { ChevronRight, Package } from "lucide-react";

interface OrderCardProps {
    order: Order;
    onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-3 items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">{order.date} • {order.items.length} Items</p>
                    </div>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="flex gap-2 overflow-hidden py-2">
                {order.items.slice(0, 4).map((item) => (
                    <div key={item.productId} className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                        <img
                            src={item.image}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}
                {order.items.length > 4 && (
                    <div className="h-12 w-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{order.items.length - 4}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <p className="text-sm font-semibold text-gray-900">
                    Total: <span className="text-primary">₹{order.totalAmount.toLocaleString()}</span>
                </p>
                <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
