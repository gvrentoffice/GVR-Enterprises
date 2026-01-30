"use client";

import { cn } from "@/lib/utils";
import { MapPin, Navigation, CheckCircle2, Clock } from "lucide-react";

interface RouteStop {
    id: string;
    shopName: string;
    address: string;
    status: "pending" | "completed" | "skipped";
    distance: string;
    timeSlot?: string;
    isNext?: boolean;
}

interface RouteTimelineProps {
    stops: RouteStop[];
    onAction: (id: string, action: "navigate" | "check-in") => void;
}

export function RouteTimeline({ stops, onAction }: RouteTimelineProps) {
    return (
        <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200">
            {stops.map((stop) => (
                <div key={stop.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={cn(
                        "absolute -left-[29px] top-4 w-6 h-6 rounded-full border-4 border-zinc-50 flex items-center justify-center z-10",
                        stop.status === "completed" ? "bg-green-500" :
                            stop.isNext ? "bg-amber-500 ring-4 ring-amber-100" : "bg-zinc-300"
                    )}>
                        {stop.status === "completed" && <CheckCircle2 className="w-3 h-3 text-white" />}
                        {stop.isNext && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                    </div>

                    {/* Card Content */}
                    <div className={cn(
                        "bg-white p-4 rounded-xl border shadow-sm transition-all",
                        stop.isNext ? "border-amber-200 shadow-amber-100/50" : "border-zinc-100",
                        stop.status === "completed" && "opacity-75 grayscale-[0.5]"
                    )}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-zinc-900 text-base">{stop.shopName}</h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> {stop.address}
                                </p>
                            </div>
                            <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full">
                                {stop.distance}
                            </span>
                        </div>

                        {stop.timeSlot && (
                            <div className="text-xs text-amber-600 font-medium mb-3 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {stop.timeSlot}
                            </div>
                        )}

                        {stop.status !== "completed" && (
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => onAction(stop.id, "navigate")}
                                    className="flex-1 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <Navigation className="w-3 h-3" /> Navigate
                                </button>
                                <button
                                    onClick={() => onAction(stop.id, "check-in")}
                                    className="flex-1 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <CheckCircle2 className="w-3 h-3" /> Check In
                                </button>
                            </div>
                        )}

                        {stop.status === "completed" && (
                            <div className="mt-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Visited
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
