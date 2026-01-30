import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtitle?: string; // e.g., "12 Lessons" or "Data Research"
    trend?: {
        value: number;
        isPositive: boolean;
        label: string;
    };
    className?: string;
    iconClassName?: string;
}

export function AdminStatCard({
    title,
    value,
    icon: Icon,
    subtitle,
    trend,
    className,
    iconClassName,
}: AdminStatCardProps) {
    return (
        <Card className={cn(
            "overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white",
            className
        )}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center">
                        <Icon className={cn("h-6 w-6 text-zinc-900", iconClassName)} />
                    </div>
                    {(subtitle || trend) && (
                        <div className="text-right">
                            {trend ? (
                                <div className={cn("text-xs font-semibold px-2 py-1 rounded-full inline-block",
                                    trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {trend.isPositive ? "+" : ""}{trend.value}%
                                </div>
                            ) : (
                                <span className="text-xs font-medium text-zinc-400">{subtitle}</span>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-zinc-900">{value}</div>
                    {trend && (
                        <p className="text-xs text-zinc-400 mt-2">
                            {trend.label}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
