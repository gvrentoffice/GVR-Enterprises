"use client";

import { cn } from "@/lib/utils";
import { Phone, MapPin, MoreVertical } from "lucide-react";

interface LeadCardProps {
    name: string;
    shopName: string;
    location: string;
    status: "New" | "Contacted" | "Converted" | "Lost";
    lastVisit?: string;
    phone: string;
    onClick?: () => void;
}

export function LeadCard({ name, shopName, status, lastVisit, onClick }: Omit<LeadCardProps, "location" | "phone">) {
    const statusColors = {
        New: "bg-amber-100 text-amber-700",
        Contacted: "bg-blue-100 text-blue-700",
        Converted: "bg-green-100 text-green-700",
        Lost: "bg-red-100 text-red-700",
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 active:scale-[0.98] transition-transform cursor-pointer relative"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm shadow-inner">
                        {name.substring(0, 1)}
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-900 text-base leading-tight mb-0.5">{shopName}</h4>
                        <span className="text-sm text-zinc-500 font-medium">{name}</span>
                    </div>
                </div>
                <button className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-2 mb-4 pl-1">
                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", statusColors[status])}>
                    {status}
                </span>
                {lastVisit && (
                    <span className="text-[10px] text-zinc-400 font-medium">
                        Last Visit: {lastVisit}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 border-t border-zinc-50 pt-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-50 text-zinc-600 text-xs font-bold hover:bg-zinc-100 transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-50 text-zinc-600 text-xs font-bold hover:bg-zinc-100 transition-colors">
                    <MapPin className="w-3.5 h-3.5" /> Navigate
                </button>
            </div>
        </div>
    );
}
