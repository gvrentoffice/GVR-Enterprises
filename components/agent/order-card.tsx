"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Clock, Package } from "lucide-react";

interface OrderCardProps {
    orderId: string;
    shopName: string;
    amount: number;
    status: "Pending" | "Processing" | "Delivered" | "Cancelled";
    date: string;
    itemsCount: number;
    onClick?: () => void;
}

export function OrderCard({ shopName, amount, status, date, itemsCount, onClick }: Omit<OrderCardProps, "orderId">) {
    const statusColors = {
        Pending: "bg-amber-100 text-amber-700",
        Processing: "bg-blue-100 text-blue-700",
        Delivered: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs">
                        {shopName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-900 text-sm">{shopName}</h4>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {date}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", statusColors[status])}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        {itemsCount} Items
                    </span>
                    <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                        ₹{amount.toLocaleString()}
                    </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    );
}
