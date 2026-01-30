"use client";

import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import { Menu, Bell, Goal, Archive, Package, RefreshCw, Calendar, CheckSquare } from "lucide-react";

// --- Header Component ---
export function AgentHeader() {
    return (
        <div className="bg-zinc-900 text-white pt-6 pb-24 px-6 relative z-0">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
                <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                    <Menu className="text-white w-6 h-6" />
                </button>
                <span className="font-semibold text-lg">Dashboard</span>
                <div className="relative">
                    <Bell className="text-white w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900"></span>
                </div>
            </div>

            {/* Main Stats Area */}
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative mb-6">
                    <CircularProgress
                        value={66}
                        size={180}
                        strokeWidth={12}
                        progressColor="text-amber-500" // Luxury Zinc Accent
                        circleColor="text-zinc-800"
                    >
                        <div className="text-center">
                            <span className="text-4xl font-bold text-white">66%</span>
                            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Monthly Goal</p>
                        </div>
                    </CircularProgress>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-1">₹ 12,37,414</h2>
                    <p className="text-sm text-zinc-400">Of ₹52M Monthly Goal</p>
                </div>

                {/* Secondary Stats Row */}
                <div className="flex items-center justify-around w-full max-w-sm px-2 gap-4">
                    <StatItem
                        icon={<div className="w-1.5 h-3 bg-indigo-500 rounded-sm mx-0.5"></div>}
                        label="Daily Rank"
                        value="2nd"
                    />
                    <StatItem
                        icon={<div className="text-xs font-bold text-zinc-900 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-zinc-900 shadow-lg -mt-2 mb-1">23</div>}
                        label="Of ₹1.5M Goal"
                        value="₹ 8.7L"
                        className="scale-110" // Emphasize center item
                    />
                    <StatItem
                        icon={<div className="w-3 h-4 bg-blue-500 rounded-sm"></div>} // Mock icon
                        label="Of 560K Orders"
                        value="374K"
                    />
                </div>
            </div>
        </div>
    );
}

function StatItem({ icon, label, value, className }: { icon: React.ReactNode, label: string, value: string, className?: string }) {
    return (
        <div className={cn("flex flex-col items-center gap-1", className)}>
            <div className="h-6 flex items-end mb-1">{icon}</div>
            <div className="text-lg font-bold text-zinc-100 leading-none">{value}</div>
            <div className="text-[10px] text-zinc-500 uppercase font-medium tracking-wide">{label}</div>
        </div>
    )
}


// --- Options Grid Component ---
const ACTIONS = [
    { label: "Goals", icon: Goal, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Archive", icon: Archive, bg: "bg-zinc-100", color: "text-zinc-600" },
    { label: "Inventory", icon: Package, bg: "bg-zinc-100", color: "text-zinc-600" },
    { label: "Sync", icon: RefreshCw, bg: "bg-zinc-100", color: "text-zinc-600" },
    { label: "Schedule", icon: Calendar, bg: "bg-zinc-100", color: "text-zinc-600" },
    { label: "Tasks", icon: CheckSquare, bg: "bg-zinc-100", color: "text-zinc-600" },
];

export function OptionsGrid() {
    return (
        <div className="py-6 overflow-x-auto no-scrollbar">
            <h3 className="px-6 text-zinc-900 font-bold mb-4 text-base">Options</h3>
            <div className="flex items-center gap-6 px-6 min-w-max">
                {ACTIONS.map((action, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <button className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95",
                            action.bg
                        )}>
                            <action.icon className={cn("w-6 h-6", action.color)} />
                        </button>
                        <span className="text-xs font-medium text-zinc-500">{action.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Sales Chart Placeholder ---
export function SalesChartWidget() {
    return (
        <div className="px-6 mt-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-zinc-900 font-bold text-base">Sales</h3>
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">79% / 90%</span>
            </div>

            {/* Mock Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-3 px-2">
                {[30, 45, 25, 60, 85, 20].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="w-full bg-zinc-50 rounded-full h-full relative overflow-hidden flex items-end">
                            <div
                                className={cn("w-full rounded-full transition-all duration-700", i === 4 ? "bg-amber-500 shadow-lg shadow-amber-500/30" : "bg-blue-100")}
                                style={{ height: `${h}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">Brand {i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
